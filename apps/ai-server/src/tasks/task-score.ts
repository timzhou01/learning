import type { TaskState } from "./task.types.js"

const tasks = new Map<string, TaskState>()

export function saveTask(task: TaskState) {
    tasks.set(task.id, task)
}

export function getTask(id: string) {
    return tasks.get(id)
}