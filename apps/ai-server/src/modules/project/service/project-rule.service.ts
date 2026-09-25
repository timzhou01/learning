import {
    AppError,
} from "../../../common/app.error.js"

import {
    ProjectRepository,
} from "../repository/project.repository.js"

import {
    ProjectRuleRepository,
} from "../repository/project-rule.repository.js"

export class ProjectRuleService {
    constructor(
        private readonly projectRepository:
            ProjectRepository,

        private readonly projectRuleRepository:
            ProjectRuleRepository,
    ) { }

    async createRule(input: {
        projectId: string
        type: string
        content: string
    }) {
        const project =
            await this.projectRepository.findById(
                input.projectId,
            )

        if (!project) {
            throw new AppError(
                `Project not found: ${input.projectId}`,
                404,
            )
        }

        return this.projectRuleRepository.create(
            input,
        )
    }

    async getProjectRules(
        projectId: string,
    ) {
        const project =
            await this.projectRepository.findById(
                projectId,
            )

        if (!project) {
            throw new AppError(
                `Project not found: ${projectId}`,
                404,
            )
        }

        return this.projectRuleRepository.findByProjectId(
            projectId,
        )
    }

    async getProjectRulesByType(
        projectId: string,
        type: string,
    ) {
        const project =
            await this.projectRepository.findById(
                projectId,
            )

        if (!project) {
            throw new AppError(
                `Project not found: ${projectId}`,
                404,
            )
        }

        return this.projectRuleRepository.findByProjectIdAndType(
            projectId,
            type,
        )
    }
}