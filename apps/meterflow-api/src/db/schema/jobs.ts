
import {
    pgTable,
    uuid,
    text,
    integer,
    jsonb,
    timestamp,
    index,
    check,
} from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const jobs = pgTable("jobs", {
    id: uuid("id").primaryKey().defaultRandom(),

    type: text("type").notNull(),

    payload: jsonb("payload").notNull(),

    status: text("status").notNull().default("pending"),

    attempts: integer("attempts").notNull().default(0),

    lockedUntil: timestamp("locked_until", {
        withTimezone: true,
    }),

    runAt: timestamp("run_at", {
        withTimezone: true,
    }).notNull().defaultNow(),

    createdAt: timestamp("created_at", {
        withTimezone: true,
    }).notNull().defaultNow(),
}, (t) => [
    index("jobs_status_run_at_idx").on(t.status, t.runAt),
    check(
        "jobs_status_check",
        sql`${t.status} IN ('pending', 'processing', 'completed', 'failed')`,
    ),
    check("jobs_attempts_check", sql`${t.attempts} >= 0`),
])
