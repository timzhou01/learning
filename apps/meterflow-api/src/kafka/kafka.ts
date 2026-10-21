
import { Kafka } from "kafkajs"
import { config } from "../config.js"

export const kafka = new Kafka({
    clientId: "meterflow-api",
    brokers: [config.KAFKA_BROKER],
})

export const producer = kafka.producer()
