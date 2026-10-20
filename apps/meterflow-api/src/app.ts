
import express from "express"
import { pinoHttp } from "pino-http"
import { randomUUID } from "node:crypto"

import { db } from "./db.js"
import { logger } from "./logger.js"
import { AppError } from "./app-error.js"
import { errorMiddleware } from "./error.middleware.js"
import { createUsageRouter } from "./usage.routes.js"
import { billingRouter } from "./modules/billing/billing.routes.js"
import { createGatewayRouter } from "./modules/gateway/gateway.routes.js"

export function createApp(database: typeof db = db) {
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
    app.use("/v1", createGatewayRouter(database))

    // 404：必须放在所有业务路由之后
    app.use((_req, _res, next) => {
        next(new AppError(
            404,
            "RESOURCE_NOT_FOUND",
            "Resource not found",
        ))
    })

    // 全局错误处理：放在最后
    app.use(errorMiddleware)

    return app
}

// 生产环境使用默认数据库
export const app = createApp()
