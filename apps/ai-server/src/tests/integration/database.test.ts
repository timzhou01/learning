
import {
    describe,
    it,
    expect,
    beforeAll,
    afterAll,
} from "vitest"

import { Pool } from "pg"
import { eq } from "drizzle-orm"
import { drizzle } from "drizzle-orm/node-postgres"
import { migrate } from "drizzle-orm/node-postgres/migrator"
import {
    PostgreSqlContainer,
    type StartedPostgreSqlContainer,
} from "@testcontainers/postgresql"

import {
    workflows,
    workflowVersions,
} from "../../db/schema/workflows.js"

import { publishWorkflow } from "../../modules/workflow/workflow.service.js"

describe("PostgreSQL Integration", () => {
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

    it("should connect to PostgreSQL", async () => {
        const result = await pool.query("SELECT 1 AS value")

        expect(result.rows[0].value).toBe(1)
    })

    it("should create workflow tables", async () => {
        const result = await pool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_name IN ('workflows', 'workflow_versions')
      ORDER BY table_name
    `)

        expect(result.rows.map(row => row.table_name)).toEqual([
            "workflow_versions",
            "workflows",
        ])
    })

    it("should publish 100 versions concurrently", async () => {
        const db = drizzle(pool)

        // 创建测试工作流
        const [workflow] = await db
            .insert(workflows)
            .values({ name: "Concurrency Test" })
            .returning()

        // 同时发起 100 次发布
        const results = await Promise.all(
            Array.from({ length: 100 }, (_, i) =>
                publishWorkflow(db, workflow!.id, {
                    nodes: [],
                    index: i,
                }),
            ),
        )

        // 验证返回版本
        const versions = results
            .map(r => r!.version)
            .sort((a, b) => a - b)

        expect(versions).toEqual(
            Array.from({ length: 100 }, (_, i) => i + 1),
        )

        // 验证数据库实际版本记录
        const records = await db
            .select()
            .from(workflowVersions)
            .where(eq(workflowVersions.workflowId, workflow!.id))

        expect(records).toHaveLength(100)

        // 验证最新版本号
        const [updated] = await db
            .select()
            .from(workflows)
            .where(eq(workflows.id, workflow!.id))

        expect(updated!.latestVersion).toBe(100)
    }, 60_000)
})
