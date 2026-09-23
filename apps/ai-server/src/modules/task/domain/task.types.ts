import type { TaskPlan } from "./task-plan.schema.js"

export type TaskStatus =
    | "planning"
    | "ready"
    | "running"
    | "waiting_approval"
    | "approving"
    | "rejecting"
    | "approved"
    | "rejected"
    | "failed"

export type TaskState = {
    id: string
    input: string
    status: TaskStatus
    plan?: TaskPlan
    error?: string
}

export const allowedTransitions: Record<TaskStatus, TaskStatus[]> = {
    planning: ["ready", "failed"],

    ready: ["running", "failed"],

    running: ["waiting_approval", "failed"],

    waiting_approval: [
        "approving",
        "rejecting",
    ],

    approving: [
        "approved",
        "waiting_approval",
    ],

    rejecting: [
        "rejected",
        "waiting_approval",
    ],

    approved: [],

    rejected: [],

    failed: [],
}

export function canTransition(
    from: TaskStatus,
    to: TaskStatus,
): boolean {
    return allowedTransitions[from].includes(to)
}