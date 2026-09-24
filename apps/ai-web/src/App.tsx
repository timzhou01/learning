import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react"

import "./App.css"

const API_URL = "http://localhost:3000"

type TaskStatus =
  | "planning"
  | "ready"
  | "running"
  | "waiting_approval"
  | "approving"
  | "rejecting"
  | "approved"
  | "rejected"
  | "failed"

type TaskPlan = {
  summary?: string
  steps?: string[]
}

type Project = {
  id: string
  name: string
  repositoryPath: string
  defaultBranch: string
}

type Task = {
  id: string
  input: string
  status: TaskStatus
  plan?: TaskPlan | null
  result?: string | null
  error?: string | null
}

type ValidationResult = {
  name: string
  passed: boolean
  output: string
  durationMs: number
}

type ValidationAttempt = {
  attempt: number
  type: "initial" | "repair"
  results: ValidationResult[]
}

type AgentRun = {
  id: string
  taskId: string
  status: string

  result?: string | null
  error?: string | null

  durationMs?: number | null

  inputTokens?: number | null
  outputTokens?: number | null
  totalTokens?: number | null

  validationResults?: ValidationResult[] | null

  validationAttempts?: ValidationAttempt[] | null
}

type AgentStep = {
  id: string
  runId: string

  attempt: number
  phase: "initial" | "repair"

  stepNumber: number
  toolName: string
  arguments: unknown

  output?: string | null
  error?: string | null

  durationMs?: number | null
}

type TaskReview = {
  id: string
  taskId: string

  decision:
  | "approved"
  | "rejected"

  reviewer: string

  comment?: string | null
  createdAt?: string
}

type WorkbenchStep =
  | "task"
  | "plan"
  | "execute"
  | "validate"
  | "review"

type ProcessState =
  | "active"
  | "completed"
  | "pending"
  | "failed"

type AgentStepGroup = {
  attempt: number
  phase: "initial" | "repair"
  steps: AgentStep[]
}

