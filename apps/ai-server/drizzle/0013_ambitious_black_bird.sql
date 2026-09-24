ALTER TABLE "agent_steps" ADD COLUMN "attempt" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "agent_steps" ADD COLUMN "phase" text DEFAULT 'initial' NOT NULL;