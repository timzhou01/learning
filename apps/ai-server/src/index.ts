import "dotenv/config"
import express from "express"


import { errorMiddleware } from "./common/error.middleware.js"
import cors from "cors"
import { taskRouter } from "./modules/task/task.routes.js"
import { projectRouter } from "./modules/project/project.routes.js"

const app = express()

app.use(cors())

app.use(express.json())


app.use("/tasks", taskRouter)
app.use("/projects", projectRouter)

app.use(errorMiddleware)

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