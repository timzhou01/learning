import pino from "pino"
import { context, trace } from "@opentelemetry/api"
import { config } from "../config.js"

export const logger = pino({
    level: config.LOG_LEVEL,

    base: {
        service: process.env.OTEL_SERVICE_NAME ?? "meterflow-api",
        environment: config.NODE_ENV,
    },

    mixin() {
        const span = trace.getSpan(context.active())

        if (!span) return {}

        const { traceId, spanId } = span.spanContext()

        return {
            trace_id: traceId,
            span_id: spanId,
        }
    },

    redact: [
        "req.headers.authorization",
        "req.headers.cookie",
    ],
})