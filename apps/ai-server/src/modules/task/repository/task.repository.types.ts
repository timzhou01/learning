import type { TaskPlan } from "../domain/task-plan.schema.js"
import type { TaskStatus } from "../domain/task.types.js"

export type UpdateTaskData = {
    status?: TaskStatus
    plan?: TaskPlan | null
    result?: string | null
    error?: string | null
}