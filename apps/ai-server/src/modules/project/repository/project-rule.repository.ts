import {
    randomUUID,
} from "node:crypto"

import {
    and,
    eq,
} from "drizzle-orm"

import {
    db,
} from "../../../db/client.js"

import {
    projectRules,
    type ProjectRuleRecord,
} from "../../../db/schema/project-rules.js"

export class ProjectRuleRepository {
    async create(data: {
        projectId: string
        type: string
        content: string
    }): Promise<ProjectRuleRecord> {
        const [rule] =
            await db
                .insert(
                    projectRules,
                )
                .values({
                    id:
                        randomUUID(),

                    projectId:
                        data.projectId,

                    type:
                        data.type,

                    content:
                        data.content,
                })
                .returning()

        if (!rule) {
            throw new Error(
                "Failed to create project rule",
            )
        }

        return rule
    }

    async findByProjectId(
        projectId: string,
    ): Promise<
        ProjectRuleRecord[]
    > {
        return db
            .select()
            .from(
                projectRules,
            )
            .where(
                eq(
                    projectRules.projectId,
                    projectId,
                ),
            )
            .orderBy(
                projectRules.createdAt,
            )
    }

    async findByProjectIdAndType(
        projectId: string,
        type: string,
    ): Promise<
        ProjectRuleRecord[]
    > {
        return db
            .select()
            .from(
                projectRules,
            )
            .where(
                and(
                    eq(
                        projectRules.projectId,
                        projectId,
                    ),

                    eq(
                        projectRules.type,
                        type,
                    ),
                ),
            )
            .orderBy(
                projectRules.createdAt,
            )
    }
}