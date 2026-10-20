
import { Router } from "express"
import { z } from "zod"

import { AppError } from "../../app-error.js"
import { createChatCompletion } from "./gateway.service.js"

export const gatewayRouter = Router()

const schema = z.object({
    model: z.string().min(1),
    messages: z.array(z.object({
        role: z.enum(["system", "user", "assistant"]),
        content: z.string(),
    })).min(1),
})

gatewayRouter.post("/chat/completions", async (req, res) => {
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

    res.json(result)
})
