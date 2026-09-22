import {
    pgEnum,
    pgTable,
    uuid,
    text,
    jsonb,
    timestamp,
} from "drizzle-orm/pg-core"

export const taskStatusEnum = pgEnum("task_status", [
    "planning",
    "ready",
    "running",
    "completed",
    "failed",
])

export const tasks = pgTable("tasks", {
    id: uuid("id").primaryKey(),

    input: text("input").notNull(),

    status: taskStatusEnum("status").notNull(),

    plan: jsonb("plan"),

    error: text("error"),

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