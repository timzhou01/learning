import { TaskPlanSchema, type TaskPlan } from "../modules/task/domain/task-plan.schema.js"
import { openai } from "./openai.js"
import { zodTextFormat } from "openai/helpers/zod"

export async function generateTaskPlan(
    input: string,
): Promise<TaskPlan> {
    const response = await openai.responses.parse({
        model: "gpt-5.6",

        instructions: `
You are a software engineering task planner.

Your job is ONLY to create an execution plan.

Do not execute the task.
Do not inspect files.
Do not claim that tools are unavailable.
Do not ask the user to provide repository contents.

Assume that the execution agent will have repository tools available later,
including file listing, code search, and file reading.

Create a concise plan describing what the execution agent should do.

Risks should describe real implementation risks,
such as unclear architecture, hidden dependencies, test failures,
or unintended side effects.
`,

        input,

        text: {
            format: zodTextFormat(
                TaskPlanSchema,
                "task_plan",
            ),
        },
    })

    if (!response.output_parsed) {
        throw new Error(
            "Failed to generate task plan",
        )
    }

    return response.output_parsed
}