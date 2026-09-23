import { randomUUID } from "crypto"
import type { TaskStatus } from "../domain/task.types.js"
import { canTransition } from "../domain/task.types.js"
import type { TaskRepository } from "../repository/task.repository.js"
import { generateTaskPlan } from "../../../ai/generate-task-plan.js"
import type { TaskPlan } from "../domain/task-plan.schema.js"
import { AgentRunError, AppError } from "../../../common/app.error.js"
import { LocalWorkspace } from "../../../workspace/local-workspace.js"
import { runAgent } from "../../../ai/run-with-tools.js"
import type { AgentRunRepository } from "../repository/agent-run.repository.js"

export class TaskService {
    constructor(
        private readonly taskRepository: TaskRepository,
        private readonly agentRunRepository: AgentRunRepository,
    ) { }

    async runTask(id: string) {
        const task = await this.taskRepository.findById(id)

        if (!task) {
            throw new AppError(`Task not found: ${id}`, 404)
        }

        if (!canTransition(task.status, "running")) {
            throw new AppError(
                `Invalid task status transition: ${task.status} -> running`,
                409,
            )
        }

        await this.taskRepository.update(id, {
            status: "running",
            error: null,
        })

        const run =
            await this.agentRunRepository.createRun(id)

        const workspace = new LocalWorkspace(
            process.cwd(),
        )

        try {
            const agentResult = await runAgent(
                task.input,
                workspace,
            )

            // 保存所有 Tool Trace
            for (const step of agentResult.steps) {
                await this.agentRunRepository.createStep({
                    runId: run.id,
                    stepNumber: step.stepNumber,
                    toolName: step.toolName,
                    arguments: step.arguments,
                    output: step.output ?? null,
                    error: step.error ?? null,
                    durationMs: step.durationMs,
                })
            }

            // 更新 Agent Run
            await this.agentRunRepository.updateRun(
                run.id,
                {
                    status: "completed",

                    result: agentResult.result,

                    error: null,

                    durationMs:
                        agentResult.durationMs,

                    inputTokens:
                        agentResult.usage.inputTokens,

                    outputTokens:
                        agentResult.usage.outputTokens,

                    totalTokens:
                        agentResult.usage.totalTokens,
                },
            )

            // 更新 Task
            return await this.taskRepository.update(
                id,
                {
                    status: "completed",
                    result: agentResult.result,
                    error: null,
                },
            )
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : "Unknown error"

            await this.agentRunRepository.updateRun(
                run.id,
                {
                    status: "failed",
                    error: message,
                },
            )

            return await this.taskRepository.update(
                id,
                {
                    status: "failed",
                    error: message,
                },
            )
        }
    }

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
            throw new AppError(
                `Invalid task status transition: ${currentStatus} -> ${nextStatus}`,
                409,
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
        const task = await this.taskRepository.findById(id)

        if (!task) {
            throw new AppError(`Task not found: ${id}`, 404)
        }

        return task
    }
}