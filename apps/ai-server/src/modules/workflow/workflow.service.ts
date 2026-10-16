
import { eq } from "drizzle-orm"
import { drizzle } from "drizzle-orm/node-postgres"

import {
    workflows,
    workflowVersions,
} from "../../db/schema/workflows.js"

type WorkflowDb = ReturnType<typeof drizzle>

export async function publishWorkflow(
    db: WorkflowDb,
    workflowId: string,
    definition: unknown,
) {
    return db.transaction(async (tx) => {
        // 锁定工作流记录
        const [workflow] = await tx
            .select()
            .from(workflows)
            .where(eq(workflows.id, workflowId))
            .for("update")

        if (!workflow) {
            throw new Error("Workflow not found")
        }

        const nextVersion = workflow.latestVersion + 1

        // 创建新版本
        const [published] = await tx
            .insert(workflowVersions)
            .values({
                workflowId,
                version: nextVersion,
                definition,
            })
            .returning()

        // 更新最新版本号
        await tx
            .update(workflows)
            .set({ latestVersion: nextVersion })
            .where(eq(workflows.id, workflowId))

        return published
    })
}
