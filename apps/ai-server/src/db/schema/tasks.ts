import {
    pgEnum,
    pgTable,
    uuid,
    text,
    jsonb,
    timestamp,
} from "drizzle-orm/pg-core"

import type {
    TaskPlan,
} from "../../modules/task/domain/task-plan.schema.js"

import {
    projects,
} from "./projects.js"

export const taskStatusEnum = pgEnum(
    "task_status",
    [
        "planning",
        "ready",
        "running",
        "waiting_approval",
        "approving",
        "rejecting",
        "approved",
        "rejected",
        "failed",
    ],
)

export const tasks = pgTable(
    "tasks",
    {
        id: uuid("id")
            .primaryKey(),

        projectId: uuid(
            "project_id",
        )
            .notNull()
            .references(
                () => projects.id,
            ),

        input: text("input")
            .notNull(),

        status: taskStatusEnum(
            "status",
        )
            .notNull(),

        plan: jsonb("plan")
            .$type<TaskPlan>(),

        error: text("error"),

        result: text("result"),

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

export type TaskRecord =
    typeof tasks.$inferSelect

export type NewTaskRecord =
    typeof tasks.$inferInsert