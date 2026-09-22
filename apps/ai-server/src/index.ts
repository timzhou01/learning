import "dotenv/config"
import express from "express"
import { createTask, CreateTaskSchema } from "./tasks/create-task.js"

const app = express()

app.use(express.json())

app.post("/tasks", async (req, res) => {
    console.log('test')
    const result = CreateTaskSchema.safeParse(req.body)

    if (!result.success) {
        return res.status(400).json({
            error: "Invalid request",
            details: result.error.flatten(),
        })
    }
    console.log('input')

    const task = await createTask(result.data.input)

    res.json(task)
})

app.get('/health', async (req, res) => {
    res.json({
        message: "Hello Express",
    });
})


app.listen(3000, () => {
    console.log(`AI server running at http://localhost:3000`)
})