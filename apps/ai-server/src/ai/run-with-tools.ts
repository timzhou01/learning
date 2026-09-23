import type { Workspace } from "../workspace/workspace.types.js"
import { createTools, getTool } from "../tool/tool.registry.js"
import { openai } from "./openai.js"

export async function runAgent(
    input: string,
    workspace: Workspace,
    maxSteps = 10,
) {
    const tools = createTools(workspace)

    let response = await openai.responses.create({
        model: "gpt-5.6",
        input,
        tools: tools.map((tool) => tool.definition),
    })

    for (let step = 0; step < maxSteps; step++) {
        const toolCalls = response.output.filter(
            (item) => item.type === "function_call",
        )

        if (toolCalls.length === 0) {
            return response.output_text
        }

        const toolOutputs = []

        for (const toolCall of toolCalls) {
            const tool = getTool(tools, toolCall.name)

            console.log(
                "tool call:",
                toolCall.name,
                toolCall.arguments,
            )

            if (!tool) {
                toolOutputs.push({
                    type: "function_call_output" as const,
                    call_id: toolCall.call_id,
                    output: `Tool not found: ${toolCall.name}`,
                })

                continue
            }

            try {
                const args = JSON.parse(toolCall.arguments)

                const result = await tool.execute(args)

                toolOutputs.push({
                    type: "function_call_output" as const,
                    call_id: toolCall.call_id,
                    output:
                        typeof result === "string"
                            ? result
                            : JSON.stringify(result),
                })
            } catch (error) {
                toolOutputs.push({
                    type: "function_call_output" as const,
                    call_id: toolCall.call_id,
                    output:
                        error instanceof Error
                            ? `Tool execution failed: ${error.message}`
                            : "Tool execution failed",
                })
            }
        }

        response = await openai.responses.create({
            model: "gpt-5.6",
            previous_response_id: response.id,
            input: toolOutputs,
            tools: tools.map((tool) => tool.definition),
        })
    }

    throw new Error(
        `Agent exceeded max steps: ${maxSteps}`,
    )
}