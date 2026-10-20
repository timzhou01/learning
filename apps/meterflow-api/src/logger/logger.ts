
import pino from "pino"
import { config } from "../config.js"

export const logger = pino({
    level: config.LOG_LEVEL,
    base: {
        service: "meterflow-api",
        environment: config.NODE_ENV,
    },
    redact: [
        "req.headers.authorization",
        "req.headers.cookie",
    ],
})
