import type { ResponseCreateParamsNonStreaming } from "openai/resources/responses/responses"

import { openai } from "./openai.js"
import { createTools } from "../tool/tool.registry.js"
import type { Workspace } from "../workspace/workspace.types.js"

export type AgentStepResult = {
    stepNumber: number
    toolName: string
    arguments: unknown
    output?: string
    error?: string
    durationMs: number
}

export type AgentModelStep = {
    stepNumber: number
    durationMs: number
    inputTokens: number
    outputTokens: number
    totalTokens: number
}

export type AgentRunResult = {
    result: string

    responseId: string

    steps: AgentStepResult[]

    modelSteps: AgentModelStep[]

    usage: {
        inputTokens: number
        outputTokens: number
        totalTokens: number
    }

    durationMs: number
}

export type AgentStepCallback =
    (
        step: AgentStepResult,
    ) =>
        Promise<void> | void

async function callModel(
    params: ResponseCreateParamsNonStreaming,
    stepNumber: number,
) {
    const startedAt = Date.now()

    const response = await openai.responses.create(params)

    return {
        response,

        modelStep: {
            stepNumber,

            durationMs: Date.now() - startedAt,

            inputTokens:
                response.usage?.input_tokens ?? 0,

            outputTokens:
                response.usage?.output_tokens ?? 0,

            totalTokens:
                response.usage?.total_tokens ?? 0,
        } satisfies AgentModelStep,
    }
}

export async function runAgent(
    input: string,
    context: string | undefined,
    workspace: Workspace,
    maxSteps = 30,
    previousResponseId?: string,
    onStep?: AgentStepCallback,
): Promise<AgentRunResult> {
    const startedAt =
        Date.now()

    const tools =
        createTools(
            workspace,
        )

    const steps:
        AgentStepResult[] = []

    const modelSteps:
        AgentModelStep[] = []

    let inputTokens = 0
    let outputTokens = 0
    let totalTokens = 0

    const addUsage = (
        modelStep:
            AgentModelStep,
    ) => {
        inputTokens +=
            modelStep.inputTokens

        outputTokens +=
            modelStep.outputTokens

        totalTokens +=
            modelStep.totalTokens
    }

    const recordStep =
        async (
            step:
                AgentStepResult,
        ) => {
            steps.push(
                step,
            )

            console.log(
                "[Agent Step]",
                {
                    stepNumber:
                        step.stepNumber,

                    tool:
                        step.toolName,

                    durationMs:
                        step.durationMs,

                    error:
                        step.error,
                },
            )

            if (
                onStep
            ) {
                await onStep(
                    step,
                )
            }
        }

    const firstInput =
        previousResponseId
            ? input
            : `
# Project Context

${context ?? ""}

# Task

${input}
`

    console.log(
        "[Agent] model call",
        {
            mode:
                previousResponseId
                    ? "continue"
                    : "initial",

            maxSteps,
        },
    )

    const firstCall =
        await callModel(
            {
                model:
                    "gpt-5.6",

                ...(previousResponseId
                    ? {
                        previous_response_id:
                            previousResponseId,
                    }
                    : {}),

                input:
                    firstInput,

                tools:
                    tools.map(
                        (
                            tool,
                        ) =>
                            tool.definition,
                    ),
            },
            1,
        )

    let response =
        firstCall.response

    modelSteps.push(
        firstCall.modelStep,
    )

    addUsage(
        firstCall.modelStep,
    )

    for (
        let agentStep = 0;
        agentStep <
        maxSteps;
        agentStep++
    ) {
        const toolCalls =
            response.output.filter(
                (
                    item,
                ) =>
                    item.type ===
                    "function_call",
            )

        if (
            toolCalls.length ===
            0
        ) {
            console.log(
                "[Agent] completed",
                {
                    steps:
                        steps.length,

                    durationMs:
                        Date.now() -
                        startedAt,
                },
            )

            return {
                result:
                    response.output_text,

                responseId:
                    response.id,

                steps,

                modelSteps,

                usage: {
                    inputTokens,
                    outputTokens,
                    totalTokens,
                },

                durationMs:
                    Date.now() -
                    startedAt,
            }
        }

        const toolOutputs = []

        for (
            let toolIndex = 0;
            toolIndex <
            toolCalls.length;
            toolIndex++
        ) {
            const toolCall =
                toolCalls[
                toolIndex
                ]

            if (
                !toolCall
            ) {
                continue
            }

            const tool =
                tools.find(
                    (
                        item,
                    ) =>
                        item
                            .definition
                            .name ===
                        toolCall.name,
                )

            const stepNumber =
                steps.length +
                1

            if (!tool) {
                const message =
                    `Tool not found: ${toolCall.name}`

                await recordStep({
                    stepNumber,

                    toolName:
                        toolCall.name,

                    arguments:
                        toolCall.arguments,

                    error:
                        message,

                    durationMs:
                        0,
                })

                toolOutputs.push(
                    {
                        type:
                            "function_call_output" as const,

                        call_id:
                            toolCall.call_id,

                        output:
                            message,
                    },
                )

                continue
            }

            const toolStartedAt =
                Date.now()

            let args:
                unknown

            try {
                args =
                    JSON.parse(
                        toolCall.arguments,
                    )

                console.log(
                    "[Agent Tool]",
                    toolCall.name,
                    args,
                )

                const toolResult =
                    await tool.execute(
                        args as any,
                    )

                const output =
                    typeof toolResult ===
                        "string"
                        ? toolResult
                        : JSON.stringify(
                            toolResult,
                        )

                await recordStep({
                    stepNumber,

                    toolName:
                        toolCall.name,

                    arguments:
                        args,

                    output,

                    durationMs:
                        Date.now() -
                        toolStartedAt,
                })

                toolOutputs.push(
                    {
                        type:
                            "function_call_output" as const,

                        call_id:
                            toolCall.call_id,

                        output,
                    },
                )
            } catch (
            error
            ) {
                const message =
                    error instanceof
                        Error
                        ? error.message
                        : "Tool execution failed"

                await recordStep({
                    stepNumber,

                    toolName:
                        toolCall.name,

                    arguments:
                        args ??
                        toolCall.arguments,

                    error:
                        message,

                    durationMs:
                        Date.now() -
                        toolStartedAt,
                })

                toolOutputs.push(
                    {
                        type:
                            "function_call_output" as const,

                        call_id:
                            toolCall.call_id,

                        output:
                            `Tool execution failed: ${message}`,
                    },
                )
            }
        }

        console.log(
            "[Agent] continue model",
            {
                responseId:
                    response.id,

                completedSteps:
                    steps.length,
            },
        )

        const nextCall =
            await callModel(
                {
                    model:
                        "gpt-5.6",

                    previous_response_id:
                        response.id,

                    input:
                        toolOutputs,

                    tools:
                        tools.map(
                            (
                                tool,
                            ) =>
                                tool.definition,
                        ),
                },
                modelSteps.length +
                1,
            )

        response =
            nextCall.response

        modelSteps.push(
            nextCall.modelStep,
        )

        addUsage(
            nextCall.modelStep,
        )
    }

    throw new Error(
        `Agent exceeded max steps: ${maxSteps}`,
    )
}