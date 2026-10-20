
import type { Redis } from "ioredis"
import { AppError } from "../../error/app-error.js"

export async function checkRateLimit(
    redis: Redis,
    customerId: string,
) {
    const window = Math.floor(Date.now() / 60_000)
    const key = `rate-limit:${customerId}:${window}`

    const count = await redis.incr(key)

    if (count === 1) {
        await redis.expire(key, 120)
    }

    if (count > 60) {
        throw new AppError(
            429,
            "RATE_LIMIT_EXCEEDED",
            "Too many requests",
        )
    }
}
