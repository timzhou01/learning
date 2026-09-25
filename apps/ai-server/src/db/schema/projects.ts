import {
    pgTable,
    text,
    timestamp,
    uuid,
} from "drizzle-orm/pg-core"

export const projects = pgTable(
    "projects",
    {
        id: uuid("id")
            .primaryKey(),

        name: text("name")
            .notNull(),

        repositoryPath: text(
            "repository_path",
        )
            .notNull(),

        defaultBranch: text(
            "default_branch",
        )
            .notNull()
            .default("main"),



        createdAt: timestamp(
            "created_at",
            {
                withTimezone: true,
            },
        )
            .notNull()
            .defaultNow(),

        updatedAt: timestamp(
            "updated_at",
            {
                withTimezone: true,
            },
        )
            .notNull()
            .defaultNow(),
    },
)

export type ProjectRecord =
    typeof projects.$inferSelect

export type NewProjectRecord =
    typeof projects.$inferInsert