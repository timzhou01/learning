
import express from "express"
import { config } from "./config.js"

const app = express()

app.use(express.json())

app.get("/health", (_req, res) => {
    res.json({
        status: "ok",
        service: "meterflow-api",
    })
})

app.listen(config.PORT, () => {
    console.log(
        `MeterFlow API running on port ${config.PORT}`,
    )
})
