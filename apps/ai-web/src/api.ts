import type {
    AgentRun,
    AgentStep,
    Project,
    Task,
    TaskReview,
} from "./types"

const API_URL =
    "http://localhost:3000"

async function request<T>(
    path: string,
    options?: RequestInit,
): Promise<T> {
    const response =
        await fetch(
            `${API_URL}${path}`,
            options,
        )

    if (!response.ok) {
        throw new Error(
            `Request failed: ${response.status}`,
        )
    }

    return response.json()
}

export function getProjects() {
    return request<Project[]>(
        "/projects",
    )
}

export function createProject(
    input: {
        name: string
        repositoryPath: string
        defaultBranch: string
    },
) {
    return request<Project>(
        "/projects",
        {
            method: "POST",

            headers: {
                "Content-Type":
                    "application/json",
            },

            body:
                JSON.stringify(
                    input,
                ),
        },
    )
}

export function createTask(
    input: {
        projectId: string
        input: string
    },
) {
    return request<Task>(
        "/tasks",
        {
            method: "POST",

            headers: {
                "Content-Type":
                    "application/json",
            },

            body:
                JSON.stringify(
                    input,
                ),
        },
    )
}

export function getTask(
    id: string,
) {
    return request<Task>(
        `/tasks/${id}`,
    )
}

export function runTask(
    id: string,
) {
    return request<Task>(
        `/tasks/${id}/run`,
        {
            method: "POST",
        },
    )
}

export function getRuns(
    taskId: string,
) {
    return request<
        AgentRun[]
    >(
        `/tasks/${taskId}/runs`,
    )
}

export function getSteps(
    runId: string,
) {
    return request<
        AgentStep[]
    >(
        `/tasks/runs/${runId}/steps`,
    )
}

export function getReviews(
    taskId: string,
) {
    return request<
        TaskReview[]
    >(
        `/tasks/${taskId}/reviews`,
    )
}

export function getDiff(
    taskId: string,
) {
    return request<{
        diff: string
    }>(
        `/tasks/${taskId}/diff`,
    )
}

export function reviewTask(
    taskId: string,
    decision:
        | "approve"
        | "reject",
    input: {
        reviewer: string
        comment?: string
    },
) {
    return request<Task>(
        `/tasks/${taskId}/${decision}`,
        {
            method: "POST",

            headers: {
                "Content-Type":
                    "application/json",
            },

            body:
                JSON.stringify(
                    input,
                ),
        },
    )
}