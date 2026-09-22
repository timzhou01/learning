import "dotenv/config"
import express from "express"

import { taskRouter } from "./modules/task/task.routes.js"

const app = express()

app.use(express.json())

app.use("/tasks", taskRouter)

const port = Number(process.env.PORT ?? 3000)

app.get("/health", (_req, res) => {
    res.json({
        status: "ok",
    })
})



const server = app.listen(port, () => {
    console.log(`AI server running at http://localhost:${port}`)
})

process.on("SIGINT", () => {
    console.log("\nShutting down...")

    server.close(() => {
        console.log("Server closed")
        process.exit(0)
    })
})