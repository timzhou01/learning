
import client from "prom-client"

export const register = new client.Registry()

client.collectDefaultMetrics({ register })

export const consumedMessages = new client.Counter({
    name: "meterflow_kafka_messages_total",
    help: "Total Kafka messages processed",
    labelNames: ["topic", "result"] as const,
    registers: [register],
})
