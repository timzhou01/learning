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
import { WorkspaceManager } from "../../../workspace/workspace-manager.js"
import type { TaskReviewRepository } from "../repository/task-review.repository.js"
import { WorkspaceValidator } from "../../../workspace/workspace-validator.js"
import type { Workspace } from "../../../workspace/workspace.types.js"

async function runAgentWithValidation(
    input: string,
    workspacePath: string,
    workspace: Workspace,
    maxRepairAttempts = 2,
) {
    const validator =
        new WorkspaceValidator()

    let agentResult =
        await runAgent(
            input,
            workspace,
        )

    for (
        let attempt = 0;
        attempt <= maxRepairAttempts;
        attempt++
    ) {
        const validationResults =
            await validator.validate(
                workspacePath,
                workspace,
            )

        const failed =
            validationResults.filter(
                (result) => !result.passed,
            )

        if (failed.length === 0) {
            return {
                agentResult,
                validationResults,
            }
        }

        if (attempt === maxRepairAttempts) {
            throw new Error(
                [
                    "Validation failed after repair attempts.",
                    ...failed.map(
                        (item) =>
                            `${item.name}:\n${item.output}`,
                    ),
                ].join("\n\n"),
            )
        }

        const repairInput = [
            "The implementation failed system validation.",
            "Inspect the errors below and fix the code.",
            "Do not undo unrelated changes.",
            "After fixing, finish the task normally.",
            "",
            ...failed.map(
                (item) =>
                    `${item.name} failed:\n${item.output}`,
            ),
        ].join("\n")

        agentResult =
            await runAgent(
                repairInput,
                workspace,
            )
    }

    throw new Error(
        "Unexpected validation state",
    )
}

export class TaskService {
    constructor(
        private readonly taskRepository: TaskRepository,
        private readonly agentRunRepository: AgentRunRepository,
        private readonly taskReviewRepository: TaskReviewRepository,
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

        // const workspace = new LocalWorkspace(
        //     process.cwd(),
        // )
        const sourceRepo =
            process.env.AGENT_SOURCE_REPO

        const workspaceBase =
            process.env.AGENT_WORKSPACE_BASE

        if (!sourceRepo || !workspaceBase) {
            throw new AppError(
                "Agent workspace configuration is missing",
                500,
            )
        }

        const workspaceManager =
            new WorkspaceManager(
                sourceRepo,
                workspaceBase,
            )

        const workspacePath =
            await workspaceManager.createWorkspace(id)

        await workspaceManager.prepareWorkspace(
            workspacePath,
        )

        const workspace =
            new LocalWorkspace(workspacePath)

        try {
            const {
                agentResult,
                validationResults,
            } = await runAgentWithValidation(
                task.input,
                workspacePath,
                workspace,
            )


            const commitHash =
                await workspaceManager.commitChanges(
                    workspacePath,
                    `agent task ${id}`,
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
                    status: "waiting_approval",
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

    async approveTask(
        id: string,
        reviewer: string,
        comment?: string,
    ) {
        const task =
            await this.taskRepository.findById(id)

        if (!task) {
            throw new AppError(
                `Task not found: ${id}`,
                404,
            )
        }

        if (task.status === "approved") {
            return task
        }

        const approvingTask =
            await this.taskRepository.transitionStatus(
                id,
                "waiting_approval",
                "approving",
            )

        if (!approvingTask) {
            throw new AppError(
                "Task approval conflict",
                409,
            )
        }

        const sourceRepo =
            process.env.AGENT_SOURCE_REPO

        const workspaceBase =
            process.env.AGENT_WORKSPACE_BASE

        if (!sourceRepo || !workspaceBase) {
            await this.taskRepository.transitionStatus(
                id,
                "approving",
                "waiting_approval",
            )

            throw new AppError(
                "Agent workspace configuration is missing",
                500,
            )
        }

        const workspaceManager =
            new WorkspaceManager(
                sourceRepo,
                workspaceBase,
            )

        let merged = false

        try {
            await workspaceManager.approveTask(id)

            merged = true

            await this.taskReviewRepository.createReview({
                taskId: id,
                decision: "approved",
                reviewer,
                ...(comment !== undefined
                    ? { comment }
                    : {}),
            })

            const approvedTask =
                await this.taskRepository.transitionStatus(
                    id,
                    "approving",
                    "approved",
                )

            if (!approvedTask) {
                throw new Error(
                    "Failed to finalize approval state",
                )
            }

            return approvedTask
        } catch (error) {
            if (!merged) {
                await this.taskRepository.transitionStatus(
                    id,
                    "approving",
                    "waiting_approval",
                )
            }

            throw error
        }
    }

    async getTaskReviews(id: string) {
        const task =
            await this.taskRepository.findById(id)

        if (!task) {
            throw new AppError(
                `Task not found: ${id}`,
                404,
            )
        }

        return this.taskReviewRepository.findByTaskId(id)
    }

    async rejectTask(
        id: string,
        reviewer: string,
        comment?: string,
    ) {
        const task =
            await this.taskRepository.findById(id)

        if (!task) {
            throw new AppError(
                `Task not found: ${id}`,
                404,
            )
        }

        if (task.status === "rejected") {
            return task
        }

        const rejectingTask =
            await this.taskRepository.transitionStatus(
                id,
                "waiting_approval",
                "rejecting",
            )

        if (!rejectingTask) {
            throw new AppError(
                "Task rejection conflict",
                409,
            )
        }

        const sourceRepo =
            process.env.AGENT_SOURCE_REPO

        const workspaceBase =
            process.env.AGENT_WORKSPACE_BASE

        if (!sourceRepo || !workspaceBase) {
            await this.taskRepository.transitionStatus(
                id,
                "rejecting",
                "waiting_approval",
            )

            throw new AppError(
                "Agent workspace configuration is missing",
                500,
            )
        }

        const workspaceManager =
            new WorkspaceManager(
                sourceRepo,
                workspaceBase,
            )

        try {
            await workspaceManager.rejectTask(id)

            await this.taskReviewRepository.createReview({
                taskId: id,
                decision: "rejected",
                reviewer,
                ...(comment !== undefined
                    ? { comment }
                    : {}),
            })

            const rejectedTask =
                await this.taskRepository.transitionStatus(
                    id,
                    "rejecting",
                    "rejected",
                )

            if (!rejectedTask) {
                throw new AppError(
                    "Failed to finalize task rejection",
                    409,
                )
            }

            return rejectedTask
        } catch (error) {
            await this.taskRepository.transitionStatus(
                id,
                "rejecting",
                "waiting_approval",
            )

            throw error
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

    async getTaskDiff(id: string) {
        const task =
            await this.taskRepository.findById(id)

        if (!task) {
            throw new AppError(
                `Task not found: ${id}`,
                404,
            )
        }

        const workspaceBase =
            process.env.AGENT_WORKSPACE_BASE

        if (!workspaceBase) {
            throw new AppError(
                "Agent workspace configuration is missing",
                500,
            )
        }

        const workspacePath =
            `${workspaceBase}/${id}`

        const workspace =
            new LocalWorkspace(workspacePath)

        return {
            diff: await workspace.getGitDiffFromBase(),
        }
    }
}