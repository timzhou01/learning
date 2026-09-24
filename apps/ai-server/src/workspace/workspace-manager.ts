import fs from "node:fs/promises"
import path from "node:path"
import { execFile } from "node:child_process"
import { promisify } from "node:util"
import { DockerCommandRunner } from "./docker-command-runner.js"

const execFileAsync = promisify(execFile)

export class WorkspaceManager {
    constructor(
        private readonly sourceRepo: string,
        private readonly workspaceBase: string,
    ) { }

    async createWorkspace(
        taskId: string,
    ): Promise<string> {
        const sourceRepo = path.resolve(
            this.sourceRepo,
        )

        const workspacePath = path.resolve(
            this.workspaceBase,
            taskId,
        )

        const branchName = `agent/${taskId}`

        await fs.mkdir(
            this.workspaceBase,
            {
                recursive: true,
            },
        )

        await execFileAsync(
            "git",
            [
                "worktree",
                "add",
                "-b",
                branchName,
                workspacePath,
                "HEAD",
            ],
            {
                cwd: sourceRepo,
            },
        )

        return workspacePath
    }

    async hasChanges(
        workspacePath: string,
    ): Promise<boolean> {
        const { stdout } = await execFileAsync(
            "git",
            ["status", "--porcelain"],
            {
                cwd: workspacePath,
            },
        )

        return stdout.trim().length > 0
    }

    async commitChanges(
        workspacePath: string,
        message: string,
    ): Promise<string | null> {

        const hasChanges =
            await this.hasChanges(workspacePath)

        if (!hasChanges) {
            return null
        }

        await execFileAsync(
            "git",
            ["add", "."],
            {
                cwd: workspacePath,
            },
        )

        await execFileAsync(
            "git",
            [
                "commit",
                "-m",
                message,
            ],
            {
                cwd: workspacePath,
            },
        )

        const { stdout } = await execFileAsync(
            "git",
            [
                "rev-parse",
                "HEAD",
            ],
            {
                cwd: workspacePath,
            },
        )

        return stdout.trim()
    }

    async approveTask(
        taskId: string,
    ): Promise<void> {
        const branchName = `agent/${taskId}`

        await execFileAsync(
            "git",
            [
                "merge",
                "--no-ff",
                branchName,
                "-m",
                `merge agent task ${taskId}`,
            ],
            {
                cwd: this.sourceRepo,
            },
        )

        await this.removeWorkspace(taskId)

        await this.deleteTaskBranch(taskId)
    }

    async rejectTask(
        taskId: string,
    ): Promise<void> {
        const branchName = `agent/${taskId}`

        await this.removeWorkspace(taskId)

        await execFileAsync(
            "git",
            [
                "branch",
                "-D",
                branchName,
            ],
            {
                cwd: this.sourceRepo,
            },
        )
    }

    async prepareWorkspace(
        workspacePath: string,
    ): Promise<void> {
        const runner =
            new DockerCommandRunner()

        const result = await runner.run(
            workspacePath,
            "pnpm",
            [
                "install",
                "--prefer-offline",
                "--frozen-lockfile",
                "--store-dir",
                "/pnpm-store",
            ],
            true,
        )

        if (result.exitCode !== 0) {
            throw new Error(
                `Failed to prepare workspace:\n${result.stderr || result.stdout}`,
            )
        }
    }

    async removeWorkspace(
        taskId: string,
    ): Promise<void> {
        const workspacePath = path.resolve(
            this.workspaceBase,
            taskId,
        )

        await execFileAsync(
            "git",
            [
                "worktree",
                "remove",
                "--force",
                workspacePath,
            ],
            {
                cwd: this.sourceRepo,
            },
        )
    }

    async deleteTaskBranch(
        taskId: string,
    ): Promise<void> {
        const branchName = `agent/${taskId}`

        await execFileAsync(
            "git",
            [
                "branch",
                "-d",
                branchName,
            ],
            {
                cwd: this.sourceRepo,
            },
        )
    }
}