import {
    readFile,
} from "node:fs/promises"

import {
    dirname,
    join,
} from "node:path"

import {
    fileURLToPath,
} from "node:url"

const currentFile =
    fileURLToPath(
        import.meta.url,
    )

const currentDir =
    dirname(currentFile)

export type ProjectRuleName =
    | "frontend"
    | "backend"
    | "database"
    | "security"
    | "testing"

export type ProjectRuleCatalogItem = {
    name: ProjectRuleName
    description: string
}

const ruleCatalog:
    ProjectRuleCatalogItem[] = [
        {
            name: "frontend",
            description:
                "Frontend architecture, React, UI, state management and API usage.",
        },
        {
            name: "backend",
            description:
                "Backend architecture, service, repository and API design.",
        },
        {
            name: "database",
            description:
                "Database schema, query, transaction and migration rules.",
        },
        {
            name: "security",
            description:
                "Authentication, authorization, sensitive data and security rules.",
        },
        {
            name: "testing",
            description:
                "Testing strategy, validation and quality requirements.",
        },
    ]

async function readRule(
    fileName: string,
) {
    return readFile(
        join(
            currentDir,
            fileName,
        ),
        "utf-8",
    )
}

export async function getCoreRules() {
    return readRule(
        "core.md",
    )
}

export function getRuleCatalog() {
    return ruleCatalog
}

export async function getProjectRule(
    name: ProjectRuleName,
) {
    return readRule(
        `${name}.md`,
    )
}