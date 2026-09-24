import fs from "node:fs/promises"
import path from "node:path"

import type { Workspace } from "./workspace.types.js"

export type ValidationResult = {
    name: string
    passed: boolean
    output: string
    durationMs: number
}

export class WorkspaceValidator {
    async validate(
        workspacePath: string,
        workspace: Workspace,
    ): Promise<ValidationResult[]> {
        const packageJsonPath = path.join(
            workspacePath,
            "package.json",
        )

        const content = await fs.readFile(
            packageJsonPath,
            "utf8",
        )

        const packageJson = JSON.parse(content) as {
            scripts?: Record<string, string>
        }

        const scripts = packageJson.scripts ?? {}

        const validationScripts = [
            "build",
            "lint",
            "test",
        ] as const

        const results: ValidationResult[] = []

        for (const name of validationScripts) {
            if (!scripts[name]) {
                continue
            }

            const result = await workspace.runCommand(
                "pnpm",
                [name],
            )

            results.push({
                name,
                passed: result.exitCode === 0,
                output:
                    result.stderr ||
                    result.stdout,
                durationMs: result.durationMs,
            })
        }

        return results
    }
}