import { z } from "zod"

export const TaskReviewInputSchema = z.object({
    reviewer: z
        .string()
        .trim()
        .min(1, "reviewer is required"),

    comment: z
        .string()
        .trim()
        .optional(),
})

export type TaskReviewInput =
    z.infer<typeof TaskReviewInputSchema>