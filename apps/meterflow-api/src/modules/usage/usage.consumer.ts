
import type { Kafka } from "kafkajs"
import { kafka } from "../../kafka/kafka.js"
import { db } from "../../db/db.js"
import { usageEvents } from "../../db/schema/usage-events.js"
import { usageEventSchema } from "./usage-event.js"

export function createUsageConsumer(
    database: typeof db,
    kafkaClient: Kafka,
    groupId = "meterflow-usage-storage",
) {
    const consumer = kafkaClient.consumer({ groupId })

    return {
        consumer,

        async start() {
            await consumer.connect()

            await consumer.subscribe({
                topic: "usage-events",
                fromBeginning: true,
            })

            await consumer.run({
                eachMessage: async ({ message }) => {
                    if (!message.value) {
                        throw new Error("Empty usage event")
                    }

                    const event = usageEventSchema.parse(
                        JSON.parse(message.value.toString()),
                    )

                    await database
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
        },
    }
}

// 正式环境使用默认依赖
export const usageWorker = createUsageConsumer(db, kafka)
