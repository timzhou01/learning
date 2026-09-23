ALTER TABLE "tasks"
ALTER COLUMN "status"
SET DATA TYPE text;

--> statement-breakpoint

UPDATE "tasks"
SET "status" = 'waiting_approval'
WHERE "status" = 'completed';

--> statement-breakpoint

DROP TYPE "public"."task_status";

--> statement-breakpoint

CREATE TYPE "public"."task_status" AS ENUM(
  'planning',
  'ready',
  'running',
  'waiting_approval',
  'approved',
  'rejected',
  'failed'
);

--> statement-breakpoint

ALTER TABLE "tasks"
ALTER COLUMN "status"
SET DATA TYPE "public"."task_status"
USING "status"::"public"."task_status";