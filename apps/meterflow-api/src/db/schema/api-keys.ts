
import {
    pgTable,
    uuid,
    text,
    timestamp,
    uniqueIndex,
} from "drizzle-orm/pg-core"

export const apiKeys = pgTable("api_keys", {
    id: uuid("id").primaryKey().defaultRandom(),

    customerId: text("customer_id").notNull(),

    // 只保存 SHA-256 Hash，不保存原始 Key
    keyHash: text("key_hash").notNull(),

    createdAt: timestamp("created_at", {
        withTimezone: true,
    }).notNull().defaultNow(),

    revokedAt: timestamp("revoked_at", {
        withTimezone: true,
    }),
}, (table) => [
    uniqueIndex("api_keys_hash_unique").on(table.keyHash),
])
