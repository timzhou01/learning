
import {
    pgTable,
    uuid,
    text,
    integer,
    jsonb,
    timestamp,
    uniqueIndex,
} from "drizzle-orm/pg-core"

export const workflows = pgTable("workflows", {
    id: uuid("id").primaryKey().defaultRandom(),

    name: text("name").notNull(),

    latestVersion: integer("latest_version")
        .notNull()
        .default(0),

    createdAt: timestamp("created_at", {
        withTimezone: true,
    }).notNull().defaultNow(),
})

export const workflowVersions = pgTable(
    "workflow_versions",
    {
        id: uuid("id").primaryKey().defaultRandom(),

        workflowId: uuid("workflow_id")
            .notNull()
            .references(() => workflows.id),

        version: integer("version").notNull(),

        definition: jsonb("definition").notNull(),

        createdAt: timestamp("created_at", {
            withTimezone: true,
        }).notNull().defaultNow(),
    },
    (table) => [
        uniqueIndex("workflow_versions_unique")
            .on(table.workflowId, table.version),
    ],
)
