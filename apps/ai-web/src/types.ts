export type Project = {
    id: string
    name: string
    repositoryPath: string
    defaultBranch: string
}

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

export type TaskPlan = {
    summary?: string
    steps?: string[]
}

export type Task = {
    id: string
    projectId: string
    input: string
    status: TaskStatus

    plan?: TaskPlan | null
    result?: string | null
    error?: string | null
    selectedRules: string[] | null
}

export type ValidationResult = {
    name: string
    passed: boolean
    output: string
    durationMs: number
}

export type ValidationAttempt = {
    attempt: number
    type: "initial" | "repair"
    results: ValidationResult[]
}

export type AgentRun = {
    id: string
    taskId: string
    status: string

    result?: string | null
    error?: string | null

    durationMs?: number | null

    inputTokens?: number | null
    outputTokens?: number | null
    totalTokens?: number | null

    validationResults?:
    | ValidationResult[]
    | null

    validationAttempts?:
    | ValidationAttempt[]
    | null
}

export type AgentStep = {
    id: string
    runId: string

    attempt: number
    phase:
    | "initial"
    | "repair"

    stepNumber: number
    toolName: string

    arguments: unknown

    output?: string | null
    error?: string | null

    durationMs?: number | null
}

export type TaskReview = {
    id: string
    taskId: string

    decision:
    | "approved"
    | "rejected"

    reviewer: string

    comment?: string | null
    createdAt?: string
}

export type WorkbenchStep =
    | "task"
    | "plan"
    | "execute"
    | "validate"
    | "review"

export type ProcessState =
    | "active"
    | "completed"
    | "pending"
    | "failed"

export type AgentStepGroup = {
    attempt: number

    phase:
    | "initial"
    | "repair"

    steps: AgentStep[]
}