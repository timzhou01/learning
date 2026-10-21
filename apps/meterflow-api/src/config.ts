
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
    AI_BASE_URL: z.url(),
    AI_API_KEY: z.string().min(1),
    REDIS_URL: z.url(),
    KAFKA_BROKER: z.string().default("localhost:9092"),
})

export const config = envSchema.parse(process.env)
