
import {
    describe,
    it,
    expect,
    beforeAll,
    afterAll,
} from "vitest"

import { Client } from "pg"
import { PostgreSqlContainer } from "@testcontainers/postgresql"

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
})
