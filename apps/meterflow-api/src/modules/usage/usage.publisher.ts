import { context, propagation } from "@opentelemetry/api"
import { producer } from "../../kafka/kafka.js"
import type { UsageEvent } from "./usage-event.js"

export async function publishUsageEvent(event: UsageEvent) {
    const headers: Record<string, string> = {}

    propagation.inject(context.active(), headers)

    await producer.send({
        topic: "usage-events",
        messages: [{
            key: event.customerId,
            value: JSON.stringify(event),
            headers,
        }],
        acks: -1,
    })
}