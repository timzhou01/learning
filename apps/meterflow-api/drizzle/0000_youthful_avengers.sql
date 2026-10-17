CREATE TABLE "usage_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_id" text NOT NULL,
	"customer_id" text NOT NULL,
	"tokens" integer NOT NULL,
	"occurred_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "usage_events_tokens_positive" CHECK ("usage_events"."tokens" > 0)
);
--> statement-breakpoint
CREATE UNIQUE INDEX "usage_events_event_id_unique" ON "usage_events" USING btree ("event_id");--> statement-breakpoint
CREATE INDEX "usage_events_customer_time_idx" ON "usage_events" USING btree ("customer_id","occurred_at");