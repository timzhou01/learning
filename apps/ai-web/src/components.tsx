import {
    useState,
    type ReactNode,
} from "react"

import type {
    AgentRun,
    AgentStep,
    AgentStepGroup,
    ProcessState,
    Project,
    Task,
    TaskReview,
    ValidationResult,
    WorkbenchStep,
} from "./types"

export const WORKBENCH_STEPS: {
    key: WorkbenchStep
    label: string
    description: string
}[] = [
        {
            key: "task",
            label: "Task",
            description: "Define task",
        },
        {
            key: "plan",
            label: "Plan",
            description: "Generate plan",
        },
        {
            key: "execute",
            label: "Execute",
            description: "Run agent",
        },
        {
            key: "validate",
            label: "Validate",
            description: "Check result",
        },
        {
            key: "review",
            label: "Review",
            description: "Approve changes",
        },
    ]

export function ProjectBar({
    projects,
    selectedProjectId,
    onSelectProject,
    onCreateProject,
    polling,
    task,
}: {
    projects: Project[]

    selectedProjectId: string

    onSelectProject: (
        id: string,
    ) => void

    onCreateProject: () => void

    polling: boolean

    task: Task | null
}) {
    return (
        <header className="topbar">
            <div className="brand">
                <h1>
                    AI Coding Agent
                </h1>

                <span>
                    Development Workbench
                </span>
            </div>

            <div className="topbarRight">
                <select
                    className="projectSelect"
                    value={
                        selectedProjectId
                    }
                    onChange={(e) =>
                        onSelectProject(
                            e.target.value,
                        )
                    }
                >
                    {projects.length ===
                        0 && (
                            <option value="">
                                No Project
                            </option>
                        )}

                    {projects.map(
                        (project) => (
                            <option
                                key={
                                    project.id
                                }
                                value={
                                    project.id
                                }
                            >
                                {
                                    project.name
                                }
                            </option>
                        ),
                    )}
                </select>

                <button
                    className="newProjectButton"
                    onClick={
                        onCreateProject
                    }
                >
                    + Project
                </button>

                {polling && (
                    <span className="polling">
                        <span className="pollingDot" />

                        Running
                    </span>
                )}

                {task && (
                    <>
                        <span className="topTaskId">
                            {
                                task.id
                            }
                        </span>

                        <span
                            className={`status status-${task.status}`}
                        >
                            {
                                task.status
                            }
                        </span>
                    </>
                )}
            </div>
        </header>
    )
}

export function ProcessSidebar({
    activeStep,
    stepStates,
    onChange,
}: {
    activeStep:
    WorkbenchStep

    stepStates: Record<
        WorkbenchStep,
        ProcessState
    >

    onChange: (
        step:
            WorkbenchStep,
    ) => void
}) {
    return (
        <aside className="processPanel">
            <div className="panelHeader">
                <strong>
                    Process
                </strong>
            </div>

            <div className="processContent">
                {WORKBENCH_STEPS.map(
                    (
                        step,
                        index,
                    ) => {
                        const state =
                            stepStates[
                            step.key
                            ]

                        return (
                            <div
                                key={
                                    step.key
                                }
                                className="processStepWrapper"
                            >
                                <button
                                    className={[
                                        "processStep",

                                        activeStep ===
                                            step.key
                                            ? "processStepSelected"
                                            : "",
                                    ]
                                        .filter(
                                            Boolean,
                                        )
                                        .join(
                                            " ",
                                        )}
                                    onClick={() =>
                                        onChange(
                                            step.key,
                                        )
                                    }
                                >
                                    <span
                                        className={[
                                            "processState",
                                            `processState-${state}`,
                                        ].join(
                                            " ",
                                        )}
                                    >
                                        {
                                            getProcessIcon(
                                                state,
                                            )
                                        }
                                    </span>

                                    <span className="processText">
                                        <strong>
                                            {
                                                step.label
                                            }
                                        </strong>

                                        <small>
                                            {
                                                step.description
                                            }
                                        </small>
                                    </span>
                                </button>

                                {index <
                                    WORKBENCH_STEPS.length -
                                    1 && (
                                        <div className="processLine" />
                                    )}
                            </div>
                        )
                    },
                )}
            </div>
        </aside>
    )
}

