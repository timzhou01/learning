import type { Workspace } from "../workspace/workspace.types.js"
import { createReadFileTool } from "./read-file.tool.js"
import { createListFilesTool } from "./list-files.tool.js"
import { createSearchCodeTool } from "./search-code.tool.js"
import { createGitDiffTool } from "./git-diff.tool.js"
import { createWriteFileTool } from "./write-file.tool.js"

export function createTools(
    workspace: Workspace,
) {
    return [
        createReadFileTool(workspace),
        createListFilesTool(workspace),
        createSearchCodeTool(workspace),
        createWriteFileTool(workspace),
        createGitDiffTool(workspace),
    ]
}

export function getTool(
    tools: ReturnType<typeof createTools>,
    name: string,
) {
    return tools.find(
        (tool) => tool.definition.name === name,
    )
}