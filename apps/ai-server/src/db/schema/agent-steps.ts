import {
    pgTable,
    uuid,
    text,
    jsonb,
    timestamp,
    integer,
} from "drizzle-orm/pg-core"

import { agentRuns } from "./agent-runs.js"

export const agentSteps = pgTable("agent_steps", {
    id: uuid("id").primaryKey(),

    runId: uuid("run_id")
        .notNull()
        .references(() => agentRuns.id),

    stepNumber: integer("step_number").notNull(),

    toolName: text("tool_name").notNull(),

    arguments: jsonb("arguments"),

    output: text("output"),

    error: text("error"),

    durationMs: integer("duration_ms"),

    createdAt: timestamp("created_at", {
        withTimezone: true,
    })
        .notNull()
        .defaultNow(),
})