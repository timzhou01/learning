
import { db } from "../../db/db.js"
import { usageEvents } from "../../db/schema/usage-events.js"

export async function recordGatewayUsage(
    database: typeof db,
    eventId: string,
    customerId: string,
    tokens: number,
) {
    await database.insert(usageEvents).values({
        eventId,
        customerId,
        tokens,
        occurredAt: new Date(),
    })
}
