import {
    useEffect,
    useState,
} from "react"

const API_URL =
    "http://localhost:3000"

type ProjectRuleType =
    | "architecture"
    | "coding"
    | "implementation"

type ProjectRule = {
    id: string
    projectId: string
    type: ProjectRuleType
    content: string
    createdAt: string
    updatedAt: string
}

async function request<T>(
    path: string,
    options?: RequestInit,
): Promise<T> {
    const response =
        await fetch(
            `${API_URL}${path}`,
            options,
        )

    if (!response.ok) {
        throw new Error(
            `Request failed: ${response.status}`,
        )
    }

    return response.json()
}

function getProjectRules(
    projectId: string,
) {
    return request<ProjectRule[]>(
        `/projects/${projectId}/rules`,
    )
}

function createProjectRule(
    projectId: string,
    input: {
        type: ProjectRuleType
        content: string
    },
) {
    return request<ProjectRule>(
        `/projects/${projectId}/rules`,
        {
            method: "POST",

            headers: {
                "Content-Type":
                    "application/json",
            },

            body:
                JSON.stringify(
                    input,
                ),
        },
    )
}

export function ProjectRules({
    projectId,
}: {
    projectId: string
}) {
    const [
        rules,
        setRules,
    ] =
        useState<ProjectRule[]>(
            [],
        )

    const [
        type,
        setType,
    ] =
        useState<ProjectRuleType>(
            "coding",
        )

    const [
        content,
        setContent,
    ] =
        useState("")

    const [
        creating,
        setCreating,
    ] =
        useState(false)

    const [
        error,
        setError,
    ] =
        useState<
            string | null
        >(
            null,
        )

    const loadRules =
        async () => {
            if (!projectId) {
                setRules(
                    [],
                )

                return
            }

            try {
                const data =
                    await getProjectRules(
                        projectId,
                    )

                setRules(
                    data,
                )
            } catch (err) {
                setError(
                    err instanceof Error
                        ? err.message
                        : "Unknown error",
                )
            }
        }

    const addRule =
        async () => {
            if (
                !projectId ||
                !content.trim()
            ) {
                return
            }

            setCreating(
                true,
            )

            setError(
                null,
            )

            try {
                await createProjectRule(
                    projectId,
                    {
                        type,

                        content:
                            content.trim(),
                    },
                )

                setContent(
                    "",
                )

                await loadRules()
            } catch (err) {
                setError(
                    err instanceof Error
                        ? err.message
                        : "Unknown error",
                )
            } finally {
                setCreating(
                    false,
                )
            }
        }

    useEffect(() => {
        void loadRules()
    }, [
        projectId,
    ])

    if (!projectId) {
        return (
            <div className="emptyState">
                Select a project first.
            </div>
        )
    }

    return (
        <section className="projectRules">
            <div className="projectRulesHeader">
                <strong>
                    Project Rules
                </strong>
            </div>

            <div className="projectRuleForm">
                <select
                    value={
                        type
                    }
                    onChange={(e) =>
                        setType(
                            e.target
                                .value as ProjectRuleType,
                        )
                    }
                >
                    <option value="architecture">
                        Architecture
                    </option>

                    <option value="coding">
                        Coding
                    </option>

                    <option value="implementation">
                        Implementation
                    </option>
                </select>

                <textarea
                    value={
                        content
                    }
                    onChange={(e) =>
                        setContent(
                            e.target.value,
                        )
                    }
                    placeholder="Example: Use TypeScript and prefer service/repository separation."
                    rows={
                        4
                    }
                />

                <button
                    onClick={
                        addRule
                    }
                    disabled={
                        creating ||
                        !content.trim()
                    }
                >
                    {creating
                        ? "Adding..."
                        : "Add Rule"}
                </button>
            </div>

            {error && (
                <div className="errorBlock">
                    {
                        error
                    }
                </div>
            )}

            <div className="projectRuleList">
                {rules.length ===
                    0 ? (
                    <div className="emptyState">
                        No project rules yet.
                    </div>
                ) : (
                    rules.map(
                        (rule) => (
                            <div
                                key={
                                    rule.id
                                }
                                className="projectRuleItem"
                            >
                                <span className="projectRuleType">
                                    {
                                        rule.type
                                    }
                                </span>

                                <p>
                                    {
                                        rule.content
                                    }
                                </p>
                            </div>
                        ),
                    )
                )}
            </div>
        </section>
    )
}