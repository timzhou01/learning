export class AppError extends Error {
    constructor(
        message: string,
        public readonly statusCode = 500,
    ) {
        super(message)
    }
}

export class AgentRunError extends Error {
    constructor(
        message: string,
        public readonly durationMs: number,
        public readonly usage: {
            inputTokens: number
            outputTokens: number
            totalTokens: number
        },
    ) {
        super(message)
        this.name = "AgentRunError"
    }
}