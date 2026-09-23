import { and, eq } from "drizzle-orm"
import { db } from "../../../db/client.js"
import { tasks, type NewTaskRecord, type TaskRecord } from "../../../db/schema/tasks.js"
import type { UpdateTaskData } from "./task.repository.types.js"
import type { TaskStatus } from "../domain/task.types.js"


export class TaskRepository {
    async create(data: NewTaskRecord): Promise<TaskRecord> {
        const [task] = await db
            .insert(tasks)
            .values(data)
            .returning()

        if (!task) {
            throw new Error("Failed to create task")
        }

        return task
    }

    async update(
        id: string,
        data: UpdateTaskData,
    ): Promise<TaskRecord> {
        const [task] = await db
            .update(tasks)
            .set({
                ...data,
                updatedAt: new Date(),
            })
            .where(eq(tasks.id, id))
            .returning()

        if (!task) {
            throw new Error(`Task not found: ${id}`)
        }

        return task
    }

    async findById(id: string): Promise<TaskRecord | undefined> {
        const [task] = await db
            .select()
            .from(tasks)
            .where(eq(tasks.id, id))
            .limit(1)

        return task
    }

    async transitionStatus(
        id: string,
        from: TaskStatus,
        to: TaskStatus,
    ) {
        const [task] = await db
            .update(tasks)
            .set({
                status: to,
                updatedAt: new Date(),
            })
            .where(
                and(
                    eq(tasks.id, id),
                    eq(tasks.status, from),
                ),
            )
            .returning()

        return task
    }
}