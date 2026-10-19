
import { and, eq, gte, lt, sql } from "drizzle-orm"
import { db } from "../../db.js"
import { usageEvents } from "../../db/schema/usage-events.js"
import { invoices } from "../../db/schema/invoices.js"

export async function generateInvoice(
    customerId: string,
    from: Date,
    to: Date,
) {
    if (from >= to) {
        throw new Error("Invalid billing period")
    }

    return db.transaction(async (tx) => {
        const [usage] = await tx
            .select({
                total: sql<string>`
          COALESCE(SUM(${usageEvents.tokens}), 0)
        `,
            })
            .from(usageEvents)
            .where(and(
                eq(usageEvents.customerId, customerId),
                gte(usageEvents.occurredAt, from),
                lt(usageEvents.occurredAt, to),
            ))

        const totalTokens = BigInt(usage.total)

        // 每 1000 tokens 收 1 美分，向上取整
        const amountCents = (totalTokens + 999n) / 1000n

        const [invoice] = await tx
            .insert(invoices)
            .values({
                customerId,
                periodStart: from,
                periodEnd: to,
                totalTokens,
                amountCents,
            })
            .onConflictDoNothing()
            .returning()

        return invoice ?? null
    })
}
