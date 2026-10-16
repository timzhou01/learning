
import { eq } from "drizzle-orm"
import { drizzle } from "drizzle-orm/node-postgres"

import { workflowVersions } from "../../db/schema/workflows.js"
import { workflowExecutions } from "../../db/schema/workflow-executions.js"

type WorkflowDb = ReturnType<typeof drizzle>

export async function startWorkflow(
    db: WorkflowDb,
    workflowVersionId: string,
    input: unknown,
    idempotencyKey: string,
) {
    return db.transaction(async (tx) => {
        // 1. 检查已有执行实例
        const [existing] = await tx
            .select()
            .from(workflowExecutions)
            .where(eq(workflowExecutions.idempotencyKey, idempotencyKey))

        if (existing) {
            return existing
        }

        // 2. 检查工作流版本
        const [version] = await tx
            .select({ id: workflowVersions.id })
            .from(workflowVersions)
            .where(eq(workflowVersions.id, workflowVersionId))

        if (!version) {
            throw new Error("Workflow version not found")
        }

        // 3. 创建执行实例
        const [execution] = await tx
            .insert(workflowExecutions)
            .values({
                workflowVersionId,
                input,
                idempotencyKey,
                status: "pending",
            })
            .onConflictDoNothing({
                target: workflowExecutions.idempotencyKey,
            })
            .returning()

        if (execution) {
            return execution
        }

        // 4. 并发冲突时重新查询
        const [result] = await tx
            .select()
            .from(workflowExecutions)
            .where(eq(workflowExecutions.idempotencyKey, idempotencyKey))

        if (!result) {
            throw new Error("Execution not found after conflict")
        }

        return result
    })
}
