import { randomUUID } from "node:crypto"
import { eq } from "drizzle-orm"

import { db } from "../../../db/client.js"
import { agentRuns } from "../../../db/schema/agent-runs.js"
import { agentSteps } from "../../../db/schema/agent-steps.js"

export class AgentRunRepository {
    async createRun(taskId: string) {
        const [run] = await db
            .insert(agentRuns)
            .values({
                id: randomUUID(),
                taskId,
                status: "running",
            })
            .returning()

        if (!run) {
            throw new Error("Failed to create agent run")
        }

        return run
    }

    async findRunsByTaskId(taskId: string) {
        return db
            .select()
            .from(agentRuns)
            .where(eq(agentRuns.taskId, taskId))
            .orderBy(agentRuns.createdAt)
    }

    async findStepsByRunId(runId: string) {
        return db
            .select()
            .from(agentSteps)
            .where(eq(agentSteps.runId, runId))
            .orderBy(agentSteps.stepNumber)
    }

    async createStep(params: {
        runId: string
        stepNumber: number
        toolName: string
        arguments: unknown
        output?: string | null
        error?: string | null
    }) {
        const [step] = await db
            .insert(agentSteps)
            .values({
                id: randomUUID(),
                ...params,
            })
            .returning()

        if (!step) {
            throw new Error("Failed to create agent step")
        }

        return step
    }

    async updateRun(
        id: string,
        data: {
            status?: "running" | "completed" | "failed"
            result?: string | null
            error?: string | null
        },
    ) {
        const [run] = await db
            .update(agentRuns)
            .set({
                ...data,
                updatedAt: new Date(),
            })
            .where(eq(agentRuns.id, id))
            .returning()

        if (!run) {
            throw new Error(`Agent run not found: ${id}`)
        }

        return run
    }
}