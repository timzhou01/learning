import { randomUUID } from "crypto"
import type { TaskStatus } from "../domain/task.types.js"
import { canTransition } from "../domain/task.types.js"
import type { TaskRepository } from "../repository/task.repository.js"
import { generateTaskPlan } from "../../../ai/generate-task-plan.js"
import type { TaskPlan } from "../domain/task-plan.schema.js"

export class TaskService {
    constructor(
        private readonly taskRepository: TaskRepository,
    ) { }

    async createTask(input: string) {
        const id = randomUUID()

        const task = await this.taskRepository.create({
            id,
            input,
            status: "planning",
        })

        void this.generatePlan(id, input)

        return task
    }


    private async transition(
        id: string,
        nextStatus: TaskStatus,
        data?: {
            plan?: TaskPlan | null
            error?: string | null
        },
    ) {
        const task = await this.taskRepository.findById(id)

        if (!task) {
            throw new Error(`Task not found: ${id}`)
        }

        const currentStatus = task.status as TaskStatus

        if (!canTransition(currentStatus, nextStatus)) {
            throw new Error(
                `Invalid task status transition: ${currentStatus} -> ${nextStatus}`,
            )
        }

        return this.taskRepository.update(id, {
            status: nextStatus,
            ...data,
        })
    }

    private async generatePlan(
        id: string,
        input: string,
    ): Promise<void> {
        try {
            const plan = await generateTaskPlan(input)

            await this.transition(id, "ready", {
                plan,
                error: null,
            })
        } catch (error) {
            await this.transition(id, "failed", {
                error:
                    error instanceof Error
                        ? error.message
                        : "Unknown error",
            })
        }
    }

    async getTaskById(id: string) {
        return this.taskRepository.findById(id)
    }
}