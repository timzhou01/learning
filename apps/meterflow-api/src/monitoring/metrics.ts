
import client from "prom-client"
import type { RequestHandler } from "express"

export const register = new client.Registry()

// Node.js CPU、内存、GC 等默认指标
client.collectDefaultMetrics({ register })

const httpDuration = new client.Histogram({
    name: "http_request_duration_seconds",
    help: "HTTP request duration in seconds",
    labelNames: ["method", "route", "status"] as const,
    buckets: [
        0.005, 0.01, 0.025, 0.05,
        0.1, 0.25, 0.5, 1, 2.5, 5,
    ],
    registers: [register],
})

export const metricsMiddleware: RequestHandler = (
    req,
    res,
    next,
) => {
    if (req.path === "/metrics") {
        return next()
    }

    const start = process.hrtime.bigint()

    res.on("finish", () => {
        const duration = Number(
            process.hrtime.bigint() - start,
        ) / 1e9

        httpDuration.observe(
            {
                method: req.method,
                route: req.route?.path
                    ? `${req.baseUrl}${req.route.path}`
                    : "unmatched",
                status: String(res.statusCode),
            },
            duration,
        )
    })

    next()
}

export const metricsHandler: RequestHandler = async (
    _req,
    res,
    next,
) => {
    try {
        res.setHeader("Content-Type", register.contentType)
        res.end(await register.metrics())
    } catch (error) {
        next(error)
    }
}
