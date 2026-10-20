
import { randomBytes, createHash } from "node:crypto"

import { db, pool } from "../db/db.js"
import { apiKeys } from "../db/schema/api-keys.js"

async function main() {
    const customerId = process.argv[2]

    if (!customerId) {
        throw new Error("Usage: create-api-key <customerId>")
    }

    const key = `mf_${randomBytes(32).toString("hex")}`

    const keyHash = createHash("sha256")
        .update(key)
        .digest("hex")

    await db.insert(apiKeys).values({
        customerId,
        keyHash,
    })

    // 只在创建时展示一次
    console.log(`API Key: ${key}`)
}

main()
    .catch(console.error)
    .finally(async () => pool.end())