export function TaskPanel({
    activeStep,
    task,
    project,
    input,
    setInput,
    creating,
    running,
    createTask,
    runTask,
    groupedSteps,
    latestRun,
    diff,
}: {
    activeStep:
    WorkbenchStep

    task:
    Task | null

    project:
    Project | null

    input: string

    setInput: (
        value: string,
    ) => void

    creating: boolean

    running: boolean

    createTask: () =>
        Promise<void>

    runTask: () =>
        Promise<void>

    groupedSteps:
    AgentStepGroup[]

    latestRun:
    AgentRun | null

    diff: string
}) {
    const step =
        WORKBENCH_STEPS.find(
            (item) =>
                item.key ===
                activeStep,
        )

    return (
        <main className="workspacePanel">
            <div className="panelHeader">
                <div>
                    <strong>
                        {
                            step?.label
                        }
                    </strong>

                    <span className="panelHeaderDescription">
                        {
                            step?.description
                        }
                    </span>
                </div>
            </div>

            <div className="panelContent">
                {activeStep ===
                    "task" && (
                        <TaskWorkspace
                            input={
                                input
                            }
                            setInput={
                                setInput
                            }
                            task={
                                task
                            }
                            project={
                                project
                            }
                            creating={
                                creating
                            }
                            running={
                                running
                            }
                            createTask={
                                createTask
                            }
                            runTask={
                                runTask
                            }
                        />
                    )}

                {activeStep ===
                    "plan" && (
                        <PlanWorkspace
                            task={
                                task
                            }
                        />
                    )}

                {activeStep ===
                    "execute" && (
                        <ExecuteWorkspace
                            groups={
                                groupedSteps
                            }
                        />
                    )}

                {activeStep ===
                    "validate" && (
                        <ValidateWorkspace
                            run={
                                latestRun
                            }
                        />
                    )}

                {activeStep ===
                    "review" && (
                        <ReviewWorkspace
                            diff={
                                diff
                            }
                        />
                    )}
            </div>
        </main>
    )
}

export function ResultPanel({
    activeStep,
    task,
    project,
    error,
    latestRun,
    groupedSteps,
    reviews,
    reviewComment,
    setReviewComment,
    reviewing,
    reviewTask,
}: {
    activeStep:
    WorkbenchStep

    task:
    Task | null

    project:
    Project | null

    error:
    string | null

    latestRun:
    AgentRun | null

    groupedSteps:
    AgentStepGroup[]

    reviews:
    TaskReview[]

    reviewComment:
    string

    setReviewComment: (
        value: string,
    ) => void

    reviewing:
    boolean

    reviewTask: (
        decision:
            | "approve"
            | "reject",
    ) =>
        Promise<void>
}) {
    return (
        <aside className="inspectorPanel">
            <div className="panelHeader">
                <strong>
                    Inspector
                </strong>
            </div>

            <div className="panelContent">
                {activeStep ===
                    "task" && (
                        <TaskInspector
                            task={
                                task
                            }
                            project={
                                project
                            }
                            error={
                                error
                            }
                        />
                    )}

                {activeStep ===
                    "plan" && (
                        <PlanInspector
                            task={
                                task
                            }
                        />
                    )}

                {activeStep ===
                    "execute" && (
                        <ExecuteInspector
                            run={
                                latestRun
                            }
                            groups={
                                groupedSteps
                            }
                        />
                    )}

                {activeStep ===
                    "validate" && (
                        <ValidateInspector
                            run={
                                latestRun
                            }
                        />
                    )}

                {activeStep ===
                    "review" && (
                        <ReviewInspector
                            task={
                                task
                            }
                            reviews={
                                reviews
                            }
                            reviewComment={
                                reviewComment
                            }
                            setReviewComment={
                                setReviewComment
                            }
                            reviewing={
                                reviewing
                            }
                            reviewTask={
                                reviewTask
                            }
                        />
                    )}
            </div>
        </aside>
    )
}

