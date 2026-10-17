
import {
    pgTable,
    uuid,
    text,
    integer,
    timestamp,
    uniqueIndex,
    index,
    check,
} from "drizzle-orm/pg-core"

import { sql } from "drizzle-orm"

export const usageEvents = pgTable(
    "usage_events",
    {
        id: uuid("id")
            .primaryKey()
            .defaultRandom(),

        eventId: text("event_id")
            .notNull(),

        customerId: text("customer_id")
            .notNull(),

        tokens: integer("tokens")
            .notNull(),

        occurredAt: timestamp("occurred_at", {
            withTimezone: true,
        }).notNull(),

        createdAt: timestamp("created_at", {
            withTimezone: true,
        }).notNull().defaultNow(),
    },
    (table) => [
        uniqueIndex("usage_events_event_id_unique")
            .on(table.eventId),

        index("usage_events_customer_time_idx")
            .on(table.customerId, table.occurredAt),

        check(
            "usage_events_tokens_positive",
            sql`${table.tokens} > 0`,
        ),
    ],
)
