import type { Tool } from "./tool.types.js"
import type { Workspace } from "../workspace/workspace.types.js"

export function createWriteFileTool(
    workspace: Workspace,
): Tool {
    return {
        definition: {
            type: "function",
            name: "write_file",
            description:
                "Write or replace a text file inside the workspace",
            strict: true,
            parameters: {
                type: "object",
                properties: {
                    path: {
                        type: "string",
                    },
                    content: {
                        type: "string",
                    },
                },
                required: [
                    "path",
                    "content",
                ],
                additionalProperties: false,
            },
        },

        async execute(args: unknown) {
            const {
                path,
                content,
            } = args as {
                path: string
                content: string
            }

            await workspace.writeFile(
                path,
                content,
            )

            return `File written: ${path}`
        },
    }
}