const WORKBENCH_STEPS: {
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

function groupStepsByAttempt(
  steps: AgentStep[],
): AgentStepGroup[] {
  const groups = new Map<
    number,
    AgentStep[]
  >()

  for (const step of steps) {
    const current =
      groups.get(step.attempt) ?? []

    current.push(step)

    groups.set(
      step.attempt,
      current,
    )
  }

  return Array.from(
    groups.entries(),
  )
    .sort(
      ([a], [b]) => a - b,
    )
    .map(
      ([attempt, attemptSteps]) => ({
        attempt,

        phase:
          attemptSteps[0]?.phase ??
          "initial",

        steps: attemptSteps,
      }),
    )
}

function App() {
  const [input, setInput] =
    useState("")

  const [task, setTask] =
    useState<Task | null>(null)

  const [runs, setRuns] =
    useState<AgentRun[]>([])

  const [steps, setSteps] =
    useState<AgentStep[]>([])

  const [reviews, setReviews] =
    useState<TaskReview[]>([])

  const [diff, setDiff] =
    useState("")

  const [reviewComment, setReviewComment] =
    useState("")

  const [creating, setCreating] =
    useState(false)

  const [running, setRunning] =
    useState(false)

  const [reviewing, setReviewing] =
    useState(false)

  const [polling, setPolling] =
    useState(false)

  const [error, setError] =
    useState<string | null>(null)

  const [projects, setProjects] =
    useState<Project[]>([])

  const [
    selectedProjectId,
    setSelectedProjectId,
  ] = useState("")

  const [
    activeStep,
    setActiveStep,
  ] =
    useState<WorkbenchStep>(
      "task",
    )

  const timerRef =
    useRef<number | null>(
      null,
    )

  const latestRun =
    runs.length > 0
      ? runs[
      runs.length - 1
      ]
      : null

  const groupedSteps =
    useMemo(
      () =>
        groupStepsByAttempt(
          steps,
        ),
      [steps],
    )

  const stepStates =
    useMemo<
      Record<
        WorkbenchStep,
        ProcessState
      >
    >(() => {
      const validationFailed =
        latestRun?.validationResults?.some(
          (item) =>
            !item.passed,
        ) ?? false

      return {
        task:
          task
            ? "completed"
            : "active",

        plan:
          task?.plan
            ? "completed"
            : task?.status ===
              "planning"
              ? "active"
              : "pending",

        execute:
          task?.status ===
            "running"
            ? "active"
            : latestRun?.status ===
              "failed"
              ? "failed"
              : latestRun
                ? "completed"
                : "pending",

        validate:
          validationFailed
            ? "failed"
            : latestRun
              ?.validationResults
              ?.length
              ? "completed"
              : task?.status ===
                "running"
                ? "pending"
                : "pending",

        review:
          task?.status ===
            "waiting_approval"
            ? "active"
            : task?.status ===
              "approved" ||
              task?.status ===
              "rejected"
              ? "completed"
              : "pending",
      }
    }, [
      task,
      latestRun,
    ])

  const stopPolling = () => {
    if (
      timerRef.current !==
      null
    ) {
      window.clearInterval(
        timerRef.current,
      )

      timerRef.current =
        null
    }

    setPolling(false)
  }

  const fetchProjects = async () => {
    const response =
      await fetch(
        `${API_URL}/projects`,
      )

    if (!response.ok) {
      throw new Error(
        "Failed to get projects",
      )
    }

    const data: Project[] =
      await response.json()

    setProjects(data)

    if (
      !selectedProjectId &&
      data.length > 0
    ) {
      setSelectedProjectId(
        data[0]!.id,
      )
    }
  }

  const fetchTask = async (
    id: string,
  ) => {
    const response =
      await fetch(
        `${API_URL}/tasks/${id}`,
      )

    if (!response.ok) {
      throw new Error(
        "Failed to get task",
      )
    }

    const latestTask: Task =
      await response.json()

    setTask(latestTask)

    return latestTask
  }

  const fetchSteps = async (
    runId: string,
  ) => {
    const response =
      await fetch(
        `${API_URL}/tasks/runs/${runId}/steps`,
      )

    if (!response.ok) {
      return
    }

    const data: AgentStep[] =
      await response.json()

    setSteps(data)
  }

  const fetchRuns = async (
    taskId: string,
  ) => {
    const response =
      await fetch(
        `${API_URL}/tasks/${taskId}/runs`,
      )

    if (!response.ok) {
      return
    }

    const data: AgentRun[] =
      await response.json()

    setRuns(data)

    const latest =
      data[
      data.length - 1
      ]

    if (latest) {
      await fetchSteps(
        latest.id,
      )
    }
  }

  const fetchReviews =
    async (
      taskId: string,
    ) => {
      const response =
        await fetch(
          `${API_URL}/tasks/${taskId}/reviews`,
        )

      if (!response.ok) {
        return
      }

      const data: TaskReview[] =
        await response.json()

      setReviews(data)
    }

  const fetchDiff = async (
    taskId: string,
  ) => {
    const response =
      await fetch(
        `${API_URL}/tasks/${taskId}/diff`,
      )

    if (!response.ok) {
      return
    }

    const data: {
      diff: string
    } =
      await response.json()

    setDiff(data.diff)
  }

  const refreshTaskData =
    async (
      id: string,
    ) => {
      const latestTask =
        await fetchTask(id)

      await fetchRuns(id)

      if (
        latestTask.status ===
        "waiting_approval" ||
        latestTask.status ===
        "approved" ||
        latestTask.status ===
        "rejected"
      ) {
        await fetchDiff(id)

        await fetchReviews(id)
      }

      return latestTask
    }

  const startPolling = (
    id: string,
  ) => {
    stopPolling()

    setPolling(true)

    timerRef.current =
      window.setInterval(
        async () => {
          try {
            const latestTask =
              await refreshTaskData(
                id,
              )

            if (
              latestTask.status !==
              "planning" &&
              latestTask.status !==
              "running"
            ) {
              stopPolling()
            }
          } catch {
            stopPolling()
          }
        },
        1000,
      )
  }

  const createTask =
    async () => {
      const value =
        input.trim()

      if (!selectedProjectId) {
        setError(
          "Please select a project",
        )

        return
      }

      if (!value) {
        return
      }

      setCreating(true)
      setError(null)

      setRuns([])
      setSteps([])
      setReviews([])
      setDiff("")
      setReviewComment("")

      setActiveStep(
        "task",
      )

      try {
        const response =
          await fetch(
            `${API_URL}/tasks`,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body:
                JSON.stringify(
                  {
                    projectId:
                      selectedProjectId,
                    input:
                      value,
                  },
                ),
            },
          )

        if (!response.ok) {
          throw new Error(
            "Create task failed",
          )
        }

        const createdTask: Task =
          await response.json()

        setTask(
          createdTask,
        )

        startPolling(
          createdTask.id,
        )
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unknown error",
        )
      } finally {
        setCreating(false)
      }
    }

  const runTask =
    async () => {
      if (!task) {
        return
      }

      setRunning(true)
      setError(null)

      setActiveStep(
        "execute",
      )

      startPolling(
        task.id,
      )

      try {
        const response =
          await fetch(
            `${API_URL}/tasks/${task.id}/run`,
            {
              method:
                "POST",
            },
          )

        if (!response.ok) {
          throw new Error(
            "Run task failed",
          )
        }

        const latestTask: Task =
          await response.json()

        setTask(
          latestTask,
        )

        await fetchRuns(
          task.id,
        )

        if (
          latestTask.status ===
          "waiting_approval"
        ) {
          await fetchDiff(
            task.id,
          )

          await fetchReviews(
            task.id,
          )

          setActiveStep(
            "review",
          )
        }

        if (
          latestTask.status ===
          "failed"
        ) {
          setActiveStep(
            "validate",
          )
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unknown error",
        )
      } finally {
        setRunning(false)

        stopPolling()
      }
    }

  const reviewTask =
    async (
      decision:
        | "approve"
        | "reject",
    ) => {
      if (!task) {
        return
      }

      setReviewing(true)
      setError(null)

      try {
        const response =
          await fetch(
            `${API_URL}/tasks/${task.id}/${decision}`,
            {
              method:
                "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body:
                JSON.stringify(
                  {
                    reviewer:
                      "chao",

                    comment:
                      reviewComment.trim() ||
                      undefined,
                  },
                ),
            },
          )

        if (!response.ok) {
          throw new Error(
            `${decision} task failed`,
          )
        }

        const latestTask: Task =
          await response.json()

        setTask(
          latestTask,
        )

        setReviewComment(
          "",
        )

        await fetchReviews(
          task.id,
        )
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unknown error",
        )
      } finally {
        setReviewing(false)
      }
    }

  useEffect(() => {
    void fetchProjects()
  }, [])

  useEffect(() => {
    return () => {
      stopPolling()
    }
  }, [])

  return (
    <div className="workbench">
      <header className="topbar">
        <div className="brand">
          <h1>
            AI Coding Agent
          </h1>

          <span>
            Development
            Workbench
          </span>
        </div>

        <div className="topbarRight">
          <select
            value={
              selectedProjectId
            }
            onChange={(e) =>
              setSelectedProjectId(
                e.target.value,
              )
            }
          >
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
          {polling && (
            <span className="polling">
              <span className="pollingDot" />

              Running
            </span>
          )}

          {task && (
            <>
              <span className="topTaskId">
                {task.id}
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

      <div className="mainLayout">
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
                        .join(" ")}
                      onClick={() =>
                        setActiveStep(
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
                        {getProcessIcon(
                          state,
                        )}
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

        <main className="workspacePanel">
          <div className="panelHeader">
            <div>
              <strong>
                {
                  WORKBENCH_STEPS.find(
                    (item) =>
                      item.key ===
                      activeStep,
                  )?.label
                }
              </strong>

              <span className="panelHeaderDescription">
                {
                  WORKBENCH_STEPS.find(
                    (item) =>
                      item.key ===
                      activeStep,
                  )
                    ?.description
                }
              </span>
            </div>
          </div>

          <div className="panelContent">
            {activeStep ===
              "task" && (
                <TaskWorkspace
                  input={input}
                  setInput={
                    setInput
                  }
                  task={task}
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
                  task={task}
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
                  diff={diff}
                />
              )}
          </div>
        </main>

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
                  task={task}
                  error={error}
                />
              )}

            {activeStep ===
              "plan" && (
                <PlanInspector
                  task={task}
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
                  task={task}
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
      </div>
    </div>
  )
}

function TaskWorkspace({
  input,
  setInput,
  task,
  creating,
  running,
  createTask,
  runTask,
}: {
  input: string

  setInput: (
    value: string,
  ) => void

  task: Task | null

  creating: boolean
  running: boolean

  createTask: () =>
    Promise<void>

  runTask: () =>
    Promise<void>
}) {
  return (
    <div className="taskWorkspace">
      <div className="workspaceIntro">
        <h2>
          What should the agent
          do?
        </h2>

        <p>
          Describe the coding
          task, then create and
          run it.
        </p>
      </div>

      <textarea
        className="taskInput"
        value={input}
        onChange={(e) =>
          setInput(
            e.target.value,
          )
        }
        placeholder="Example: Inspect src/index.ts and change getMessage() to return..."
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
  error,
}: {
  task: Task | null
  error: string | null
}) {
  if (!task) {
    return (
      <>
        <EmptyState text="Create a task to start the workflow." />

        {error && (
          <ErrorBlock>
            {error}
          </ErrorBlock>
        )}
      </>
    )
  }

  return (
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
          value={task.id}
        />
      </InspectorSection>

      {task.result && (
        <InspectorSection title="Result">
          <pre>
            {task.result}
          </pre>
        </InspectorSection>
      )}

      {(task.error ||
        error) && (
          <InspectorSection title="Error">
            <ErrorBlock>
              {task.error ??
                error}
            </ErrorBlock>
          </InspectorSection>
        )}
    </>
  )
}

function PlanWorkspace({
  task,
}: {
  task: Task | null
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
              key={index}
              className="planItem"
            >
              <div className="planNumber">
                {index + 1}
              </div>

              <div>
                {step}
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
  task: Task | null
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
            ?.length ?? 0,
        )}
      />
    </InspectorSection>
  )
}

