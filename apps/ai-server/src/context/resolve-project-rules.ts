import {
    z,
} from "zod"

import {
    zodTextFormat,
} from "openai/helpers/zod"

import {
    openai,
} from "../ai/openai.js"

import {
    getRuleCatalog,
    type ProjectRuleName,
} from "../rules/project-rules.js"

const RuleSelectionSchema =
    z.object({
        rules: z.array(
            z.enum([
                "frontend",
                "backend",
                "database",
                "security",
                "testing",
            ]),
        ),
    })

export async function resolveProjectRules(
    task: string,
): Promise<ProjectRuleName[]> {
    const catalog =
        getRuleCatalog()

    const catalogText =
        catalog
            .map(
                (item) =>
                    `- ${item.name}: ${item.description}`,
            )
            .join("\n")

    const response =
        await openai.responses.parse({
            model: "gpt-5.6",

            instructions: `
You are a project context resolver.

Your job is to select which project rules are likely relevant to the task.

Do not solve the task.
Do not write code.

Available project rules:

${catalogText}

Select only rules that are reasonably relevant.

If a rule might be important because of hidden engineering concerns,
such as security, testing, data access, or cross-layer dependencies,
include it even if the task does not explicitly mention it.
`,

            input: task,

            text: {
                format:
                    zodTextFormat(
                        RuleSelectionSchema,
                        "rule_selection",
                    ),
            },
        })

    if (
        !response.output_parsed
    ) {
        throw new Error(
            "Failed to resolve project rules",
        )
    }

    return response.output_parsed.rules
}