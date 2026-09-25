import type { Tool } from "./tool.types.js"

import {
    getProjectRule,
    type ProjectRuleName,
} from "../rules/project-rules.js"

export function createReadProjectRuleTool(): Tool {
    return {
        definition: {
            type: "function",
            name: "read_project_rule",
            description:
                "Read an additional project rule when the current task reveals a dependency or concern not covered by the initial project context.",
            strict: true,
            parameters: {
                type: "object",
                properties: {
                    name: {
                        type: "string",
                        enum: [
                            "frontend",
                            "backend",
                            "database",
                            "security",
                            "testing",
                        ],
                    },
                },
                required: [
                    "name",
                ],
                additionalProperties: false,
            },
        },

        async execute(args: unknown) {
            const {
                name,
            } = args as {
                name: ProjectRuleName
            }

            const content =
                await getProjectRule(
                    name,
                )

            return `
# ${name} Rules

${content}
`
        },
    }
}