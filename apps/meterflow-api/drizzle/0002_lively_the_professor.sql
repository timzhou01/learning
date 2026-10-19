CREATE TABLE "jobs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" text NOT NULL,
	"payload" jsonb NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"run_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "jobs_status_check" CHECK ("jobs"."status" IN ('pending', 'processing', 'completed', 'failed')),
	CONSTRAINT "jobs_attempts_check" CHECK ("jobs"."attempts" >= 0)
);
--> statement-breakpoint
CREATE INDEX "jobs_status_run_at_idx" ON "jobs" USING btree ("status","run_at");