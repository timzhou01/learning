import type { TaskState } from "./task.types.js"
import { generateTaskPlan } from "../ai/generate-task-plan.js"

import { z } from "zod"

export const CreateTaskSchema = z.object({
    input: z.string().min(1),
})

export type CreateTaskInput = z.infer<typeof CreateTaskSchema>

export async function createTask(input: string): Promise<TaskState> {
    const task: TaskState = {
        id: crypto.randomUUID(),
        input,
        status: "planning",
    }

    try {
        const plan = await generateTaskPlan(input)

        task.plan = plan
        task.status = "ready"

        return task
    } catch (error) {
        task.status = "failed"
        task.error =
            error instanceof Error ? error.message : "Unknown error"

        return task
    }
}