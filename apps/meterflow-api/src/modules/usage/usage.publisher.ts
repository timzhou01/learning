
import { producer } from "../../kafka/kafka.js"
import type { UsageEvent } from "./usage-event.js"

export async function publishUsageEvent(event: UsageEvent) {
    await producer.send({
        topic: "usage-events",
        messages: [{
            key: event.customerId,
            value: JSON.stringify(event),
        }],
        acks: -1,
    })
}
