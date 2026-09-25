ALTER TABLE "tasks" ADD COLUMN "selected_rules" jsonb;--> statement-breakpoint
ALTER TABLE "projects" DROP COLUMN "rules_path";