import type { Tool } from "./tool.types.js"
import type { Workspace } from "../workspace/workspace.types.js"

export function createGitDiffTool(
    workspace: Workspace,
): Tool {
    return {
        definition: {
            type: "function",
            name: "git_diff",
            description:
                "Show the current git diff inside the workspace",
            strict: true,
            parameters: {
                type: "object",
                properties: {},
                required: [],
                additionalProperties: false,
            },
        },

        async execute(_args: unknown) {
            const diff =
                await workspace.getGitDiff()

            if (!diff) {
                return "No changes"
            }

            return diff
        },
    }
}