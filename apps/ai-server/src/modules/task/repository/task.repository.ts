import { eq } from "drizzle-orm"
import { db } from "../../../db/client.js"
import { tasks } from "../../../db/schema/tasks.js"
import type { TaskStatus } from "../domain/task.types.js"
import type { TaskPlan } from "../domain/task-plan.schema.js"


export class TaskRepository {
    async create(params: {
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

    async update(
        id: string,
        data: {
            status?: TaskStatus
            plan?: TaskPlan | null
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

    async findById(id: string) {
        const [task] = await db
            .select()
            .from(tasks)
            .where(eq(tasks.id, id))
            .limit(1)

        return task
    }
}