export function CreateProjectModal({
    open,
    name,
    repositoryPath,
    defaultBranch,
    creating,
    onNameChange,
    onRepositoryPathChange,
    onDefaultBranchChange,
    onClose,
    onCreate,
}: {
    open: boolean

    name: string

    repositoryPath:
    string

    defaultBranch:
    string

    creating:
    boolean

    onNameChange: (
        value: string,
    ) => void

    onRepositoryPathChange: (
        value: string,
    ) => void

    onDefaultBranchChange: (
        value: string,
    ) => void

    onClose: () => void

    onCreate: () =>
        Promise<void>
}) {
    if (!open) {
        return null
    }

    return (
        <div className="modalOverlay">
            <div className="projectModal">
                <h2>
                    Create Project
                </h2>

                <label>
                    Name
                </label>

                <input
                    value={
                        name
                    }
                    onChange={(e) =>
                        onNameChange(
                            e.target.value,
                        )
                    }
                    placeholder="Demo Project"
                />

                <label>
                    Repository Path
                </label>

                <input
                    value={
                        repositoryPath
                    }
                    onChange={(e) =>
                        onRepositoryPathChange(
                            e.target.value,
                        )
                    }
                    placeholder="/Users/chaozhou/work/target-repos/demo-project"
                />

                <label>
                    Default Branch
                </label>

                <input
                    value={
                        defaultBranch
                    }
                    onChange={(e) =>
                        onDefaultBranchChange(
                            e.target.value,
                        )
                    }
                    placeholder="main"
                />

                <div className="projectModalActions">
                    <button
                        className="secondaryButton"
                        onClick={
                            onClose
                        }
                    >
                        Cancel
                    </button>

                    <button
                        onClick={
                            onCreate
                        }
                        disabled={
                            creating ||
                            !name.trim() ||
                            !repositoryPath.trim()
                        }
                    >
                        {creating
                            ? "Creating..."
                            : "Create"}
                    </button>
                </div>
            </div>
        </div>
    )
}

function TaskWorkspace({
    input,
    setInput,
    task,
    project,
    creating,
    running,
    createTask,
    runTask,
}: {
    input: string

    setInput: (
        value: string,
    ) => void

    task:
    Task | null

    project:
    Project | null

    creating:
    boolean

    running:
    boolean

    createTask: () =>
        Promise<void>

    runTask: () =>
        Promise<void>
}) {
    return (
        <div className="taskWorkspace">
            <div className="workspaceIntro">
                <h2>
                    What should the agent do?
                </h2>

                <p>
                    {project
                        ? `Project: ${project.name}`
                        : "Select a project first."}
                </p>
            </div>

            <textarea
                className="taskInput"
                value={
                    input
                }
                onChange={(e) =>
                    setInput(
                        e.target.value,
                    )
                }
                placeholder="Describe your coding task..."
                disabled={
                    creating ||
                    running
                }
            />

            <div className="workspaceActions">
                <button
                    onClick={
                        createTask
                    }
                    disabled={
                        creating ||
                        !project ||
                        !input.trim()
                    }
                >
                    {creating
                        ? "Creating..."
                        : "Create Task"}
                </button>

                <button
                    onClick={
                        runTask
                    }
                    disabled={
                        !task ||
                        task.status !==
                        "ready" ||
                        running
                    }
                >
                    {running
                        ? "Running..."
                        : "Run Task"}
                </button>
            </div>
        </div>
    )
}

