import type {
    NextFunction,
    Request,
    Response,
} from "express"
import { ZodError } from "zod"

import { AppError } from "./app.error.js"

export function errorMiddleware(
    error: unknown,
    _req: Request,
    res: Response,
    _next: NextFunction,
) {
    if (error instanceof AppError) {
        return res.status(error.statusCode).json({
            error: error.message,
        })
    }

    if (error instanceof ZodError) {
        return res.status(400).json({
            error: "Invalid request",
            issues: error.issues.map((issue) => ({
                path: issue.path.join("."),
                message: issue.message,
            })),
        })
    }

    console.error(error)

    return res.status(500).json({
        error: "Internal server error",
    })
}