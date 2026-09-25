import { AppError } from "../../../common/app.error.js"
import { AgentRunRepository } from "../repository/agent-run.repository.js"

export class AgentRunService {
    constructor(
        private readonly agentRunRepository: AgentRunRepository,
    ) { }

    async getRunsByTaskId(taskId: string) {
        return this.agentRunRepository.findRunsByTaskId(taskId)
    }

    async getStepsByRunId(
        runId: string,
    ) {
        return this.agentRunRepository.findStepsByRunId(
            runId,
        )
    }
}