import { trace } from "@opentelemetry/api"
import { NodeSDK } from "@opentelemetry/sdk-node"
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http"

const sdk = new NodeSDK({
    serviceName: "meterflow-gateway",
    traceExporter: new OTLPTraceExporter({
        url: process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT
            ?? "http://tempo:4318/v1/traces",
    }),
})

sdk.start()

const tracer = trace.getTracer("meterflow-gateway")

await tracer.startActiveSpan("gateway.startup", async (span) => {
    span.setAttribute("component", "startup")
    span.end()
})

// 确保测试 Span 已经发送
await sdk.shutdown()