function TaskInspector({
    task,
    project,
    error,
}: {
    task:
    Task | null

    project:
    Project | null

    error:
    string | null
}) {
    return (
        <>
            {project && (
                <InspectorSection title="Project">
                    <InfoRow
                        label="Name"
                        value={
                            project.name
                        }
                    />

                    <InfoRow
                        label="Branch"
                        value={
                            project.defaultBranch
                        }
                    />

                    <InfoRow
                        label="Repository"
                        value={
                            project.repositoryPath
                        }
                    />
                </InspectorSection>
            )}

            {!task ? (
                <EmptyState text="Create a task to start the workflow." />
            ) : (
                <>
                    <InspectorSection title="Task">
                        <InfoRow
                            label="Status"
                            value={
                                task.status
                            }
                        />

                        <InfoRow
                            label="Task ID"
                            value={
                                task.id
                            }
                        />
                    </InspectorSection>

                    {task.result && (
                        <InspectorSection title="Result">
                            <pre>
                                {
                                    task.result
                                }
                            </pre>
                        </InspectorSection>
                    )}

                    {task.error && (
                        <InspectorSection title="Error">
                            <ErrorBlock>
                                {
                                    task.error
                                }
                            </ErrorBlock>
                        </InspectorSection>
                    )}
                </>
            )}

            {error && (
                <InspectorSection title="Error">
                    <ErrorBlock>
                        {
                            error
                        }
                    </ErrorBlock>
                </InspectorSection>
            )}
        </>
    )
}

function PlanWorkspace({
    task,
}: {
    task:
    Task | null
}) {
    if (!task?.plan) {
        return (
            <EmptyState text="No plan has been generated yet." />
        )
    }

    return (
        <div className="planWorkspace">
            {task.plan.summary && (
                <div className="planSummary">
                    {
                        task.plan.summary
                    }
                </div>
            )}

            <div className="planList">
                {task.plan.steps?.map(
                    (
                        step,
                        index,
                    ) => (
                        <div
                            key={
                                index
                            }
                            className="planItem"
                        >
                            <div className="planNumber">
                                {
                                    index +
                                    1
                                }
                            </div>

                            <div>
                                {
                                    step
                                }
                            </div>
                        </div>
                    ),
                )}
            </div>
        </div>
    )
}

function PlanInspector({
    task,
}: {
    task:
    Task | null
}) {
    return (
        <InspectorSection title="Plan">
            <InfoRow
                label="Status"
                value={
                    task?.plan
                        ? "Generated"
                        : "Pending"
                }
            />

            <InfoRow
                label="Steps"
                value={String(
                    task?.plan
                        ?.steps
                        ?.length ??
                    0,
                )}
            />
        </InspectorSection>
    )
}

function ExecuteWorkspace({
    groups,
}: {
    groups:
    AgentStepGroup[]
}) {
    if (
        groups.length ===
        0
    ) {
        return (
            <EmptyState text="No agent execution data yet." />
        )
    }

    return (
        <div className="executeWorkspace">
            {groups.map(
                (group) => (
                    <section
                        key={
                            group.attempt
                        }
                        className="agentAttempt"
                    >
                        <div className="attemptHeader">
                            <strong>
                                Attempt{" "}
                                {
                                    group.attempt
                                }
                            </strong>

                            <span
                                className={
                                    group.phase ===
                                        "repair"
                                        ? "repairBadge"
                                        : "initialBadge"
                                }
                            >
                                {
                                    group.phase
                                }
                            </span>
                        </div>

                        {group.steps.map(
                            (step) => (
                                <AgentStepItem
                                    key={
                                        step.id
                                    }
                                    step={
                                        step
                                    }
                                />
                            ),
                        )}
                    </section>
                ),
            )}
        </div>
    )
}

