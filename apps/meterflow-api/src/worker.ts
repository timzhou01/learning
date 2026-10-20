
import { setTimeout as sleep } from "node:timers/promises"

import { db, pool } from "./db/db.js"
import { logger } from "./logger.js"
import { createJobProcessor } from "./modules/jobs/job.processor.js"

const processNextJob = createJobProcessor(db)

const controller = new AbortController()

process.once("SIGINT", () => controller.abort())
process.once("SIGTERM", () => controller.abort())

async function main() {
    logger.info("Worker started")

    while (!controller.signal.aborted) {
        try {
            const processed = await processNextJob()

            // 没有任务时，等待 1 秒再查询
            if (!processed) {
                await sleep(1000, undefined, {
                    signal: controller.signal,
                })
            }
        } catch (error) {
            if (controller.signal.aborted) break

            logger.error({ err: error }, "Worker loop failed")

            await sleep(1000, undefined, {
                signal: controller.signal,
            }).catch(() => { })
        }
    }
}

main()
    .catch((error) => {
        if (!controller.signal.aborted) {
            logger.fatal({ err: error }, "Worker crashed")
            process.exitCode = 1
        }
    })
    .finally(async () => {
        await pool.end()
        logger.info("Worker stopped")
    })
