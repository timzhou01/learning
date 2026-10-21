
import { Router } from "express"
import { z } from "zod"

import { db } from "../../db/db.js"
import { AppError } from "../../error/app-error.js"
import { createChatCompletion } from "./gateway.service.js"
import { recordGatewayUsage } from "./gateway.usage.js"
import { apiKeyAuth } from "./gateway.auth.middleware.js"
import { rateLimit } from "../../middlewares/rate-limit.js"
import { redis } from "../../redis/redis.js"
import type { Redis } from "ioredis"
import { publishUsageEvent } from "../usage/usage.publisher.js"

const schema = z.object({
    model: z.string().min(1),
    messages: z.array(z.object({
        role: z.enum(["system", "user", "assistant"]),
        content: z.string(),
    })).min(1),
})

export function createGatewayRouter(database: typeof db, redisClient: Redis = redis,) {
    const router = Router()

    router.post("/chat/completions", apiKeyAuth(database),
        rateLimit(redisClient, {
            limit: 60,
            windowSeconds: 60,
            key: (_req, res) => res.locals.customerId,
        }), async (req, res) => {
            const parsed = schema.safeParse(req.body)

            if (!parsed.success) {
                throw new AppError(
                    400,
                    "INVALID_REQUEST",
                    "Invalid chat completion request",
                )
            }

            const customerId = res.locals.customerId as string

            const result = await createChatCompletion(
                parsed.data.model,
                parsed.data.messages,
            )



            await publishUsageEvent({
                eventId: result.id,
                customerId,
                tokens: result.usage.total_tokens,
                occurredAt: new Date().toISOString(),
            })

            res.json(result)
        })

    return router
}
