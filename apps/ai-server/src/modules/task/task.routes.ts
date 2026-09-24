import { Router } from "express"
import { TaskRepository } from "./repository/task.repository.js"
import { AgentRunRepository } from './repository/agent-run.repository.js'
import { TaskService } from "./service/task.service.js"
import { TaskController } from "./controller/task.controller.js"
import { AgentRunController } from "./controller/agent-run.controller.js"
import { AgentRunService } from "./service/agent-run.service.js"
import { TaskReviewRepository } from "./repository/task-review.repository.js"

const taskRepository = new TaskRepository()
const agentRunRepository = new AgentRunRepository()
const taskReviewRepository =
    new TaskReviewRepository()

const taskService = new TaskService(taskRepository, agentRunRepository, taskReviewRepository)
const taskController = new TaskController(taskService)
const agentRunService = new AgentRunService(agentRunRepository)
const agentRunController = new AgentRunController(agentRunService)

export const taskRouter: Router = Router()

taskRouter.post("/", taskController.createTask)
taskRouter.get("/:id", taskController.getTaskById)
taskRouter.post("/:id/run", taskController.runTask)
taskRouter.get(
    "/:taskId/runs",
    agentRunController.getRunsByTaskId,
)

taskRouter.get(
    "/runs/:runId/steps",
    agentRunController.getStepsByRunId,
)

taskRouter.post(
    "/:id/approve",
    taskController.approveTask,
)

taskRouter.post(
    "/:id/reject",
    taskController.rejectTask,
)

taskRouter.get(
    "/:id/reviews",
    taskController.getTaskReviews,
)

taskRouter.get(
    "/:id/diff",
    taskController.getTaskDiff,
)