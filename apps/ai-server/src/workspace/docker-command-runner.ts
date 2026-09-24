import { execFile } from "node:child_process"
import { promisify } from "node:util"

const execFileAsync = promisify(execFile)

export type CommandResult = {
    exitCode: number
    stdout: string
    stderr: string
    durationMs: number
    timedOut: boolean
}

export class DockerCommandRunner {
    async run(
        workspacePath: string,
        command: string,
        args: string[],
        networkEnabled = false,
    ): Promise<CommandResult> {
        const startedAt = Date.now()

        const dockerArgs = [
            "run",
            "--rm",

            "--memory",
            "512m",

            "--cpus",
            "1",

            "-v",
            `${workspacePath}:/workspace`,

            "-v",
            "task-agent-pnpm-store:/pnpm-store",

            "-e",
            "npm_config_store_dir=/pnpm-store",

            "-w",
            "/workspace",
        ]

        if (!networkEnabled) {
            dockerArgs.push(
                "--network",
                "none",
            )
        }

        dockerArgs.push(
            "task-agent-sandbox:local",
            command,
            ...args,
        )

        try {
            const { stdout, stderr } =
                await execFileAsync(
                    "docker",
                    dockerArgs,
                    {
                        timeout: 60_000,
                        maxBuffer:
                            10 * 1024 * 1024,
                    },
                )

            return {
                exitCode: 0,
                stdout,
                stderr,
                durationMs:
                    Date.now() - startedAt,
                timedOut: false,
            }
        } catch (error) {
            const execError =
                error as {
                    code?: number | string
                    stdout?: string
                    stderr?: string
                    killed?: boolean
                }

            return {
                exitCode:
                    typeof execError.code === "number"
                        ? execError.code
                        : 1,

                stdout:
                    execError.stdout ?? "",

                stderr:
                    execError.stderr ?? "",

                durationMs:
                    Date.now() - startedAt,

                timedOut:
                    execError.killed === true,
            }
        }
    }


}