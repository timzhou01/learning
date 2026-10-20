
import { z } from "zod"
import { db } from "../../db.js"
import { logger } from "../../logger.js"
import { claimJob, finishJob } from "./job.repository.js"
import { generateInvoice } from "../billing/billing.service.js"

const invoicePayload = z.object({
    customerId: z.string().min(1),
    from: z.iso.datetime({ offset: true }),
    to: z.iso.datetime({ offset: true }),
})

export function createJobProcessor(
    database: typeof db,
    generate = generateInvoice,
) {
    return async function processNextJob() {
        const job = await claimJob(database)
        if (!job) return false

        try {
            if (job.type !== "generate_invoice") {
                throw new Error(`Unknown job type: ${job.type}`)
            }

            const payload = invoicePayload.parse(job.payload)

            await generate(
                payload.customerId,
                new Date(payload.from),
                new Date(payload.to),
            )

            await finishJob(database, job.id, job.attempts, "completed")
            return true
        } catch (error) {
            logger.error({ err: error, jobId: job.id }, "Job failed")
            await finishJob(database, job.id, job.attempts, "failed")
            return false
        }
    }
}
