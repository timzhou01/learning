
import {
    pgTable,
    uuid,
    text,
    integer,
    bigint,
    timestamp,
    uniqueIndex,
    check,
} from "drizzle-orm/pg-core"

import { sql } from "drizzle-orm"

export const invoices = pgTable(
    "invoices",
    {
        id: uuid("id")
            .primaryKey()
            .defaultRandom(),

        customerId: text("customer_id")
            .notNull(),

        periodStart: timestamp("period_start", {
            withTimezone: true,
        }).notNull(),

        periodEnd: timestamp("period_end", {
            withTimezone: true,
        }).notNull(),

        totalTokens: bigint("total_tokens", {
            mode: "bigint",
        }).notNull(),

        amountCents: bigint("amount_cents", {
            mode: "bigint",
        }).notNull(),

        status: text("status")
            .notNull()
            .default("draft"),

        createdAt: timestamp("created_at", {
            withTimezone: true,
        }).notNull().defaultNow(),
    },
    (table) => [
        uniqueIndex("invoices_customer_period_unique")
            .on(
                table.customerId,
                table.periodStart,
                table.periodEnd,
            ),

        check(
            "invoices_valid_period",
            sql`${table.periodStart} < ${table.periodEnd}`,
        ),

        check(
            "invoices_total_tokens_nonnegative",
            sql`${table.totalTokens} >= 0`,
        ),

        check(
            "invoices_amount_nonnegative",
            sql`${table.amountCents} >= 0`,
        ),

        check(
            "invoices_valid_status",
            sql`${table.status} IN ('draft', 'finalized')`,
        ),
    ],
)
