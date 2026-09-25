import type {
    Request,
    Response,
} from "express"

import {
    AppError,
} from "../../../common/app.error.js"

import {
    CreateProjectRuleSchema,
} from "../domain/create-project-rule.schema.js"

import {
    ProjectRuleService,
} from "../service/project-rule.service.js"

export class ProjectRuleController {
    constructor(
        private readonly projectRuleService:
            ProjectRuleService,
    ) { }

    createRule = async (
        req: Request,
        res: Response,
    ) => {
        const projectId =
            req.params.projectId as string

        if (!projectId) {
            throw new AppError(
                "Project id is required",
                400,
            )
        }

        const result =
            CreateProjectRuleSchema.safeParse(
                req.body,
            )

        if (!result.success) {
            throw new AppError(
                "Invalid project rule input",
                400,
            )
        }

        const rule =
            await this.projectRuleService.createRule(
                {
                    projectId,

                    type:
                        result.data.type,

                    content:
                        result.data.content,
                },
            )

        res.status(201).json(
            rule,
        )
    }

    getRules = async (
        req: Request,
        res: Response,
    ) => {
        const projectId =
            req.params.projectId as string

        if (!projectId) {
            throw new AppError(
                "Project id is required",
                400,
            )
        }

        const type =
            typeof req.query.type ===
                "string"
                ? req.query.type
                : undefined

        const rules =
            type
                ? await this.projectRuleService.getProjectRulesByType(
                    projectId,
                    type,
                )
                : await this.projectRuleService.getProjectRules(
                    projectId,
                )

        res.json(
            rules,
        )
    }
}