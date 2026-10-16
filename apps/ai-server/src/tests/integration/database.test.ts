
import {
    describe,
    it,
    expect,
    beforeAll,
    afterAll,
} from "vitest"

import { Client } from "pg"
import { PostgreSqlContainer } from "@testcontainers/postgresql"
import { drizzle } from "drizzle-orm/node-postgres"
import { migrate } from "drizzle-orm/node-postgres/migrator"

import type { StartedPostgreSqlContainer } from "@testcontainers/postgresql"

describe("PostgreSQL Integration", () => {
    let container: StartedPostgreSqlContainer
    let client: Client

    beforeAll(async () => {
        container = await new PostgreSqlContainer("postgres:17")
            .start()

        client = new Client({
            connectionString: container.getConnectionUri(),
        })

        await client.connect()
        const db = drizzle(client)

        await migrate(db, {
            migrationsFolder: "./drizzle",
        })
    })

    afterAll(async () => {
        await client?.end()
        await container?.stop()
    })

    it("should connect to PostgreSQL", async () => {
        const result = await client.query(
            "SELECT 1 AS value",
        )

        expect(result.rows[0].value).toBe(1)
    })

    it("should create workflow tables", async () => {
        const result = await client.query(`
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
})
