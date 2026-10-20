
import type { ErrorRequestHandler } from "express"
import { AppError } from "./app-error.js"

export const errorMiddleware: ErrorRequestHandler = (
    err: unknown,
    req,
    res,
    _next,
) => {
    if (res.headersSent) {
        _next(err)
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

    if (statusCode >= 500) {
        req.log.error({ err }, "Request failed")
    } else {
        req.log.warn(
            { code, statusCode },
            "Request rejected",
        )
    }

    res.status(statusCode).json({
        error: {
            code,
            message,
            requestId: req.id,
        },
    })
}
