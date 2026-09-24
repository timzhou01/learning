export interface Workspace {
    readFile(path: string): Promise<string>
    listFiles(path: string): Promise<string[]>
    searchCode(query: string): Promise<string[]>
    writeFile(path: string, content: string): Promise<void>
    getGitDiff(): Promise<string>
    runCommand(
        command: string,
        args: string[],
    ): Promise<CommandResult>
}

export type CommandResult = {
    exitCode: number
    stdout: string
    stderr: string
    durationMs: number
}