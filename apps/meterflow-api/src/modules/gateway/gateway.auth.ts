
import { createHash } from "node:crypto"
import { eq, and, isNull } from "drizzle-orm"

import { db } from "../../db.js"
import { apiKeys } from "../../db/schema/api-keys.js"
import { AppError } from "../../app-error.js"

export async function authenticateApiKey(
    database: typeof db,
    authorization: string | undefined,
): Promise<string> {
    const match = /^Bearer (mf_[a-f0-9]{64})$/.exec(
        authorization ?? "",
    )

    if (!match) {
        throw new AppError(
            401,
            "UNAUTHORIZED",
            "Invalid API key",
        )
    }

    const keyHash = createHash("sha256")
        .update(match[1])
        .digest("hex")

    const [record] = await database
        .select()
        .from(apiKeys)
        .where(and(
            eq(apiKeys.keyHash, keyHash),
            isNull(apiKeys.revokedAt),
        ))

    if (!record) {
        throw new AppError(
            401,
            "UNAUTHORIZED",
            "Invalid API key",
        )
    }

    return record.customerId
}
