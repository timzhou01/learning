
import { eq } from "drizzle-orm"
import { drizzle } from "drizzle-orm/node-postgres"

import {
    workflowVersions,
} from "../../db/schema/workflows.js"

import {
    workflowExecutions,
} from "../../db/schema/workflow-executions.js"

type WorkflowDb = ReturnType<typeof drizzle>

export async function startWorkflow(
    db: WorkflowDb,
    workflowVersionId: string,
    input: unknown,
) {
    return db.transaction(async (tx) => {
        // 1. 检查版本是否存在
        const [version] = await tx
            .select({ id: workflowVersions.id })
            .from(workflowVersions)
            .where(eq(workflowVersions.id, workflowVersionId))

        if (!version) {
            throw new Error("Workflow version not found")
        }

        // 2. 创建执行实例
        const [execution] = await tx
            .insert(workflowExecutions)
            .values({
                workflowVersionId,
                input,
                status: "pending",
            })
            .returning()

        return execution
    })
}
