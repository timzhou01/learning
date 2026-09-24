import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"

import {
  createProject as createProjectApi,
  createTask as createTaskApi,
  getDiff,
  getProjects,
  getReviews,
  getRuns,
  getSteps,
  getTask,
  reviewTask as reviewTaskApi,
  runTask as runTaskApi,
} from "./api"

import {
  CreateProjectModal,
  ProcessSidebar,
  ProjectBar,
  ResultPanel,
  TaskPanel,
} from "./components"

import type {
  AgentRun,
  AgentStep,
  AgentStepGroup,
  ProcessState,
  Project,
  Task,
  TaskReview,
  WorkbenchStep,
} from "./types"

import "./index.css"
import "./project.css"

function groupStepsByAttempt(
  steps: AgentStep[],
): AgentStepGroup[] {
  const groups =
    new Map<
      number,
      AgentStep[]
    >()

  for (const step of steps) {
    const current =
      groups.get(
        step.attempt,
      ) ?? []

    current.push(
      step,
    )

    groups.set(
      step.attempt,
      current,
    )
  }

  return Array.from(
    groups.entries(),
  )
    .sort(
      ([a], [b]) =>
        a - b,
    )
    .map(
      ([
        attempt,
        attemptSteps,
      ]) => ({
        attempt,

        phase:
          attemptSteps[0]
            ?.phase ??
          "initial",

        steps:
          attemptSteps,
      }),
    )
}

