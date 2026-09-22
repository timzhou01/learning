import type { Request, Response } from "express"
import { TaskService } from "../service/task.service.js"
import { CreateTaskSchema } from "../domain/create-task.schema.js"

export class TaskController {
    constructor(
        private readonly taskService: TaskService,
    ) { }

    createTask = async (req: Request, res: Response) => {
        const result = CreateTaskSchema.safeParse(req.body)

        if (!result.success) {
            return res.status(400).json({
                error: "Invalid request",
                details: result.error.flatten(),
            })
        }
        console.log('input', result.data.input)
        const task = await this.taskService.createTask(
            result.data.input,
        )

        return res.status(201).json(task)
    }

    getTaskById = async (req: Request, res: Response) => {
        const task = await this.taskService.getTaskById(
            req.params.id as string,
        )

        if (!task) {
            return res.status(404).json({
                error: "Task not found",
            })
        }

        return res.json(task)
    }
}