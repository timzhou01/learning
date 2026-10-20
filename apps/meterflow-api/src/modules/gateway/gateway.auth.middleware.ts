
import type { RequestHandler } from "express"
import { db } from "../../db/db.js"
import { authenticateApiKey } from "./gateway.auth.js"

export function apiKeyAuth(database: typeof db): RequestHandler {
    return async (req, res, next) => {
        try {
            res.locals.customerId = await authenticateApiKey(
                database,
                req.headers.authorization,
            )
            next()
        } catch (error) {
            next(error)
        }
    }
}
