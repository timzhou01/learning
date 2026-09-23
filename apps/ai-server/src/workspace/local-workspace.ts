import fs from "node:fs/promises"
import path from "node:path"

import type { Workspace } from "./workspace.types.js"

export class LocalWorkspace implements Workspace {
    constructor(
        private readonly root: string,
    ) { }

    async readFile(filePath: string): Promise<string> {
        const fullPath = await this.resolveSafePath(filePath)

        return fs.readFile(fullPath, "utf8")
    }

    async listFiles(dirPath: string): Promise<string[]> {
        const fullPath = await this.resolveSafePath(dirPath)

        const entries = await fs.readdir(fullPath, {
            withFileTypes: true,
        })

        return entries.map((entry) =>
            entry.isDirectory()
                ? `${entry.name}/`
                : entry.name,
        )
    }

    async searchCode(query: string): Promise<string[]> {
        const results: string[] = []

        const walk = async (dir: string) => {
            const entries = await fs.readdir(dir, {
                withFileTypes: true,
            })

            for (const entry of entries) {
                const fullPath = path.join(dir, entry.name)

                if (entry.isDirectory()) {
                    if (
                        entry.name === "node_modules" ||
                        entry.name === ".git"
                    ) {
                        continue
                    }

                    await walk(fullPath)
                    continue
                }

                const content = await fs.readFile(
                    fullPath,
                    "utf8",
                ).catch(() => null)

                if (!content) {
                    continue
                }

                if (content.includes(query)) {
                    results.push(
                        path.relative(this.root, fullPath),
                    )
                }
            }
        }

        const root = await fs.realpath(this.root)

        await walk(root)

        return results
    }

    private async resolveSafePath(
        inputPath: string,
    ): Promise<string> {
        const root = await fs.realpath(this.root)

        const resolved = path.resolve(
            root,
            inputPath,
        )

        const realPath = await fs.realpath(resolved)

        if (
            realPath !== root &&
            !realPath.startsWith(root + path.sep)
        ) {
            throw new Error(
                "Access outside workspace is not allowed",
            )
        }

        return realPath
    }
}