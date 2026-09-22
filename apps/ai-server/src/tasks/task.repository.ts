import { eq } from "drizzle-orm"
import { db } from "../db/client.js"
import { tasks } from "../db/schema/tasks.js"
import type { TaskPlan } from "./task-plan.schema.js"
import type { TaskStatus } from "./task.types.js"

export async function createTaskRecord(params: {
    id: string
    input: string
    status: TaskStatus
}) {
    const [task] = await db
        .insert(tasks)
        .values(params)
        .returning()

    return task
}

export async function updateTaskRecord(
    id: string,
    data: {
        status?: TaskStatus
        plan?: TaskPlan
        error?: string | null
    },
) {
    const [task] = await db
        .update(tasks)
        .set({
            ...data,
            updatedAt: new Date(),
        })
        .where(eq(tasks.id, id))
        .returning()

    return task
}

export async function getTaskById(id: string) {
    const [task] = await db
        .select()
        .from(tasks)
        .where(eq(tasks.id, id))
        .limit(1)

    return task
}