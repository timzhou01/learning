export interface Workspace {
    readFile(path: string): Promise<string>
    listFiles(path: string): Promise<string[]>
    searchCode(query: string): Promise<string[]>
}