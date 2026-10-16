CREATE TABLE "workflow_versions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workflow_id" uuid NOT NULL,
	"version" integer NOT NULL,
	"definition" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "workflow_definitions" RENAME TO "workflows";--> statement-breakpoint
DROP INDEX "workflow_version_unique";--> statement-breakpoint
ALTER TABLE "workflows" ADD COLUMN "latest_version" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "workflow_versions" ADD CONSTRAINT "workflow_versions_workflow_id_workflows_id_fk" FOREIGN KEY ("workflow_id") REFERENCES "public"."workflows"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "workflow_versions_unique" ON "workflow_versions" USING btree ("workflow_id","version");--> statement-breakpoint
ALTER TABLE "workflows" DROP COLUMN "workflow_id";--> statement-breakpoint
ALTER TABLE "workflows" DROP COLUMN "version";--> statement-breakpoint
ALTER TABLE "workflows" DROP COLUMN "definition";