import { Router } from "express"
import { TaskRepository } from "./repository/task.repository.js"
import { TaskService } from "./service/task.service.js"
import { TaskController } from "./controller/task.controller.js"

const taskRepository = new TaskRepository()
const taskService = new TaskService(taskRepository)
const taskController = new TaskController(taskService)

export const taskRouter: Router = Router()

taskRouter.post("/", taskController.createTask)
taskRouter.get("/:id", taskController.getTaskById)