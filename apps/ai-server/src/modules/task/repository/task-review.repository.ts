import { randomUUID } from "node:crypto"
import { db } from "../../../db/client.js"
import { taskReviews } from "../../../db/schema/task-reviews.js"
import { eq } from "drizzle-orm"

export class TaskReviewRepository {

    async findByTaskId(taskId: string) {
        return db
            .select()
            .from(taskReviews)
            .where(eq(taskReviews.taskId, taskId))
            .orderBy(taskReviews.createdAt)
    }
    async createReview(params: {
        taskId: string
        decision: "approved" | "rejected"
        reviewer: string
        comment?: string
    }) {
        const [review] =
            await db
                .insert(taskReviews)
                .values({
                    id: randomUUID(),
                    taskId: params.taskId,
                    decision: params.decision,
                    reviewer: params.reviewer,
                    ...(params.comment !== undefined
                        ? { comment: params.comment }
                        : {}),
                })
                .returning()

        if (!review) {
            throw new Error(
                "Failed to create task review",
            )
        }

        return review
    }
}