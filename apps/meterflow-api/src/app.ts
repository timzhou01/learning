
import express from "express"
import { pinoHttp } from "pino-http"
import { randomUUID } from "node:crypto"

import { db } from "./db/db.js"
import { AppError } from "./error/app-error.js"
import { billingRouter } from "./modules/billing/billing.routes.js"
import { createGatewayRouter } from "./modules/gateway/gateway.routes.js"
import { errorMiddleware } from "./error/error.middleware.js"
import { createUsageRouter } from "./modules/usage/usage.routes.js"
import { logger } from "./logger/logger.js"
import { redis } from "./redis/redis.js"
import type { Redis } from "ioredis"

export function createApp(database: typeof db = db, redisClient: Redis = redis) {
    const app = express()

    app.use(pinoHttp({
        logger,

        genReqId(_req, res) {
            const requestId = randomUUID()
            res.setHeader("X-Request-ID", requestId)
            return requestId
        },
    }))

    app.use(express.json())

    app.get("/health", (_req, res) => {
        res.json({
            status: "ok",
            service: "meterflow-api",
        })
    })

    app.use(
        "/usage-events",
        createUsageRouter(database),
    )

    app.use("/billing", billingRouter)
    app.use("/v1", createGatewayRouter(database, redisClient))

    // 404：必须放在所有业务路由之后
    app.use((_req, _res, next) => {
        next(new AppError(
            404,
            "RESOURCE_NOT_FOUND",
            "Resource not found",
        ))
    })

    app.use(errorMiddleware)

    return app
}

// 生产环境使用默认数据库
export const app = createApp()