function ExecuteInspector({
    run,
    groups,
}: {
    run:
    AgentRun | null

    groups:
    AgentStepGroup[]
}) {
    if (!run) {
        return (
            <EmptyState text="Run the agent to see execution metrics." />
        )
    }

    const toolCalls =
        groups.reduce(
            (
                total,
                group,
            ) =>
                total +
                group.steps.length,
            0,
        )

    return (
        <>
            <InspectorSection title="Run Summary">
                <MetricGrid>
                    <Metric
                        label="Duration"
                        value={`${run.durationMs ?? 0} ms`}
                    />

                    <Metric
                        label="Tokens"
                        value={
                            run.totalTokens ??
                            0
                        }
                    />

                    <Metric
                        label="Attempts"
                        value={
                            groups.length
                        }
                    />

                    <Metric
                        label="Tool Calls"
                        value={
                            toolCalls
                        }
                    />
                </MetricGrid>
            </InspectorSection>

            <InspectorSection title="Tokens">
                <InfoRow
                    label="Input"
                    value={String(
                        run.inputTokens ??
                        0,
                    )}
                />

                <InfoRow
                    label="Output"
                    value={String(
                        run.outputTokens ??
                        0,
                    )}
                />
            </InspectorSection>

            {run.result && (
                <InspectorSection title="Result">
                    <pre>
                        {
                            run.result
                        }
                    </pre>
                </InspectorSection>
            )}
        </>
    )
}

function ValidateWorkspace({
    run,
}: {
    run:
    AgentRun | null
}) {
    if (
        !run?.validationAttempts ||
        run.validationAttempts
            .length === 0
    ) {
        return (
            <EmptyState text="No validation data yet." />
        )
    }

    return (
        <div className="validationWorkspace">
            {run.validationAttempts.map(
                (attempt) => (
                    <section
                        key={
                            attempt.attempt
                        }
                        className="validationAttemptCard"
                    >
                        <div className="attemptHeader">
                            <strong>
                                Attempt{" "}
                                {
                                    attempt.attempt
                                }
                            </strong>

                            <span
                                className={
                                    attempt.type ===
                                        "repair"
                                        ? "repairBadge"
                                        : "initialBadge"
                                }
                            >
                                {
                                    attempt.type
                                }
                            </span>
                        </div>

                        <div className="validationList">
                            {attempt.results.map(
                                (result) => (
                                    <ValidationResultItem
                                        key={
                                            result.name
                                        }
                                        result={
                                            result
                                        }
                                    />
                                ),
                            )}
                        </div>
                    </section>
                ),
            )}
        </div>
    )
}

function ValidateInspector({
    run,
}: {
    run:
    AgentRun | null
}) {
    if (!run) {
        return (
            <EmptyState text="No validation data yet." />
        )
    }

    const finalResults =
        run.validationResults ??
        []

    const passed =
        finalResults.filter(
            (item) =>
                item.passed,
        ).length

    const failed =
        finalResults.filter(
            (item) =>
                !item.passed,
        ).length

    const attempts =
        run.validationAttempts
            ?.length ??
        0

    return (
        <>
            <InspectorSection title="Validation">
                <MetricGrid>
                    <Metric
                        label="Passed"
                        value={
                            passed
                        }
                    />

                    <Metric
                        label="Failed"
                        value={
                            failed
                        }
                    />

                    <Metric
                        label="Attempts"
                        value={
                            attempts
                        }
                    />

                    <Metric
                        label="Repairs"
                        value={Math.max(
                            0,
                            attempts -
                            1,
                        )}
                    />
                </MetricGrid>
            </InspectorSection>

            {finalResults.length >
                0 && (
                    <InspectorSection title="Final Result">
                        {finalResults.map(
                            (result) => (
                                <div
                                    key={
                                        result.name
                                    }
                                    className="validationSummaryRow"
                                >
                                    <span
                                        className={
                                            result.passed
                                                ? "validationPassed"
                                                : "validationFailed"
                                        }
                                    >
                                        {result.passed
                                            ? "✓"
                                            : "✕"}
                                    </span>

                                    <strong>
                                        {
                                            result.name
                                        }
                                    </strong>

                                    <span>
                                        {
                                            result.durationMs
                                        }{" "}
                                        ms
                                    </span>
                                </div>
                            ),
                        )}
                    </InspectorSection>
                )}
        </>
    )
}

