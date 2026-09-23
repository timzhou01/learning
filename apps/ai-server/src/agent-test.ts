import "dotenv/config"

import { runAgent } from "./ai/run-with-tools.js"
import { LocalWorkspace } from "./workspace/local-workspace.js"

const workspace = new LocalWorkspace(process.cwd())

const result = await runAgent(
    `
Inspect this repository and tell me:

Find where TaskService is defined,
then read that file and summarize what it does.

Do not guess. Use tools to inspect the repository.
`,
    workspace,
)

console.log(result)