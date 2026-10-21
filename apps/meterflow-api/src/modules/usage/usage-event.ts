
import { z } from "zod"

export const usageEventSchema = z.object({
    eventId: z.string(),
    customerId: z.string(),
    tokens: z.number().int().positive(),
    occurredAt: z.iso.datetime(),
})

export type UsageEvent = z.infer<typeof usageEventSchema>
