import type { Workspace } from "../workspace/workspace.types.js"
import { createTools } from "../tool/tool.registry.js"
import { openai } from "./openai.js"

export type AgentStepResult = {
    stepNumber: number
    toolName: string
    arguments: unknown
    output?: string
    error?: string
}

export type AgentRunResult = {
    result: string
    steps: AgentStepResult[]
    usage: {
        inputTokens: number
        outputTokens: number
        totalTokens: number
    }

    durationMs: number
}

export async function runAgent(
    input: string,
    workspace: Workspace,
    maxSteps = 10,
): Promise<AgentRunResult> {
    const startedAt = Date.now()

    const tools = createTools(workspace)

    const steps: AgentStepResult[] = []

    let inputTokens = 0
    let outputTokens = 0
    let totalTokens = 0

    let response = await openai.responses.create({
        model: "gpt-5.6",
        input,
        tools: tools.map((tool) => tool.definition),
    })

    const collectUsage = () => {
        if (!response.usage) {
            return
        }

        inputTokens += response.usage.input_tokens
        outputTokens += response.usage.output_tokens
        totalTokens += response.usage.total_tokens
    }

    collectUsage()

    for (let step = 0; step < maxSteps; step++) {
        const toolCalls = response.output.filter(
            (item) => item.type === "function_call",
        )

        if (toolCalls.length === 0) {
            return {
                result: response.output_text,
                steps,

                usage: {
                    inputTokens,
                    outputTokens,
                    totalTokens,
                },

                durationMs: Date.now() - startedAt,
            }
        }

        const toolOutputs = []

        for (const toolCall of toolCalls) {
            const tool = tools.find(
                (item) =>
                    item.definition.name === toolCall.name,
            )

            if (!tool) {
                const error = `Tool not found: ${toolCall.name}`

                steps.push({
                    stepNumber: step + 1,
                    toolName: toolCall.name,
                    arguments: toolCall.arguments,
                    error,
                })

                toolOutputs.push({
                    type: "function_call_output" as const,
                    call_id: toolCall.call_id,
                    output: error,
                })

                continue
            }

            let args: any

            try {
                args = JSON.parse(toolCall.arguments)

                const toolResult =
                    await tool.execute(args)

                const output =
                    typeof toolResult === "string"
                        ? toolResult
                        : JSON.stringify(toolResult)

                steps.push({
                    stepNumber: step + 1,
                    toolName: toolCall.name,
                    arguments: args,
                    output,
                })

                toolOutputs.push({
                    type: "function_call_output" as const,
                    call_id: toolCall.call_id,
                    output,
                })
            } catch (error) {
                const message =
                    error instanceof Error
                        ? error.message
                        : "Tool execution failed"

                steps.push({
                    stepNumber: step + 1,
                    toolName: toolCall.name,
                    arguments:
                        args ?? toolCall.arguments,
                    error: message,
                })

                toolOutputs.push({
                    type: "function_call_output" as const,
                    call_id: toolCall.call_id,
                    output:
                        `Tool execution failed: ${message}`,
                })
            }
        }

        response = await openai.responses.create({
            model: "gpt-5.6",
            previous_response_id: response.id,
            input: toolOutputs,
            tools: tools.map(
                (tool) => tool.definition,
            ),
        })

        collectUsage()
    }

    throw new Error(
        `Agent exceeded max steps: ${maxSteps}`,
    )
}