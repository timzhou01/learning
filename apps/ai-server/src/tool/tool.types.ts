export type ToolDefinition = {
    type: "function"
    name: string
    description: string
    strict: true
    parameters: Record<string, unknown>
}

export type Tool<TArgs = unknown, TResult = unknown> = {
    definition: ToolDefinition
    execute: (args: TArgs) => Promise<TResult>
}