
import { kafka } from "../kafka/kafka.js"
import { usageEventSchema } from "../modules/usage/usage-event.js"
import { logger } from "../logger/logger.js"

const dlqConsumer = kafka.consumer({
    groupId: "meterflow-dlq-replay",
})

const producer = kafka.producer()

async function main() {
    await dlqConsumer.connect()
    await producer.connect()

    await dlqConsumer.subscribe({
        topic: "usage-events-dlq",
        fromBeginning: true,
    })

    await dlqConsumer.run({
        autoCommit: false,

        eachMessage: async ({ topic, partition, message }) => {
            const wrapper = JSON.parse(
                message.value?.toString() ?? "{}",
            )

            if (!wrapper.payload) {
                logger.warn("Skipping DLQ message without payload")
                return
            }

            // 这里只处理已经符合协议的消息
            // 不合法的消息需要先人工修复
            const parsed = usageEventSchema.safeParse(
                JSON.parse(wrapper.payload),
            )

            if (!parsed.success) {
                logger.warn(
                    { offset: message.offset },
                    "DLQ event still invalid, skipping",
                )
                return
            }

            await producer.send({
                topic: "usage-events",
                messages: [{
                    key: parsed.data.customerId,
                    value: JSON.stringify(parsed.data),
                }],
                acks: -1,
            })

            logger.info(
                { eventId: parsed.data.eventId },
                "DLQ event replayed",
            )
        },
    })
}

async function shutdown() {
    await dlqConsumer.disconnect()
    await producer.disconnect()
}

process.once("SIGINT", () => void shutdown())
process.once("SIGTERM", () => void shutdown())

main().catch((error) => {
    logger.error({ err: error }, "DLQ replay failed")
    process.exitCode = 1
    void shutdown()
})
