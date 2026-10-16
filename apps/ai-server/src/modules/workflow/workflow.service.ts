
import { eq, sql } from "drizzle-orm"

import { db } from "../../db/client.js"

import {
    workflows,
    workflowVersions,
} from "../../db/schema/workflows.js"

export async function publishWorkflow(
    workflowId: string,
    definition: unknown,
) {
    return db.transaction(async (tx) => {
        // 1. 查询并锁定工作流
        const [workflow] = await tx
            .select()
            .from(workflows)
            .where(eq(workflows.id, workflowId))
            .for("update")

        if (!workflow) {
            throw new Error("Workflow not found")
        }

        // 2. 计算下一个版本
        const nextVersion = workflow.latestVersion + 1

        // 3. 创建不可变版本记录
        const [published] = await tx
            .insert(workflowVersions)
            .values({
                workflowId,
                version: nextVersion,
                definition,
            })
            .returning()

        // 4. 更新工作流最新版本
        await tx
            .update(workflows)
            .set({
                latestVersion: nextVersion,
            })
            .where(eq(workflows.id, workflowId))

        return published
    })
}
