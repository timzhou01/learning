
import { Router } from "express"
import { z } from "zod"

import { AppError } from "../../app-error.js"
import { finalizeInvoice, generateInvoice } from "./billing.service.js"

export const billingRouter = Router()

const schema = z.object({
    customerId: z.string().min(1),
    from: z.iso.datetime({ offset: true }),
    to: z.iso.datetime({ offset: true }),
}).refine(
    data => new Date(data.from) < new Date(data.to),
)

billingRouter.post("/invoices", async (req, res) => {
    const parsed = schema.safeParse(req.body)

    if (!parsed.success) {
        throw new AppError(
            400,
            "INVALID_REQUEST",
            "Invalid billing period",
        )
    }

    const { customerId, from, to } = parsed.data

    const invoice = await generateInvoice(
        customerId,
        new Date(from),
        new Date(to),
    )

    if (!invoice) {
        throw new AppError(
            409,
            "INVOICE_EXISTS",
            "Invoice already exists",
        )
    }

    res.status(201).json({
        ...invoice,
        totalTokens: invoice.totalTokens.toString(),
        amountCents: invoice.amountCents.toString(),
    })
})

billingRouter.post("/invoices/:id/finalize", async (req, res) => {
    const { id } = req.params

    const parsed = z.uuid().safeParse(id)

    if (!parsed.success) {
        throw new AppError(400, "INVALID_ID", "Invalid invoice ID")
    }

    const invoice = await finalizeInvoice(parsed.data)

    res.json({
        ...invoice,
        totalTokens: invoice.totalTokens.toString(),
        amountCents: invoice.amountCents.toString(),
    })
})
