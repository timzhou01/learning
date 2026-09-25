import type { Tool } from "./tool.types.js"
import type { Workspace } from "../workspace/workspace.types.js"

export function createInstallDependencyTool(
    workspace: Workspace,
): Tool {
    return {
        definition: {
            type: "function",
            name: "install_dependency",
            description:
                "Install an npm dependency into the current project using pnpm. Use dev=true for development dependencies.",
            strict: true,
            parameters: {
                type: "object",
                properties: {
                    packageName: {
                        type: "string",
                    },
                    dev: {
                        type: "boolean",
                    },
                },
                required: [
                    "packageName",
                    "dev",
                ],
                additionalProperties: false,
            },
        },

        async execute(args: unknown) {
            const {
                packageName,
                dev,
            } = args as {
                packageName: string
                dev: boolean
            }

            return workspace.installDependency(
                packageName,
                dev,
            )
        },
    }
}