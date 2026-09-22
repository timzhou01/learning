import { z } from "zod"

export const CreateTaskSchema = z.object({
    input: z.string().min(1),
})