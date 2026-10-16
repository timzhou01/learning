
import express from "express"
import pinoHttp from "pino-http"
import { randomUUID } from "node:crypto"

import { config } from "./config.js"
import { logger } from "./logger.js"

const app = express()

app.use(pinoHttp({
    logger,

    genReqId(req, res) {
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

app.listen(config.PORT, () => {
    logger.info(
        { port: config.PORT },
        "MeterFlow API started",
    )
})
