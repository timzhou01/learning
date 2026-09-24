import { z } from "zod"

export const CreateProjectSchema = z.object({
    name: z
        .string()
        .min(1),

    repositoryPath: z
        .string()
        .min(1),

    defaultBranch: z
        .string()
        .min(1)
        .optional(),
})