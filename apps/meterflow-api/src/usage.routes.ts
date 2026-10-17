
import { Router } from "express"
import { z } from "zod"

import type { db as appDb } from "./db.js"
import { usageEvents } from "./db/schema/usage-events.js"
import { AppError } from "./app-error.js"

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

    return router
}
