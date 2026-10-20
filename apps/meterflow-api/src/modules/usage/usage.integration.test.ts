
import {
    describe,
    it,
    expect,
    beforeAll,
    afterAll,
} from "vitest"
import request from "supertest"
import { Pool } from "pg"
import { drizzle } from "drizzle-orm/node-postgres"
import { migrate } from "drizzle-orm/node-postgres/migrator"
import { eq } from "drizzle-orm"

import {
    PostgreSqlContainer,
    type StartedPostgreSqlContainer,
} from "@testcontainers/postgresql"
import { createApp } from "../../app.js"
import { usageEvents } from "../../db/schema/usage-events.js"
import { createHash } from "node:crypto"
import { apiKeys } from "../../db/schema/api-keys.js"

import { vi } from "vitest"
import type { Redis } from "ioredis"

const mockRedis = {
    incr: vi.fn().mockResolvedValue(1),
    expire: vi.fn().mockResolvedValue(1),
} as unknown as Redis


describe("Usage Events Integration", () => {
    let container: StartedPostgreSqlContainer
    let pool: Pool

    beforeAll(async () => {
        container = await new PostgreSqlContainer("postgres:17")
            .start()

        pool = new Pool({
            connectionString: container.getConnectionUri(),
            max: 10,
        })

        await migrate(drizzle(pool), {
            migrationsFolder: "./drizzle",
        })
    }, 60_000)

    afterAll(async () => {
        await pool?.end()
        await container?.stop()
    })

    it("should prevent duplicate usage events", async () => {
        const testDb = drizzle(pool)
        const app = createApp(testDb)

        const payload = {
            eventId: "event-001",
            customerId: "customer-001",
            tokens: 1500,
            occurredAt: "2026-10-17T10:00:00Z",
        }

        // 第一次：创建成功
        await request(app)
            .post("/usage-events")
            .send(payload)
            .expect(201)

        // 第二次：重复事件
        await request(app)
            .post("/usage-events")
            .send(payload)
            .expect(409)

        // 验证数据库只有一条记录
        const records = await testDb
            .select()
            .from(usageEvents)
            .where(eq(usageEvents.eventId, payload.eventId))

        expect(records).toHaveLength(1)
        expect(records[0]?.tokens).toBe(1500)
    })


    it("should handle 100 concurrent duplicate events", async () => {
        const testDb = drizzle(pool)
        const app = createApp(testDb)

        const eventId = "concurrent-event-001"

        const payload = {
            eventId,
            customerId: "customer-001",
            tokens: 1500,
            occurredAt: "2026-10-17T10:00:00Z",
        }

        // 同时发起 100 个 HTTP 请求
        const responses = await Promise.all(
            Array.from({ length: 100 }, () =>
                request(app)
                    .post("/usage-events")
                    .send(payload),
            ),
        )

        // 统计 HTTP 返回结果
        const created = responses.filter(r => r.status === 201)
        const conflicts = responses.filter(r => r.status === 409)

        expect(created).toHaveLength(1)
        expect(conflicts).toHaveLength(99)

        // 验证数据库最终状态
        const records = await testDb
            .select()
            .from(usageEvents)
            .where(eq(usageEvents.eventId, eventId))

        expect(records).toHaveLength(1)
        expect(records[0]?.tokens).toBe(1500)
    }, 60_000)

    it("should aggregate usage with correct time boundaries", async () => {
        const testDb = drizzle(pool)
        const app = createApp(testDb)

        const customerId = "summary-test-customer"

        // 准备 4 条数据
        await testDb.insert(usageEvents).values([
            {
                eventId: "summary-001",
                customerId,
                tokens: 100,
                occurredAt: new Date("2026-10-01T00:00:00Z"),
            },
            {
                eventId: "summary-002",
                customerId,
                tokens: 200,
                occurredAt: new Date("2026-10-15T00:00:00Z"),
            },
            {
                eventId: "summary-003",
                customerId,
                tokens: 300,
                occurredAt: new Date("2026-11-01T00:00:00Z"),
            },
            {
                eventId: "summary-004",
                customerId: "another-customer",
                tokens: 500,
                occurredAt: new Date("2026-10-15T00:00:00Z"),
            },
        ])

        const response = await request(app)
            .get("/usage-events/summary")
            .query({
                customerId,
                from: "2026-10-01T00:00:00Z",
                to: "2026-11-01T00:00:00Z",
            })
            .expect(200)

        expect(response.body).toEqual({
            customerId,
            totalTokens: "300",
            eventCount: 2,
        })
    })

    it("should return zero for customer without usage", async () => {
        const testDb = drizzle(pool)
        const app = createApp(testDb)

        const response = await request(app)
            .get("/usage-events/summary")
            .query({
                customerId: "customer-without-usage",
                from: "2026-10-01T00:00:00Z",
                to: "2026-11-01T00:00:00Z",
            })
            .expect(200)

        expect(response.body).toEqual({
            customerId: "customer-without-usage",
            totalTokens: "0",
            eventCount: 0,
        })
    })



    it("records token usage from a gateway request", async () => {
        const testDb = drizzle(pool)
        const app = createApp(testDb, mockRedis)

        // 1. 在测试数据库中创建 API Key
        const customerId = "gateway-test-customer"
        const apiKey = `mf_${"a".repeat(64)}`

        const keyHash = createHash("sha256")
            .update(apiKey)
            .digest("hex")

        await testDb.insert(apiKeys).values({
            customerId,
            keyHash,
        })

        // 2. 携带 API Key 调用 Gateway
        const response = await request(app)
            .post("/v1/chat/completions")
            .set("Authorization", `Bearer ${apiKey}`)
            .send({
                model: "mock-model",
                messages: [
                    {
                        role: "user",
                        content: "Hello MeterFlow",
                    },
                ],
            })
            .expect(200)

        // 3. 验证 Token 用量写入数据库
        const records = await testDb
            .select()
            .from(usageEvents)
            .where(eq(usageEvents.eventId, response.body.id))

        expect(records).toHaveLength(1)
        expect(records[0]?.customerId).toBe(customerId)
        expect(records[0]?.tokens).toBe(
            response.body.usage.total_tokens,
        )
    })

})
