import {
    pgTable,
    uuid,
    text,
    timestamp,
    pgEnum,
} from "drizzle-orm/pg-core"

import { tasks } from "./tasks.js"

export const reviewDecisionEnum =
    pgEnum(
        "review_decision",
        [
            "approved",
            "rejected",
        ],
    )

export const taskReviews =
    pgTable(
        "task_reviews",
        {
            id: uuid("id").primaryKey(),

            taskId: uuid("task_id")
                .notNull()
                .references(() => tasks.id),

            decision:
                reviewDecisionEnum("decision")
                    .notNull(),

            reviewer: text("reviewer")
                .notNull(),

            comment: text("comment"),

            createdAt: timestamp(
                "created_at",
                {
                    withTimezone: true,
                },
            )
                .notNull()
                .defaultNow(),
        },
    )