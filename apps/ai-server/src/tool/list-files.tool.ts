import type { Tool } from "./tool.types.js"
import type { Workspace } from "../workspace/workspace.types.js"

type ListFilesArgs = {
    path: string
}

export function createListFilesTool(
    workspace: Workspace,
): Tool<ListFilesArgs, string[]> {
    return {
        definition: {
            type: "function",
            name: "list_files",
            description: "List files and directories inside a workspace directory",
            strict: true,
            parameters: {
                type: "object",
                properties: {
                    path: {
                        type: "string",
                        description: "Directory path relative to the workspace root",
                    },
                },
                required: ["path"],
                additionalProperties: false,
            },
        },

        execute({ path }) {
            return workspace.listFiles(path)
        },
    }
}