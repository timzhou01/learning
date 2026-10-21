
import { randomUUID } from "node:crypto"
import { afterAll, beforeAll, expect, it, vi } from "vitest"
import { Kafka } from "kafkajs"
import { KafkaContainer } from "@testcontainers/kafka"
import { PostgreSqlContainer } from "@testcontainers/postgresql"
import { Pool } from "pg"
import { drizzle } from "drizzle-orm/node-postgres"
import { migrate } from "drizzle-orm/node-postgres/migrator"
import { eq } from "drizzle-orm"

import { usageEvents } from "../../db/schema/usage-events.js"
import { createUsageConsumer } from "./usage.consumer.js"

it("consumes Kafka usage events exactly once in the database", async () => {
    const pgContainer = await new PostgreSqlContainer(
        "postgres:17",
    ).start()

    let kafkaContainer: Awaited<
        ReturnType<InstanceType<typeof KafkaContainer>["start"]>
    > | undefined

    const pool = new Pool({
        connectionString: pgContainer.getConnectionUri(),
    })

    let producer: ReturnType<Kafka["producer"]> | undefined
    let worker: ReturnType<typeof createUsageConsumer> | undefined
    let admin: ReturnType<Kafka["admin"]> | undefined

    try {
        const database = drizzle(pool)

        await migrate(database, {
            migrationsFolder: "./drizzle",
        })

        kafkaContainer = await new KafkaContainer(
            "confluentinc/cp-kafka:7.9.0",
        ).start()

        const kafka = new Kafka({
            clientId: "meterflow-integration-test",
            brokers: [
                `${kafkaContainer.getHost()}:${kafkaContainer.getMappedPort(9093)}`,
            ],
        })

        admin = kafka.admin()
        await admin.connect()
        await admin.createTopics({
            topics: [{
                topic: "usage-events",
                numPartitions: 1,
                replicationFactor: 1,
            }],
        })

        worker = createUsageConsumer(
            database,
            kafka,
            `usage-test-${randomUUID()}`,
        )
        await worker.start()

        producer = kafka.producer()
        await producer.connect()

        const event = {
            eventId: randomUUID(),
            customerId: "customer-001",
            tokens: 1500,
            occurredAt: new Date().toISOString(),
        }

        // 故意发布同一事件两次，验证消费端幂等
        await producer.send({
            topic: "usage-events",
            messages: [
                {
                    key: event.customerId,
                    value: JSON.stringify(event),
                },
                {
                    key: event.customerId,
                    value: JSON.stringify(event),
                },
            ],
        })

        await vi.waitFor(async () => {
            const records = await database
                .select()
                .from(usageEvents)
                .where(eq(usageEvents.eventId, event.eventId))

            expect(records).toHaveLength(1)
            expect(records[0]?.customerId).toBe(event.customerId)
            expect(records[0]?.tokens).toBe(1500)
        }, {
            timeout: 15_000,
            interval: 200,
        })
    } finally {
        await worker?.consumer.disconnect()
        await producer?.disconnect()
        await admin?.disconnect()
        await pool.end()
        await kafkaContainer?.stop()
        await pgContainer.stop()
    }
}, 120_000)
