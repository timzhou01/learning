
import { createServer } from "node:http"
import type { Registry } from "prom-client"

export function startMetricsServer(
    register: Registry,
    port = 9464,
) {
    const server = createServer(async (req, res) => {
        if (req.url !== "/metrics") {
            res.writeHead(404)
            res.end()
            return
        }

        try {
            res.writeHead(200, {
                "Content-Type": register.contentType,
            })
            res.end(await register.metrics())
        } catch {
            res.writeHead(500)
            res.end("Metrics unavailable")
        }
    })

    server.listen(port)
    return server
}
