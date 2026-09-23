ALTER TYPE "public"."task_status" ADD VALUE 'approving' BEFORE 'approved';--> statement-breakpoint
ALTER TYPE "public"."task_status" ADD VALUE 'rejecting' BEFORE 'approved';