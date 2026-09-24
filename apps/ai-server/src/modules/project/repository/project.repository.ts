import { randomUUID } from "node:crypto"
import { eq } from "drizzle-orm"

import { db } from "../../../db/client.js"
import {
    projects,
    type ProjectRecord,
} from "../../../db/schema/projects.js"

export class ProjectRepository {
    async create(data: {
        name: string
        repositoryPath: string
        defaultBranch?: string
    }): Promise<ProjectRecord> {
        const [project] = await db
            .insert(projects)
            .values({
                id: randomUUID(),

                name:
                    data.name,

                repositoryPath:
                    data.repositoryPath,

                defaultBranch:
                    data.defaultBranch ??
                    "main",
            })
            .returning()

        if (!project) {
            throw new Error(
                "Failed to create project",
            )
        }

        return project
    }

    async findAll(): Promise<
        ProjectRecord[]
    > {
        return db
            .select()
            .from(projects)
            .orderBy(
                projects.createdAt,
            )
    }

    async findById(
        id: string,
    ): Promise<
        ProjectRecord | undefined
    > {
        const [project] =
            await db
                .select()
                .from(projects)
                .where(
                    eq(
                        projects.id,
                        id,
                    ),
                )
                .limit(1)

        return project
    }
}