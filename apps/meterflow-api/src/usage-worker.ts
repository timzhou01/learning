
import { pool } from "./db/db.js"
import { logger } from "./logger/logger.js"
import { usageWorker } from "./modules/usage/usage.consumer.js"
import { register } from "./monitoring/consumer.metrics.js"
import { startMetricsServer } from "./monitoring/metrics-server.js"

const metricsServer = startMetricsServer(register)

async function main() {
    await pool.query("SELECT 1")
    await usageWorker.start()

    logger.info("Usage Consumer started")
}

async function shutdown() {
    logger.info("Stopping Usage Consumer")

    try {
        metricsServer.close()
        await usageWorker.consumer.disconnect()
        await usageWorker.dlqProducer.disconnect()
        await pool.end()
    } catch (error) {
        logger.error({ err: error }, "Shutdown failed")
        process.exitCode = 1
    }
}

process.once("SIGINT", () => void shutdown())
process.once("SIGTERM", () => void shutdown())

main().catch((error) => {
    logger.fatal({ err: error }, "Usage Consumer failed to start")
    process.exitCode = 1
    void shutdown()
})
