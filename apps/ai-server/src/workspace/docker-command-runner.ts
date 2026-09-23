import { execFile } from "node:child_process"
import { promisify } from "node:util"

const execFileAsync = promisify(execFile)

export type CommandResult = {
    exitCode: number
    stdout: string
    stderr: string
}

export class DockerCommandRunner {
    async run(
        workspacePath: string,
        command: string,
        args: string[],
    ): Promise<CommandResult> {
        const dockerArgs = [
            "run",
            "--rm",

            "--network",
            "none",

            "--memory",
            "512m",

            "--cpus",
            "1",

            "-v",
            `${workspacePath}:/workspace`,

            "-w",
            "/workspace",

            "node:22",

            command,
            ...args,
        ]

        try {
            const {
                stdout,
                stderr,
            } = await execFileAsync(
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
                    execError.killed
                        ? "Command timed out"
                        : execError.stderr ?? "",
            }
        }
    }
}