function ReviewWorkspace({
    diff,
}: {
    diff: string
}) {
    if (!diff) {
        return (
            <EmptyState text="No code changes available for review." />
        )
    }

    return (
        <div className="diffWorkspace">
            {diff
                .split(
                    "\n",
                )
                .map(
                    (
                        line,
                        index,
                    ) => {
                        let className =
                            "diffLine"

                        if (
                            line.startsWith(
                                "+",
                            ) &&
                            !line.startsWith(
                                "+++",
                            )
                        ) {
                            className +=
                                " diffAdded"
                        }

                        if (
                            line.startsWith(
                                "-",
                            ) &&
                            !line.startsWith(
                                "---",
                            )
                        ) {
                            className +=
                                " diffRemoved"
                        }

                        if (
                            line.startsWith(
                                "@@",
                            )
                        ) {
                            className +=
                                " diffMeta"
                        }

                        return (
                            <div
                                key={
                                    index
                                }
                                className={
                                    className
                                }
                            >
                                {line ||
                                    " "}
                            </div>
                        )
                    },
                )}
        </div>
    )
}

function ReviewInspector({
    task,
    reviews,
    reviewComment,
    setReviewComment,
    reviewing,
    reviewTask,
}: {
    task:
    Task | null

    reviews:
    TaskReview[]

    reviewComment:
    string

    setReviewComment: (
        value: string,
    ) => void

    reviewing:
    boolean

    reviewTask: (
        decision:
            | "approve"
            | "reject",
    ) =>
        Promise<void>
}) {
    return (
        <>
            <InspectorSection title="Review">
                {task?.status ===
                    "waiting_approval" ? (
                    <>
                        <textarea
                            className="reviewInput"
                            value={
                                reviewComment
                            }
                            onChange={(e) =>
                                setReviewComment(
                                    e.target.value,
                                )
                            }
                            placeholder="Optional review comment..."
                            rows={
                                5
                            }
                        />

                        <div className="reviewActions">
                            <button
                                onClick={() =>
                                    reviewTask(
                                        "approve",
                                    )
                                }
                                disabled={
                                    reviewing
                                }
                            >
                                Approve
                            </button>

                            <button
                                className="dangerButton"
                                onClick={() =>
                                    reviewTask(
                                        "reject",
                                    )
                                }
                                disabled={
                                    reviewing
                                }
                            >
                                Reject
                            </button>
                        </div>
                    </>
                ) : (
                    <InfoRow
                        label="Status"
                        value={
                            task?.status ??
                            "Pending"
                        }
                    />
                )}
            </InspectorSection>

            <InspectorSection title="Review History">
                {reviews.length ===
                    0 ? (
                    <EmptyState text="No reviews yet." />
                ) : (
                    reviews.map(
                        (review) => (
                            <div
                                key={
                                    review.id
                                }
                                className="reviewItem"
                            >
                                <div className="reviewHeader">
                                    <strong>
                                        {
                                            review.decision
                                        }
                                    </strong>

                                    <span>
                                        {
                                            review.reviewer
                                        }
                                    </span>
                                </div>

                                {review.comment && (
                                    <p>
                                        {
                                            review.comment
                                        }
                                    </p>
                                )}
                            </div>
                        ),
                    )
                )}
            </InspectorSection>
        </>
    )
}

