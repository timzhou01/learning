import {
    getCoreRules,
    getProjectRule,
    type ProjectRuleName,
} from "../rules/project-rules.js"

import {
    resolveProjectRules,
} from "./resolve-project-rules.js"

export type ProjectContext = {
    selectedRules:
    ProjectRuleName[]

    content: string
}

async function buildProjectContext(
    selectedRules:
        ProjectRuleName[],
): Promise<ProjectContext> {
    const coreRules =
        await getCoreRules()

    const selectedRuleContents =
        await Promise.all(
            selectedRules.map(
                async (
                    ruleName,
                ) => {
                    const content =
                        await getProjectRule(
                            ruleName,
                        )

                    return `
# ${ruleName}

${content}
`
                },
            ),
        )

    const content = [
        "# Core Rules",
        coreRules,
        ...selectedRuleContents,
    ].join(
        "\n\n",
    )

    return {
        selectedRules,
        content,
    }
}

export async function getProjectContext(
    task: string,
): Promise<ProjectContext> {
    const selectedRules =
        await resolveProjectRules(
            task,
        )

    return buildProjectContext(
        selectedRules,
    )
}

export async function getProjectContextFromRules(
    selectedRules:
        ProjectRuleName[],
): Promise<ProjectContext> {
    return buildProjectContext(
        selectedRules,
    )
}