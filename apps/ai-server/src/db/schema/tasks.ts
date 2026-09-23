import {
    pgEnum,
    pgTable,
    uuid,
    text,
    jsonb,
    timestamp,
} from "drizzle-orm/pg-core"
import type { TaskPlan } from "../../modules/task/domain/task-plan.schema.js"

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

    plan: jsonb("plan").$type<TaskPlan>(),

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

export type TaskRecord = typeof tasks.$inferSelect
export type NewTaskRecord = typeof tasks.$inferInsert