function AgentStepItem({
    step,
}: {
    step:
    AgentStep
}) {
    const [
        open,
        setOpen,
    ] =
        useState(
            false,
        )

    return (
        <div
            className={`agentStep ${step.error
                    ? "agentStepError"
                    : ""
                }`}
        >
            <button
                className="agentStepHeader"
                onClick={() =>
                    setOpen(
                        !open,
                    )
                }
            >
                <div className="agentStepTitle">
                    <span className="agentStepNumber">
                        #
                        {
                            step.stepNumber
                        }
                    </span>

                    <strong>
                        {
                            step.toolName
                        }
                    </strong>

                    {step.error && (
                        <span className="errorBadge">
                            Failed
                        </span>
                    )}
                </div>

                <div className="agentStepMeta">
                    <span>
                        {step.durationMs ??
                            0}{" "}
                        ms
                    </span>

                    <span>
                        {open
                            ? "−"
                            : "+"}
                    </span>
                </div>
            </button>

            {open && (
                <div className="agentStepBody">
                    <SectionTitle>
                        Arguments
                    </SectionTitle>

                    <pre>
                        {JSON.stringify(
                            step.arguments,
                            null,
                            2,
                        )}
                    </pre>

                    {step.output && (
                        <>
                            <SectionTitle>
                                Output
                            </SectionTitle>

                            <pre>
                                {
                                    step.output
                                }
                            </pre>
                        </>
                    )}

                    {step.error && (
                        <>
                            <SectionTitle>
                                Error
                            </SectionTitle>

                            <ErrorBlock>
                                {
                                    step.error
                                }
                            </ErrorBlock>
                        </>
                    )}
                </div>
            )}
        </div>
    )
}

function ValidationResultItem({
    result,
}: {
    result:
    ValidationResult
}) {
    const [
        open,
        setOpen,
    ] =
        useState(
            false,
        )

    return (
        <div className="validationResult">
            <button
                className="validationResultHeader"
                onClick={() =>
                    setOpen(
                        !open,
                    )
                }
            >
                <div>
                    <span
                        className={
                            result.passed
                                ? "validationPassed"
                                : "validationFailed"
                        }
                    >
                        {result.passed
                            ? "✓"
                            : "✕"}
                    </span>

                    <strong>
                        {
                            result.name
                        }
                    </strong>
                </div>

                <div>
                    <span>
                        {
                            result.durationMs
                        }{" "}
                        ms
                    </span>

                    <span>
                        {open
                            ? " −"
                            : " +"}
                    </span>
                </div>
            </button>

            {open &&
                result.output && (
                    <div className="validationOutput">
                        <pre>
                            {
                                result.output
                            }
                        </pre>
                    </div>
                )}
        </div>
    )
}

function InspectorSection({
    title,
    children,
}: {
    title: string

    children:
    ReactNode
}) {
    return (
        <section className="inspectorSection">
            <div className="inspectorSectionTitle">
                {
                    title
                }
            </div>

            <div>
                {
                    children
                }
            </div>
        </section>
    )
}

function SectionTitle({
    children,
}: {
    children:
    ReactNode
}) {
    return (
        <div className="sectionTitle">
            {
                children
            }
        </div>
    )
}

function InfoRow({
    label,
    value,
}: {
    label: string

    value: string
}) {
    return (
        <div className="infoRow">
            <span>
                {
                    label
                }
            </span>

            <strong>
                {
                    value
                }
            </strong>
        </div>
    )
}

function MetricGrid({
    children,
}: {
    children:
    ReactNode
}) {
    return (
        <div className="metricGrid">
            {
                children
            }
        </div>
    )
}

function Metric({
    label,
    value,
}: {
    label: string

    value:
    | string
    | number
}) {
    return (
        <div className="metric">
            <span>
                {
                    label
                }
            </span>

            <strong>
                {
                    value
                }
            </strong>
        </div>
    )
}

function EmptyState({
    text,
}: {
    text: string
}) {
    return (
        <div className="emptyState">
            {
                text
            }
        </div>
    )
}

function ErrorBlock({
    children,
}: {
    children:
    ReactNode
}) {
    return (
        <div className="errorBlock">
            {
                children
            }
        </div>
    )
}

function getProcessIcon(
    state:
        ProcessState,
) {
    switch (
    state
    ) {
        case "completed":
            return "✓"

        case "active":
            return "●"

        case "failed":
            return "!"

        default:
            return "○"
    }
}