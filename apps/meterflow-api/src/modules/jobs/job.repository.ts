
import {
    and, or, eq, lt, lte, asc, sql,
    gt,
} from "drizzle-orm"

import { db } from "../../db.js"
import { jobs } from "../../db/schema/jobs.js"

export async function claimJob(database: typeof db = db) {
    return database.transaction(async (tx) => {
        const [job] = await tx
            .select()
            .from(jobs)
            .where(and(
                lte(jobs.runAt, new Date()),
                or(
                    eq(jobs.status, "pending"),
                    and(
                        eq(jobs.status, "processing"),
                        lt(jobs.lockedUntil, new Date()),
                    ),
                ),
            ))
            .orderBy(
                asc(jobs.runAt),
                asc(jobs.createdAt),
                asc(jobs.id),
            )
            .limit(1)
            .for("update", { skipLocked: true })

        if (!job) return null

        const [claimed] = await tx
            .update(jobs)
            .set({
                status: "processing",
                attempts: sql`${jobs.attempts} + 1`,
                lockedUntil: sql`NOW() + INTERVAL '60 seconds'`,
            })
            .where(eq(jobs.id, job.id))
            .returning()

        return claimed
    })
}

export async function finishJob(
    database: typeof db,
    id: string,
    attempts: number,
    status: "completed" | "failed",
) {
    const [updated] = await database
        .update(jobs)
        .set({
            status,
            lockedUntil: null,
        })
        .where(and(
            eq(jobs.id, id),
            eq(jobs.status, "processing"),
            eq(jobs.attempts, attempts),
        ))
        .returning({ id: jobs.id })

    return !!updated
}

export async function renewJobLease(
    database: typeof db,
    id: string,
    attempts: number,
): Promise<boolean> {
    const [updated] = await database
        .update(jobs)
        .set({
            lockedUntil: sql`NOW() + INTERVAL '60 seconds'`,
        })
        .where(and(
            eq(jobs.id, id),
            eq(jobs.status, "processing"),
            eq(jobs.attempts, attempts),
            gt(jobs.lockedUntil, sql`NOW()`),
        ))
        .returning({ id: jobs.id })

    return !!updated
}
