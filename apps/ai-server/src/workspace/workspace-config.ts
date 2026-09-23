export function getWorkspaceConfig() {
    const sourceRepo =
        process.env.AGENT_SOURCE_REPO

    const workspaceBase =
        process.env.AGENT_WORKSPACE_BASE

    if (!sourceRepo) {
        throw new Error(
            "AGENT_SOURCE_REPO is not configured",
        )
    }

    if (!workspaceBase) {
        throw new Error(
            "AGENT_WORKSPACE_BASE is not configured",
        )
    }

    return {
        sourceRepo,
        workspaceBase,
    }
}