function ExecuteWorkspace({
  groups,
}: {
  groups: AgentStepGroup[]
}) {
  if (
    groups.length === 0
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
              <div>
                <strong>
                  Attempt{" "}
                  {
                    group.attempt
                  }
                </strong>
              </div>

              <span
                className={
                  group.phase ===
                    "repair"
                    ? "repairBadge"
                    : "initialBadge"
                }
              >
                {group.phase}
              </span>
            </div>

            <div>
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
            </div>
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
  run: AgentRun | null

  groups: AgentStepGroup[]
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
            {run.result}
          </pre>
        </InspectorSection>
      )}
    </>
  )
}

function ValidateWorkspace({
  run,
}: {
  run: AgentRun | null
}) {
  if (!run) {
    return (
      <EmptyState text="No validation data yet." />
    )
  }

  if (
    !run.validationAttempts ||
    run.validationAttempts
      .length === 0
  ) {
    return (
      <EmptyState text="No validation attempts yet." />
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
  run: AgentRun | null
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
      ?.length ?? 0

  return (
    <>
      <InspectorSection title="Validation">
        <MetricGrid>
          <Metric
            label="Passed"
            value={passed}
          />

          <Metric
            label="Failed"
            value={failed}
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
              attempts - 1,
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
        .split("\n")
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
  task: Task | null

  reviews: TaskReview[]

  reviewComment: string

  setReviewComment: (
    value: string,
  ) => void

  reviewing: boolean

  reviewTask: (
    decision:
      | "approve"
      | "reject",
  ) => Promise<void>
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
                  e.target
                    .value,
                )
              }
              placeholder="Optional review comment..."
              rows={5}
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
  step: AgentStep
}) {
  const [open, setOpen] =
    useState(false)

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
  result: ValidationResult
}) {
  const [open, setOpen] =
    useState(false)

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
  children: ReactNode
}) {
  return (
    <section className="inspectorSection">
      <div className="inspectorSectionTitle">
        {title}
      </div>

      <div>
        {children}
      </div>
    </section>
  )
}

function SectionTitle({
  children,
}: {
  children: ReactNode
}) {
  return (
    <div className="sectionTitle">
      {children}
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
        {label}
      </span>

      <strong>
        {value}
      </strong>
    </div>
  )
}

function MetricGrid({
  children,
}: {
  children: ReactNode
}) {
  return (
    <div className="metricGrid">
      {children}
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
        {label}
      </span>

      <strong>
        {value}
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
      {text}
    </div>
  )
}

function ErrorBlock({
  children,
}: {
  children: ReactNode
}) {
  return (
    <div className="errorBlock">
      {children}
    </div>
  )
}

function getProcessIcon(
  state: ProcessState,
) {
  switch (state) {
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

export default App