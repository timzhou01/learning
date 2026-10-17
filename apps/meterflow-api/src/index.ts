import { app } from "./app.js"
import { config } from "./config.js"
import { logger } from "./logger.js"

const server = app.listen(config.PORT, () => {
    logger.info(
        { port: config.PORT },
        "MeterFlow API started",
    )
})

process.on("SIGINT", () => {
    console.log("\nShutting down...")

    server.close(() => {
        console.log("Server closed")
        process.exit(0)
    })
})