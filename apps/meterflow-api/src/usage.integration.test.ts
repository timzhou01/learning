
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

import { createApp } from "./app.js"
import { usageEvents } from "./db/schema/usage-events.js"

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

})
