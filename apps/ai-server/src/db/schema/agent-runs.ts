import {
    pgTable,
    uuid,
    text,
    timestamp,
    integer,
    jsonb,
} from "drizzle-orm/pg-core"

import { tasks } from "./tasks.js"

export const agentRuns = pgTable("agent_runs", {
    id: uuid("id").primaryKey(),

    taskId: uuid("task_id")
        .notNull()
        .references(() => tasks.id),

    status: text("status").notNull(),

    result: text("result"),

    error: text("error"),

    durationMs: integer("duration_ms"),

    inputTokens: integer("input_tokens"),

    outputTokens: integer("output_tokens"),

    totalTokens: integer("total_tokens"),

    validationResults: jsonb("validation_results"),

    validationAttempts: jsonb("validation_attempts"),

    createdAt: timestamp("created_at", {
        withTimezone: true,
    })
        .notNull()
        .defaultNow(),

    updatedAt: timestamp("updated_at", {
        withTimezone: true,
    })
        .notNull()
        .defaultNow(),
})