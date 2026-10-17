
import { app } from "./app.js"
import { config } from "./config.js"
import { logger } from "./logger.js"
import { pool } from "./db.js"

async function main() {
    await pool.query("SELECT 1")

    logger.info("PostgreSQL connected")

    const server = app.listen(config.PORT, () => {
        logger.info(
            { port: config.PORT },
            "MeterFlow API started",
        )
    })

    const shutdown = () => {
        logger.info("Shutting down")

        server.close(async (error) => {
            if (error) {
                logger.error({ err: error }, "HTTP server close failed")
            }

            try {
                await pool.end()
            } catch (err) {
                logger.error({ err }, "Database pool close failed")
                process.exitCode = 1
            }

            if (error) process.exitCode = 1
        })
    }

    process.once("SIGINT", shutdown)
    process.once("SIGTERM", shutdown)
}

main().catch(async (error) => {
    logger.fatal({ err: error }, "Startup failed")
    process.exitCode = 1
    await pool.end()
})
