import type { ErrorRequestHandler } from "express"
import { AppError } from "./app-error.js"

export const errorMiddleware: ErrorRequestHandler = (
    err: unknown,
    req,
    res,
    next,
) => {
    if (res.headersSent) {
        next(err)
        return
    }

    const knownError = err instanceof AppError

    const statusCode = knownError
        ? err.statusCode
        : 500

    const code = knownError
        ? err.code
        : "INTERNAL_SERVER_ERROR"

    const message = knownError
        ? err.message
        : "Internal server error"

    // 404 只由 pino-http 记录访问日志，避免重复
    if (statusCode >= 500) {
        req.log.error({ err, code, statusCode }, "Request failed")
    } else if (statusCode !== 404) {
        req.log.warn({ code, statusCode }, "Request rejected")
    }

    res.status(statusCode).json({
        error: {
            code,
            message,
            requestId: req.id,
        },
    })
}