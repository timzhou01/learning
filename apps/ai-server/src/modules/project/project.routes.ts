import { Router } from "express"

import {
    ProjectRepository,
} from "./repository/project.repository.js"

import {
    ProjectService,
} from "./service/project.service.js"

import {
    ProjectController,
} from "./controller/project.controller.js"

const projectRepository =
    new ProjectRepository()

const projectService =
    new ProjectService(
        projectRepository,
    )

const projectController =
    new ProjectController(
        projectService,
    )

export const projectRouter: Router =
    Router()

projectRouter.post(
    "/",
    projectController.createProject,
)

projectRouter.get(
    "/",
    projectController.getProjects,
)

projectRouter.get(
    "/:id",
    projectController.getProjectById,
)