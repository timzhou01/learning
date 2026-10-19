
import { describe, it, expect } from "vitest"
import { Pool } from "pg"
import { drizzle } from "drizzle-orm/node-postgres"
import { migrate } from "drizzle-orm/node-postgres/migrator"
import { eq } from "drizzle-orm"
import { PostgreSqlContainer } from "@testcontainers/postgresql"

import { jobs } from "../../db/schema/jobs.js"
import { invoices } from "../../db/schema/invoices.js"
import { usageEvents } from "../../db/schema/usage-events.js"
import { generateInvoice } from "../billing/billing.service.js"
import { createJobProcessor } from "./job.processor.js"

describe("Billing Worker", () => {
    it("processes usage into an invoice", async () => {
        const container = await new PostgreSqlContainer("postgres:17").start()
        const pool = new Pool({
            connectionString: container.getConnectionUri(),
        })

        try {
            const testDb = drizzle(pool)

            await migrate(testDb, {
                migrationsFolder: "./drizzle",
            })

            const from = new Date("2026-10-01T00:00:00Z")
            const to = new Date("2026-11-01T00:00:00Z")

            await testDb.insert(usageEvents).values({
                eventId: "worker-test-event",
                customerId: "worker-test-customer",
                tokens: 2500,
                occurredAt: from,
            })

            const [job] = await testDb.insert(jobs).values({
                type: "generate_invoice",
                payload: {
                    customerId: "worker-test-customer",
                    from: from.toISOString(),
                    to: to.toISOString(),
                },
            }).returning()

            const processNextJob = createJobProcessor(
                testDb,
                (customerId, start, end) =>
                    generateInvoice(customerId, start, end, testDb),
            )

            expect(await processNextJob()).toBe(true)

            const [savedJob] = await testDb
                .select()
                .from(jobs)
                .where(eq(jobs.id, job.id))

            expect(savedJob.status).toBe("completed")

            const [invoice] = await testDb
                .select()
                .from(invoices)
                .where(eq(invoices.customerId, "worker-test-customer"))

            expect(invoice.totalTokens).toBe(2500n)
            expect(invoice.amountCents).toBe(3n)
        } finally {
            await pool.end()
            await container.stop()
        }
    }, 60_000)
})
