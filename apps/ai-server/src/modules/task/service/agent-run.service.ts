import { AppError } from "../../../common/app.error.js"
import { AgentRunRepository } from "../repository/agent-run.repository.js"

export class AgentRunService {
    constructor(
        private readonly agentRunRepository: AgentRunRepository,
    ) { }

    async getRunsByTaskId(taskId: string) {
        return this.agentRunRepository.findRunsByTaskId(taskId)
    }

    async getStepsByRunId(runId: string) {
        const steps =
            await this.agentRunRepository.findStepsByRunId(runId)

        if (steps.length === 0) {
            throw new AppError(
                `Agent run steps not found: ${runId}`,
                404,
            )
        }

        return steps
    }
}