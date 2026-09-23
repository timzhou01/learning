import type { Tool } from "./tool.types.js"
import type { Workspace } from "../workspace/workspace.types.js"

type SearchCodeArgs = {
    query: string
}

export function createSearchCodeTool(
    workspace: Workspace,
): Tool<SearchCodeArgs, string[]> {
    return {
        definition: {
            type: "function",
            name: "search_code",
            description:
                "Search for text inside files in the workspace",
            strict: true,
            parameters: {
                type: "object",
                properties: {
                    query: {
                        type: "string",
                        description: "Text to search for",
                    },
                },
                required: ["query"],
                additionalProperties: false,
            },
        },

        execute({ query }) {
            return workspace.searchCode(query)
        },
    }
}