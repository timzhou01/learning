
import { kafka } from "../../kafka/kafka.js"
import { db } from "../../db/db.js"
import { usageEvents } from "../../db/schema/usage-events.js"
import { usageEventSchema } from "./usage-event.js"

export const usageConsumer = kafka.consumer({
    groupId: "meterflow-usage-storage",
})

export async function startUsageConsumer() {
    await usageConsumer.connect()

    await usageConsumer.subscribe({
        topic: "usage-events",
        fromBeginning: true,
    })

    await usageConsumer.run({
        autoCommit: true,

        eachMessage: async ({ message }) => {
            if (!message.value) {
                throw new Error("Empty usage event")
            }

            const event = usageEventSchema.parse(
                JSON.parse(message.value.toString()),
            )

            await db
                .insert(usageEvents)
                .values({
                    eventId: event.eventId,
                    customerId: event.customerId,
                    tokens: event.tokens,
                    occurredAt: new Date(event.occurredAt),
                })
                .onConflictDoNothing({
                    target: usageEvents.eventId,
                })
        },
    })
}
