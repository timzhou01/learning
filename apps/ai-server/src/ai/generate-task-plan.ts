import { TaskPlanSchema, type TaskPlan } from "../modules/task/domain/task-plan.schema.js"
import { openai } from "./openai.js"
import { zodTextFormat } from "openai/helpers/zod"

export async function generateTaskPlan(
    task: string
): Promise<TaskPlan> {
    const response = await openai.responses.parse({
        model: "gpt-5.6",

        instructions: `
You are a software engineering task planner.
Analyze the user's development task.
Return a concise implementation plan.
`,

        input: task,

        text: {
            format: zodTextFormat(TaskPlanSchema, "task_plan"),
        },
    })

    if (!response.output_parsed) {
        throw new Error("Failed to generate task plan")
    }

    return response.output_parsed
}