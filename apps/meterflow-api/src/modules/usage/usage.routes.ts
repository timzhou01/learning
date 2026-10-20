
import { Router } from "express"
import { z } from "zod"

import type { db as appDb } from "../../db/db.js"
import { usageEvents } from "../../db/schema/usage-events.js"
import { AppError } from "../../error/app-error.js"
import { and, eq, gte, lt, sql } from "drizzle-orm"

const createUsageSchema = z.object({
    eventId: z.string().min(1),
    customerId: z.string().min(1),
    tokens: z.number().int().positive(),
    occurredAt: z.iso.datetime({
        offset: true,
    }),
})

export function createUsageRouter(database: typeof appDb) {
    const router = Router()

    router.post("/", async (req, res) => {
        const parsed = createUsageSchema.safeParse(req.body)

        if (!parsed.success) {
            throw new AppError(
                400,
                "INVALID_REQUEST",
                "Invalid usage event",
            )
        }

        const {
            eventId,
            customerId,
            tokens,
            occurredAt,
        } = parsed.data

        const [event] = await database
            .insert(usageEvents)
            .values({
                eventId,
                customerId,
                tokens,
                occurredAt: new Date(occurredAt),
            })
            .onConflictDoNothing({
                target: usageEvents.eventId,
            })
            .returning()

        if (!event) {
            throw new AppError(
                409,
                "DUPLICATE_EVENT",
                "Usage event already exists",
            )
        }

        res.status(201).json(event)
    })

    const summarySchema = z.object({
        customerId: z.string().min(1),
        from: z.iso.datetime({ offset: true }),
        to: z.iso.datetime({ offset: true }),
    }).refine(
        data => new Date(data.from) < new Date(data.to),
        { message: "from must be before to" },
    )

    router.get("/summary", async (req, res) => {
        const parsed = summarySchema.safeParse(req.query)

        if (!parsed.success) {
            throw new AppError(
                400,
                "INVALID_REQUEST",
                "Invalid query parameters",
            )
        }

        const { customerId, from, to } = parsed.data

        const [result] = await database
            .select({
                totalTokens: sql<string>`
        COALESCE(SUM(${usageEvents.tokens}), 0)
      `,
                eventCount: sql<string>`
        COUNT(*)
      `,
            })
            .from(usageEvents)
            .where(and(
                eq(usageEvents.customerId, customerId),
                gte(usageEvents.occurredAt, new Date(from)),
                lt(usageEvents.occurredAt, new Date(to)),
            ))

        res.json({
            customerId,
            totalTokens: result?.totalTokens ?? "0",
            eventCount: Number(result?.eventCount ?? 0),
        })
    })

    return router
}
