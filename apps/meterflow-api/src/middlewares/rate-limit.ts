
import type { RequestHandler, Request, Response } from "express"
import type { Redis } from "ioredis"

import { AppError } from "../error/app-error.js"

export function rateLimit(
    redis: Redis,
    options: {
        limit: number
        windowSeconds: number
        key: (req: Request, res: Response) => string
    },
): RequestHandler {
    return async (req, _res, next) => {
        try {
            const window = Math.floor(
                Date.now() / (options.windowSeconds * 1000),
            )

            const key = `rate-limit:${options.key(req, _res)}:${window}`

            const count = await redis.incr(key)

            if (count === 1) {
                await redis.expire(key, options.windowSeconds * 2)
            }

            if (count > options.limit) {
                throw new AppError(
                    429,
                    "RATE_LIMIT_EXCEEDED",
                    "Too many requests",
                )
            }

            next()
        } catch (error) {
            next(error)
        }
    }
}
