
import {
    pgEnum,
    pgTable,
    uuid,
    jsonb,
    text,
    timestamp,
    index,
} from "drizzle-orm/pg-core"

import { workflowVersions } from "./workflows.js"

export const workflowExecutionStatus = pgEnum(
    "workflow_execution_status",
    [
        "pending",
        "running",
        "completed",
        "failed",
        "cancelled",
    ],
)

export const workflowExecutions = pgTable(
    "workflow_executions",
    {
        id: uuid("id").primaryKey().defaultRandom(),

        workflowVersionId: uuid("workflow_version_id")
            .notNull()
            .references(() => workflowVersions.id),

        status: workflowExecutionStatus("status")
            .notNull()
            .default("pending"),

        input: jsonb("input").notNull(),

        output: jsonb("output"),

        error: text("error"),

        createdAt: timestamp("created_at", {
            withTimezone: true,
        }).notNull().defaultNow(),

        startedAt: timestamp("started_at", {
            withTimezone: true,
        }),

        finishedAt: timestamp("finished_at", {
            withTimezone: true,
        }),
    },
    (table) => [
        index("workflow_executions_version_idx")
            .on(table.workflowVersionId),
    ],
)
