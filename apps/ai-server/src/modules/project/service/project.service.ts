import {
    AppError,
} from "../../../common/app.error.js"

import {
    ProjectRepository,
} from "../repository/project.repository.js"

export class ProjectService {
    constructor(
        private readonly projectRepository:
            ProjectRepository,
    ) { }

    async createProject(input: {
        name: string
        repositoryPath: string
        defaultBranch?: string
    }) {
        return this.projectRepository.create(
            input,
        )
    }

    async getProjects() {
        return this.projectRepository.findAll()
    }

    async getProjectById(
        id: string,
    ) {
        const project =
            await this.projectRepository.findById(
                id,
            )

        if (!project) {
            throw new AppError(
                `Project not found: ${id}`,
                404,
            )
        }

        return project
    }
}