import type { TaskPlan } from "./task-plan.schema.js"

export type TaskStatus =
    | "planning"
    | "ready"
    | "running"
    | "completed"
    | "failed"

export type TaskState = {
    id: string
    input: string
    status: TaskStatus
    plan?: TaskPlan
    error?: string
}