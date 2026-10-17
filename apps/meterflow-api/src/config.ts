
import "dotenv/config"
import { z } from "zod"

const envSchema = z.object({
    DATABASE_URL: z.url(),
    NODE_ENV: z.enum([
        "development",
        "test",
        "production",
    ]).default("development"),

    PORT: z.coerce.number()
        .int()
        .min(0)
        .max(65535)
        .default(3001),

    LOG_LEVEL: z.enum([
        "debug",
        "info",
        "warn",
        "error",
    ]).default("info"),
})

export const config = envSchema.parse(process.env)
