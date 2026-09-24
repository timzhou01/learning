import type {
    Request,
    Response,
} from "express"

import {
    AppError,
} from "../../../common/app.error.js"

import {
    CreateProjectSchema,
} from "../../task/domain/create-project.schema.js"

import {
    ProjectService,
} from "../service/project.service.js"

export class ProjectController {
    constructor(
        private readonly projectService:
            ProjectService,
    ) { }

    createProject = async (
        req: Request,
        res: Response,
    ) => {
        const result =
            CreateProjectSchema.safeParse(
                req.body,
            )

        if (!result.success) {
            throw new AppError(
                result.error.issues
                    .map(
                        (item) =>
                            item.message,
                    )
                    .join(", "),
                400,
            )
        }

        const project =
            await this.projectService.createProject({
                name:
                    result.data.name,

                repositoryPath:
                    result.data.repositoryPath,

                ...(result.data.defaultBranch !== undefined
                    ? {
                        defaultBranch:
                            result.data.defaultBranch,
                    }
                    : {}),
            })

        return res
            .status(201)
            .json(project)
    }

    getProjects = async (
        _req: Request,
        res: Response,
    ) => {
        const projects =
            await this.projectService.getProjects()

        return res.json(projects)
    }

    getProjectById = async (
        req: Request,
        res: Response,
    ) => {
        const project =
            await this.projectService.getProjectById(
                req.params.id as string,
            )

        return res.json(project)
    }
}