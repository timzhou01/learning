import {
    z,
} from "zod"

export const CreateProjectRuleSchema =
    z.object({
        type:
            z.enum([
                "architecture",
                "coding",
                "implementation",
            ]),

        content:
            z
                .string()
                .min(1),
    })