import { z } from "zod"

export const CreateTaskSchema = z.object({
    projectId: z
        .string()
        .uuid(),

    input: z
        .string()
        .min(1),
})