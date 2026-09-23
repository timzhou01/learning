import type { Tool } from "./tool.types.js"
import type { Workspace } from "../workspace/workspace.types.js"

type ReadFileArgs = {
    path: string
}

export function createReadFileTool(
    workspace: Workspace,
): Tool<ReadFileArgs, string> {
    return {
        definition: {
            type: "function",
            name: "read_file",
            description: "Read a text file from the workspace",
            strict: true,
            parameters: {
                type: "object",
                properties: {
                    path: {
                        type: "string",
                    },
                },
                required: ["path"],
                additionalProperties: false,
            },
        },

        execute({ path }) {
            return workspace.readFile(path)
        },
    }
}