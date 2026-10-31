import {
    context,
    propagation,
    trace,
    SpanKind,
    SpanStatusCode,
} from "@opentelemetry/api"
import type { Kafka } from "kafkajs"
import { kafka } from "../../kafka/kafka.js"
import { db } from "../../db/db.js"
import { usageEvents } from "../../db/schema/usage-events.js"
import { usageEventSchema } from "./usage-event.js"
import { ZodError } from "zod"
import { logger } from "../../logger/logger.js"
import { consumedMessages } from "../../monitoring/consumer.metrics.js"

const tracer = trace.getTracer("meterflow-usage-consumer")

export function createUsageConsumer(
    database: typeof db,
    kafkaClient: Kafka,
    groupId = "meterflow-usage-storage",
) {
    const consumer = kafkaClient.consumer({ groupId })
    const dlqProducer = kafkaClient.producer()

    return {
        consumer,
        dlqProducer,

        async start() {
            await consumer.connect()
            await dlqProducer.connect()

            await consumer.subscribe({
                topic: "usage-events",
                fromBeginning: true,
            })

            await consumer.run({
                eachMessage: async ({ topic, partition, message }) => {
                    const headers: Record<string, string> = {}

                    for (const [key, value] of Object.entries(message.headers ?? {})) {
                        if (value !== undefined) {
                            headers[key] = Array.isArray(value)
                                ? value.map(v => v.toString()).join(",")
                                : value.toString()
                        }
                    }

                    const parentContext = propagation.extract(
                        context.active(),
                        headers,
                    )

                    return tracer.startActiveSpan(
                        "usage.consume",
                        {
                            kind: SpanKind.CONSUMER,
                            attributes: {
                                "messaging.system": "kafka",
                                "messaging.destination.name": topic,
                                "messaging.kafka.partition": partition,
                            },
                        },
                        parentContext,
                        async (span) => {
                            try {
                                let event

                                try {
                                    if (!message.value) {
                                        throw new SyntaxError("Empty usage event")
                                    }

                                    event = usageEventSchema.parse(
                                        JSON.parse(message.value.toString()),
                                    )
                                } catch (error) {
                                    if (
                                        !(error instanceof SyntaxError) &&
                                        !(error instanceof ZodError)
                                    ) {
                                        throw error
                                    }

                                    await dlqProducer.send({
                                        topic: "usage-events-dlq",
                                        messages: [{
                                            key: message.key?.toString(),
                                            value: JSON.stringify({
                                                originalTopic: topic,
                                                partition,
                                                offset: message.offset,
                                                payload: message.value?.toString() ?? null,
                                                error: String(error),
                                            }),
                                        }],
                                        acks: -1,
                                    })

                                    consumedMessages.inc({
                                        topic,
                                        result: "dlq",
                                    })

                                    logger.warn(
                                        { topic, partition, offset: message.offset },
                                        "Invalid usage event moved to DLQ",
                                    )

                                    return
                                }

                                const inserted = await database
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
                                    .returning({
                                        eventId: usageEvents.eventId,
                                    })

                                if (inserted.length === 0) {
                                    consumedMessages.inc({
                                        topic,
                                        result: "duplicate",
                                    })

                                    logger.info(
                                        { eventId: event.eventId },
                                        "Duplicate usage event skipped",
                                    )
                                } else {
                                    consumedMessages.inc({
                                        topic,
                                        result: "success",
                                    })
                                }
                            } catch (error) {
                                span.recordException(
                                    error instanceof Error
                                        ? error
                                        : new Error(String(error)),
                                )
                                span.setStatus({
                                    code: SpanStatusCode.ERROR,
                                })
                                throw error
                            } finally {
                                span.end()
                            }
                        },
                    )
                },
            })
        },
    }
}

export const usageWorker = createUsageConsumer(db, kafka)