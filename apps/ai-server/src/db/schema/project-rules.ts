import {
    pgTable,
    text,
    timestamp,
    uuid,
} from "drizzle-orm/pg-core"

import {
    projects,
} from "./projects.js"

export const projectRules =
    pgTable(
        "project_rules",
        {
            id: uuid("id")
                .primaryKey(),

            projectId: uuid(
                "project_id",
            )
                .notNull()
                .references(
                    () =>
                        projects.id,
                ),

            type: text("type")
                .notNull(),

            content: text(
                "content",
            )
                .notNull(),

            createdAt: timestamp(
                "created_at",
                {
                    withTimezone:
                        true,
                },
            )
                .notNull()
                .defaultNow(),

            updatedAt: timestamp(
                "updated_at",
                {
                    withTimezone:
                        true,
                },
            )
                .notNull()
                .defaultNow(),
        },
    )

export type ProjectRuleRecord =
    typeof projectRules.$inferSelect

export type NewProjectRuleRecord =
    typeof projectRules.$inferInsert