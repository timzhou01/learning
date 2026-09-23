import type { Request, Response } from "express"
import { AgentRunService } from "../service/agent-run.service.js"

export class AgentRunController {
    constructor(
        private readonly agentRunService: AgentRunService,
    ) { }

    getRunsByTaskId = async (
        req: Request,
        res: Response,
    ) => {
        const runs =
            await this.agentRunService.getRunsByTaskId(
                req.params.taskId as string,
            )

        return res.json(runs)
    }

    getStepsByRunId = async (
        req: Request,
        res: Response,
    ) => {
        const steps =
            await this.agentRunService.getStepsByRunId(
                req.params.runId as string,
            )

        return res.json(steps)
    }
}