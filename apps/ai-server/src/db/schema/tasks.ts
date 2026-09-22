import {
    pgTable,
    uuid,
    text,
    varchar,
    jsonb,
    timestamp,
} from "drizzle-orm/pg-core"

export const tasks = pgTable("tasks", {
    id: uuid("id").primaryKey(),

    input: text("input").notNull(),

    status: varchar("status", {
        length: 32,
    }).notNull(),

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