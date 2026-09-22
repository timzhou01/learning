import { z } from "zod"

export const TaskPlanSchema = z.object({
    goal: z.string(),
    steps: z.array(z.string()),
    risks: z.array(z.string()),
})

export type TaskPlan = z.infer<typeof TaskPlanSchema>