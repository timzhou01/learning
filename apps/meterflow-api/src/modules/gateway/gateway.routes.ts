
import { Router } from "express"
import { z } from "zod"

import { db } from "../../db.js"
import { AppError } from "../../app-error.js"
import { createChatCompletion } from "./gateway.service.js"
import { recordGatewayUsage } from "./gateway.usage.js"

const schema = z.object({
    model: z.string().min(1),
    messages: z.array(z.object({
        role: z.enum(["system", "user", "assistant"]),
        content: z.string(),
    })).min(1),
})

export function createGatewayRouter(database: typeof db) {
    const router = Router()

    router.post("/chat/completions", async (req, res) => {
        const parsed = schema.safeParse(req.body)

        if (!parsed.success) {
            throw new AppError(
                400,
                "INVALID_REQUEST",
                "Invalid chat completion request",
            )
        }

        const result = await createChatCompletion(
            parsed.data.model,
            parsed.data.messages,
        )

        // 目前先模拟客户，下一步接入 API Key 鉴权
        const customerId = "demo-customer"

        await recordGatewayUsage(
            database,
            result.id,
            customerId,
            result.usage.total_tokens,
        )

        res.json(result)
    })

    return router
}
