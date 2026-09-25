DROP TABLE "project_rules" CASCADE;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "rules_path" text DEFAULT 'ai-rules' NOT NULL;