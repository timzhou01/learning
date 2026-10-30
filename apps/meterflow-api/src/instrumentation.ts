import { NodeSDK } from "@opentelemetry/sdk-node"
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http"
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node"

const sdk = new NodeSDK({
    serviceName: "meterflow-gateway",

    traceExporter: new OTLPTraceExporter({
        url: process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT
            ?? "http://tempo:4318/v1/traces",
    }),

    instrumentations: [
        getNodeAutoInstrumentations({
            "@opentelemetry/instrumentation-fs": {
                enabled: false,
            },
        }),
    ],
})

sdk.start()

process.once("SIGTERM", () => {
    void sdk.shutdown()
})