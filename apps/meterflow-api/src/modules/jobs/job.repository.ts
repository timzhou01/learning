import { and, eq, lte, asc, sql } from "drizzle-orm"
import { db } from "../../db.js"
import { jobs } from "../../db/schema/jobs.js"

export async function claimJob() {
    return db.transaction(async (tx) => {
        const [job] = await tx
            .select()
            .from(jobs)
            .where(and(
                eq(jobs.status, "pending"),
                lte(jobs.runAt, new Date()),
            ))
            .orderBy(asc(jobs.runAt), asc(jobs.createdAt), asc(jobs.id))
            .limit(1)
            .for("update", { skipLocked: true })

        if (!job) return null

        const [claimed] = await tx
            .update(jobs)
            .set({
                status: "processing",
                attempts: sql`${jobs.attempts} + 1`,
            })
            .where(eq(jobs.id, job.id))
            .returning()

        return claimed
    })
}

export async function finishJob(
    id: string,
    status: "completed" | "failed",
) {
    await db
        .update(jobs)
        .set({ status })
        .where(and(
            eq(jobs.id, id),
            eq(jobs.status, "processing"),
        ))
}