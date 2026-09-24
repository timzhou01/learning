import { useEffect, useRef, useState } from "react"
import "./App.css"

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

type Task = {
  id: string
  input: string
  status: TaskStatus
  plan?: TaskPlan | null
  result?: string | null
  error?: string | null
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
}

type AgentStep = {
  id: string
  runId: string
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
  decision: "approved" | "rejected"
  reviewer: string
  comment?: string | null
  createdAt?: string
}

const API_URL = "http://localhost:3000"

function App() {
  const [input, setInput] = useState("")
  const [task, setTask] = useState<Task | null>(null)

  const [runs, setRuns] = useState<AgentRun[]>([])
  const [steps, setSteps] = useState<AgentStep[]>([])
  const [reviews, setReviews] = useState<TaskReview[]>([])
  const [diff, setDiff] = useState("")

  const [creating, setCreating] = useState(false)
  const [running, setRunning] = useState(false)
  const [reviewing, setReviewing] = useState(false)
  const [polling, setPolling] = useState(false)

  const [reviewComment, setReviewComment] = useState("")
  const [error, setError] = useState<string | null>(null)

  const timerRef = useRef<number | null>(null)

  const latestRun =
    runs.length > 0
      ? runs[runs.length - 1]
      : null

  const stopPolling = () => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current)
      timerRef.current = null
    }

    setPolling(false)
  }

  const fetchTask = async (id: string) => {
    const response = await fetch(
      `${API_URL}/tasks/${id}`,
    )

    if (!response.ok) {
      throw new Error("Failed to get task")
    }

    const latestTask: Task =
      await response.json()

    setTask(latestTask)

    return latestTask
  }

  const fetchRuns = async (taskId: string) => {
    const response = await fetch(
      `${API_URL}/tasks/${taskId}/runs`,
    )

    if (!response.ok) {
      return
    }

    const data: AgentRun[] =
      await response.json()

    setRuns(data)

    const latest = data[data.length - 1]

    if (latest) {
      await fetchSteps(latest.id)
    }
  }

  const fetchSteps = async (runId: string) => {
    const response = await fetch(
      `${API_URL}/tasks/runs/${runId}/steps`,
    )

    if (!response.ok) {
      return
    }

    const data: AgentStep[] =
      await response.json()

    setSteps(data)
  }

  const fetchReviews = async (taskId: string) => {
    const response = await fetch(
      `${API_URL}/tasks/${taskId}/reviews`,
    )

    if (!response.ok) {
      return
    }

    const data: TaskReview[] =
      await response.json()

    setReviews(data)
  }

  const fetchDiff = async (taskId: string) => {
    const response = await fetch(
      `${API_URL}/tasks/${taskId}/diff`,
    )

    if (!response.ok) {
      return
    }

    const data: { diff: string } =
      await response.json()

    setDiff(data.diff)
  }

  const refreshTaskData = async (id: string) => {
    const latestTask = await fetchTask(id)

    await fetchRuns(id)

    if (
      latestTask.status === "waiting_approval"
    ) {
      await fetchDiff(id)
      await fetchReviews(id)
    }

    return latestTask
  }

  const startPolling = (id: string) => {
    stopPolling()

    setPolling(true)

    timerRef.current = window.setInterval(
      async () => {
        try {
          const latestTask =
            await refreshTaskData(id)

          if (
            latestTask.status !== "planning" &&
            latestTask.status !== "running"
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

  const createTask = async () => {
    const value = input.trim()

    if (!value) return

    setCreating(true)
    setError(null)

    setRuns([])
    setSteps([])
    setReviews([])
    setDiff("")

    try {
      const response = await fetch(
        `${API_URL}/tasks`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            input: value,
          }),
        },
      )

      if (!response.ok) {
        throw new Error(
          "Create task failed",
        )
      }

      const createdTask: Task =
        await response.json()

      setTask(createdTask)

      startPolling(createdTask.id)
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

  const runTask = async () => {
    if (!task) return

    setRunning(true)
    setError(null)

    startPolling(task.id)

    try {
      const response = await fetch(
        `${API_URL}/tasks/${task.id}/run`,
        {
          method: "POST",
        },
      )

      if (!response.ok) {
        throw new Error(
          "Run task failed",
        )
      }

      const latestTask: Task =
        await response.json()

      setTask(latestTask)

      await fetchRuns(task.id)

      if (
        latestTask.status ===
        "waiting_approval"
      ) {
        await fetchDiff(task.id)
        await fetchReviews(task.id)
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

  const reviewTask = async (
    decision: "approve" | "reject",
  ) => {
    if (!task) return

    setReviewing(true)
    setError(null)

    try {
      const response = await fetch(
        `${API_URL}/tasks/${task.id}/${decision}`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            reviewer: "chao",
            comment:
              reviewComment.trim() ||
              undefined,
          }),
        },
      )

      if (!response.ok) {
        throw new Error(
          `${decision} task failed`,
        )
      }

      const latestTask: Task =
        await response.json()

      setTask(latestTask)
      setReviewComment("")

      await fetchReviews(task.id)
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
    return stopPolling
  }, [])

  return (
    <main className="container">
      <header className="pageHeader">
        <h1>AI Coding Agent</h1>
        <p>
          Create, run and inspect coding tasks.
        </p>
      </header>

      <section className="card">
        <textarea
          value={input}
          onChange={(e) =>
            setInput(e.target.value)
          }
          placeholder="Describe your coding task..."
          rows={7}
          disabled={creating || running}
        />

        <div className="actions">
          <button
            onClick={createTask}
            disabled={
              creating || !input.trim()
            }
          >
            {creating
              ? "Creating..."
              : "Create Task"}
          </button>

          <button
            onClick={runTask}
            disabled={
              !task ||
              task.status !== "ready" ||
              running
            }
          >
            {running
              ? "Running..."
              : "Run Task"}
          </button>
        </div>

        {error && (
          <p className="error">
            {error}
          </p>
        )}
      </section>

      {task && (
        <section className="card">
          <div className="taskHeader">
            <h2>Current Task</h2>

            <div className="statusArea">
              {polling && (
                <span className="polling">
                  <span className="pollingDot" />
                  Refreshing
                </span>
              )}

              <span
                className={`status status-${task.status}`}
              >
                {task.status}
              </span>
            </div>
          </div>

          <p className="taskId">
            {task.id}
          </p>

          {task.plan !== null &&
            task.plan !== undefined && (
              <>
                <h3>Plan</h3>

                <pre>
                  {JSON.stringify(
                    task.plan,
                    null,
                    2,
                  )}
                </pre>
              </>
            )}

          {task.result && (
            <>
              <h3>Result</h3>
              <pre>{task.result}</pre>
            </>
          )}

          {task.error && (
            <>
              <h3>Error</h3>

              <pre className="error">
                {task.error}
              </pre>
            </>
          )}

          {task.status ===
            "waiting_approval" && (
              <div className="reviewBox">
                <textarea
                  value={reviewComment}
                  onChange={(e) =>
                    setReviewComment(
                      e.target.value,
                    )
                  }
                  placeholder="Optional review comment..."
                  rows={3}
                />

                <div className="reviewActions">
                  <button
                    onClick={() =>
                      reviewTask("approve")
                    }
                    disabled={reviewing}
                  >
                    Approve
                  </button>

                  <button
                    className="dangerButton"
                    onClick={() =>
                      reviewTask("reject")
                    }
                    disabled={reviewing}
                  >
                    Reject
                  </button>
                </div>
              </div>
            )}
        </section>
      )}

      {latestRun && (
        <section className="card">
          <div className="taskHeader">
            <h2>Agent Run</h2>

            <span className="status">
              {latestRun.status}
            </span>
          </div>

          <div className="runStats">
            <div>
              <span>Duration</span>
              <strong>
                {latestRun.durationMs ?? 0} ms
              </strong>
            </div>

            <div>
              <span>Input Tokens</span>
              <strong>
                {latestRun.inputTokens ?? 0}
              </strong>
            </div>

            <div>
              <span>Output Tokens</span>
              <strong>
                {latestRun.outputTokens ?? 0}
              </strong>
            </div>

            <div>
              <span>Total Tokens</span>
              <strong>
                {latestRun.totalTokens ?? 0}
              </strong>
            </div>
          </div>

          {latestRun.result && (
            <>
              <h3>Result</h3>
              <pre>
                {latestRun.result}
              </pre>
            </>
          )}

          {latestRun.error && (
            <>
              <h3>Error</h3>
              <pre className="error">
                {latestRun.error}
              </pre>
            </>
          )}
        </section>
      )}

      {steps.length > 0 && (
        <section className="card">
          <div className="taskHeader">
            <h2>Agent Steps</h2>

            <span className="stepCount">
              {steps.length} steps
            </span>
          </div>

          {steps.map((step) => (
            <AgentStepItem
              key={step.id}
              step={step}
            />
          ))}
        </section>
      )}

      {diff && (
        <section className="card">
          <h2>Git Diff</h2>

          <div className="diff">
            {diff
              .split("\n")
              .map((line, index) => {
                let className =
                  "diffLine"

                if (
                  line.startsWith("+") &&
                  !line.startsWith("+++")
                ) {
                  className +=
                    " diffAdded"
                }

                if (
                  line.startsWith("-") &&
                  !line.startsWith("---")
                ) {
                  className +=
                    " diffRemoved"
                }

                if (
                  line.startsWith("@@")
                ) {
                  className +=
                    " diffMeta"
                }

                return (
                  <div
                    key={index}
                    className={className}
                  >
                    {line || " "}
                  </div>
                )
              })}
          </div>
        </section>
      )}

      {reviews.length > 0 && (
        <section className="card">
          <h2>Review History</h2>

          {reviews.map((review) => (
            <div
              key={review.id}
              className="reviewItem"
            >
              <div className="reviewHeader">
                <strong>
                  {review.decision}
                </strong>

                <span>
                  {review.reviewer}
                </span>
              </div>

              {review.comment && (
                <p>{review.comment}</p>
              )}
            </div>
          ))}
        </section>
      )}
    </main>
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
      className={`step ${step.error ? "stepError" : ""
        }`}
    >
      <button
        className="stepHeader"
        onClick={() =>
          setOpen(!open)
        }
      >
        <div>
          <strong>
            #{step.stepNumber}{" "}
            {step.toolName}
          </strong>

          {step.error && (
            <span className="stepErrorLabel">
              Failed
            </span>
          )}
        </div>

        <span>
          {step.durationMs ?? 0} ms{" "}
          {open ? "−" : "+"}
        </span>
      </button>

      {open && (
        <div className="stepBody">
          <h4>Arguments</h4>

          <pre>
            {JSON.stringify(
              step.arguments,
              null,
              2,
            )}
          </pre>

          {step.output && (
            <>
              <h4>Output</h4>
              <pre>{step.output}</pre>
            </>
          )}

          {step.error && (
            <>
              <h4>Error</h4>
              <pre className="error">
                {step.error}
              </pre>
            </>
          )}
        </div>
      )}
    </div>
  )
}

export default App