function App() {
  const [projects, setProjects] =
    useState<Project[]>([])

  const [
    selectedProjectId,
    setSelectedProjectId,
  ] =
    useState("")

  const [
    showProjectForm,
    setShowProjectForm,
  ] =
    useState(false)

  const [
    projectName,
    setProjectName,
  ] =
    useState("")

  const [
    repositoryPath,
    setRepositoryPath,
  ] =
    useState("")

  const [
    defaultBranch,
    setDefaultBranch,
  ] =
    useState("main")

  const [
    creatingProject,
    setCreatingProject,
  ] =
    useState(false)

  const [input, setInput] =
    useState("")

  const [task, setTask] =
    useState<
      Task | null
    >(
      null,
    )

  const [runs, setRuns] =
    useState<
      AgentRun[]
    >(
      [],
    )

  const [steps, setSteps] =
    useState<
      AgentStep[]
    >(
      [],
    )

  const [
    reviews,
    setReviews,
  ] =
    useState<
      TaskReview[]
    >(
      [],
    )

  const [diff, setDiff] =
    useState("")

  const [
    reviewComment,
    setReviewComment,
  ] =
    useState("")

  const [
    creating,
    setCreating,
  ] =
    useState(false)

  const [
    running,
    setRunning,
  ] =
    useState(false)

  const [
    reviewing,
    setReviewing,
  ] =
    useState(false)

  const [
    polling,
    setPolling,
  ] =
    useState(false)

  const [error, setError] =
    useState<
      string | null
    >(
      null,
    )

  const [
    activeStep,
    setActiveStep,
  ] =
    useState<
      WorkbenchStep
    >(
      "task",
    )

  const timerRef =
    useRef<
      number | null
    >(
      null,
    )

  const latestRun =
    runs.length > 0
      ? runs[
      runs.length - 1
      ]
      : null

  const selectedProject =
    projects.find(
      (project) =>
        project.id ===
        selectedProjectId,
    ) ?? null

  const groupedSteps =
    useMemo(
      () =>
        groupStepsByAttempt(
          steps,
        ),
      [
        steps,
      ],
    )

  const stepStates =
    useMemo<
      Record<
        WorkbenchStep,
        ProcessState
      >
    >(() => {
      const validationFailed =
        latestRun
          ?.validationResults
          ?.some(
            (item) =>
              !item.passed,
          ) ??
        false

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
            : latestRun
              ?.status ===
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

  const stopPolling =
    () => {
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

      setPolling(
        false,
      )
    }

  const loadProjects =
    async () => {
      const data =
        await getProjects()

      setProjects(
        data,
      )

      if (
        !selectedProjectId &&
        data.length > 0
      ) {
        setSelectedProjectId(
          data[0]!.id,
        )
      }

      return data
    }

  const loadSteps =
    async (
      runId: string,
    ) => {
      const data =
        await getSteps(
          runId,
        )

      setSteps(
        data,
      )
    }

  const loadRuns =
    async (
      taskId: string,
    ) => {
      const data =
        await getRuns(
          taskId,
        )

      setRuns(
        data,
      )

      const latest =
        data[
        data.length - 1
        ]

      if (latest) {
        await loadSteps(
          latest.id,
        )
      }
    }

  const loadReviews =
    async (
      taskId: string,
    ) => {
      const data =
        await getReviews(
          taskId,
        )

      setReviews(
        data,
      )
    }

  const loadDiff =
    async (
      taskId: string,
    ) => {
      const data =
        await getDiff(
          taskId,
        )

      setDiff(
        data.diff,
      )
    }

  const refreshTaskData =
    async (
      id: string,
    ) => {
      const latestTask =
        await getTask(
          id,
        )

      setTask(
        latestTask,
      )

      await loadRuns(
        id,
      )

      if (
        latestTask.status ===
        "waiting_approval" ||
        latestTask.status ===
        "approved" ||
        latestTask.status ===
        "rejected"
      ) {
        await loadDiff(
          id,
        )

        await loadReviews(
          id,
        )
      }

      return latestTask
    }

  const startPolling =
    (
      id: string,
    ) => {
      stopPolling()

      setPolling(
        true,
      )

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

  const createProject =
    async () => {
      const name =
        projectName.trim()

      const path =
        repositoryPath.trim()

      if (
        !name ||
        !path
      ) {
        return
      }

      setCreatingProject(
        true,
      )

      setError(
        null,
      )

      try {
        const project =
          await createProjectApi(
            {
              name,

              repositoryPath:
                path,

              defaultBranch:
                defaultBranch.trim() ||
                "main",
            },
          )

        await loadProjects()

        setSelectedProjectId(
          project.id,
        )

        setProjectName(
          "",
        )

        setRepositoryPath(
          "",
        )

        setDefaultBranch(
          "main",
        )

        setShowProjectForm(
          false,
        )
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unknown error",
        )
      } finally {
        setCreatingProject(
          false,
        )
      }
    }

  const createTask =
    async () => {
      const value =
        input.trim()

      if (
        !selectedProjectId
      ) {
        setError(
          "Please select a project",
        )

        return
      }

      if (!value) {
        return
      }

      setCreating(
        true,
      )

      setError(
        null,
      )

      setRuns(
        [],
      )

      setSteps(
        [],
      )

      setReviews(
        [],
      )

      setDiff(
        "",
      )

      setReviewComment(
        "",
      )

      setActiveStep(
        "task",
      )

      try {
        const createdTask =
          await createTaskApi(
            {
              projectId:
                selectedProjectId,

              input:
                value,
            },
          )

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
        setCreating(
          false,
        )
      }
    }

  const runTask =
    async () => {
      if (!task) {
        return
      }

      setRunning(
        true,
      )

      setError(
        null,
      )

      setActiveStep(
        "execute",
      )

      startPolling(
        task.id,
      )

      try {
        const latestTask =
          await runTaskApi(
            task.id,
          )

        setTask(
          latestTask,
        )

        await loadRuns(
          task.id,
        )

        if (
          latestTask.status ===
          "waiting_approval"
        ) {
          await loadDiff(
            task.id,
          )

          await loadReviews(
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
        setRunning(
          false,
        )

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

      setReviewing(
        true,
      )

      setError(
        null,
      )

      try {
        const latestTask =
          await reviewTaskApi(
            task.id,
            decision,
            {
              reviewer:
                "chao",

              ...(reviewComment.trim()
                ? {
                  comment:
                    reviewComment.trim(),
                }
                : {}),
            },
          )

        setTask(
          latestTask,
        )

        setReviewComment(
          "",
        )

        await loadReviews(
          task.id,
        )
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unknown error",
        )
      } finally {
        setReviewing(
          false,
        )
      }
    }

  useEffect(() => {
    void loadProjects()
  }, [])

  useEffect(() => {
    return () => {
      stopPolling()
    }
  }, [])

  return (
    <div className="workbench">
      <ProjectBar
        projects={
          projects
        }
        selectedProjectId={
          selectedProjectId
        }
        onSelectProject={
          setSelectedProjectId
        }
        onCreateProject={() =>
          setShowProjectForm(
            true,
          )
        }
        polling={
          polling
        }
        task={
          task
        }
      />

      <div className="mainLayout">
        <ProcessSidebar
          activeStep={
            activeStep
          }
          stepStates={
            stepStates
          }
          onChange={
            setActiveStep
          }
        />

        <TaskPanel
          activeStep={
            activeStep
          }
          task={
            task
          }
          project={
            selectedProject
          }
          input={
            input
          }
          setInput={
            setInput
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
          groupedSteps={
            groupedSteps
          }
          latestRun={
            latestRun
          }
          diff={
            diff
          }
        />

        <ResultPanel
          activeStep={
            activeStep
          }
          task={
            task
          }
          project={
            selectedProject
          }
          error={
            error
          }
          latestRun={
            latestRun
          }
          groupedSteps={
            groupedSteps
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
      </div>

      <CreateProjectModal
        open={
          showProjectForm
        }
        name={
          projectName
        }
        repositoryPath={
          repositoryPath
        }
        defaultBranch={
          defaultBranch
        }
        creating={
          creatingProject
        }
        onNameChange={
          setProjectName
        }
        onRepositoryPathChange={
          setRepositoryPath
        }
        onDefaultBranchChange={
          setDefaultBranch
        }
        onClose={() =>
          setShowProjectForm(
            false,
          )
        }
        onCreate={
          createProject
        }
      />
    </div>
  )
}

export default App