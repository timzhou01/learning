import type { Tool } from "./tool.types.js"
import type { Workspace } from "../workspace/workspace.types.js"

export function createRunCommandTool(
    workspace: Workspace,
): Tool {
    return {
        definition: {
            type: "function",
            name: "run_command",
            description:
                "Run an allowed validation command inside the current workspace. Supported commands are pnpm test, pnpm lint, and pnpm build.",
            strict: true,
            parameters: {
                type: "object",
                properties: {
                    command: {
                        type: "string",
                        enum: ["pnpm"],
                    },
                    args: {
                        type: "array",
                        items: {
                            type: "string",
                        },
                    },
                },
                required: [
                    "command",
                    "args",
                ],
                additionalProperties: false,
            },
        },

        async execute(args: unknown) {
            const {
                command,
                args: commandArgs,
            } = args as {
                command: string
                args: string[]
            }

            return workspace.runCommand(
                command,
                commandArgs,
            )
        },
    }
}