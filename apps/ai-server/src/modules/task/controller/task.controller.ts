import type { NextFunction, Request, Response } from "express"
import { TaskService } from "../service/task.service.js"
import { CreateTaskSchema } from "../domain/create-task.schema.js"
import { AppError } from "../../../common/app.error.js"

export class TaskController {
    constructor(
        private readonly taskService: TaskService,
    ) { }

    createTask = async (req: Request, res: Response) => {
        const result = CreateTaskSchema.safeParse(req.body)

        if (!result.success) {
            throw new AppError(
                result.error.issues
                    .map((item) => item.message)
                    .join(", "),
                400,
            )
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

        return res.json(task)
    }

    runTask = async (
        req: Request,
        res: Response,
    ) => {
        const task = await this.taskService.runTask(
            req.params.id as string,
        )

        return res.json(task)
    }

    approveTask = async (
        req: Request,
        res: Response,
        next: NextFunction,
    ) => {
        try {
            const result =
                await this.taskService.approveTask(
                    req.params.id as string,
                )

            res.json(result)
        } catch (error) {
            next(error)
        }
    }

    rejectTask = async (
        req: Request,
        res: Response,
        next: NextFunction,
    ) => {
        try {
            const result =
                await this.taskService.rejectTask(
                    req.params.id as string,
                )

            res.json(result)
        } catch (error) {
            next(error)
        }
    }
}