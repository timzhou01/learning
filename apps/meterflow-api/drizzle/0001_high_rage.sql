CREATE TABLE "invoices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"customer_id" text NOT NULL,
	"period_start" timestamp with time zone NOT NULL,
	"period_end" timestamp with time zone NOT NULL,
	"total_tokens" bigint NOT NULL,
	"amount_cents" bigint NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "invoices_valid_period" CHECK ("invoices"."period_start" < "invoices"."period_end"),
	CONSTRAINT "invoices_total_tokens_nonnegative" CHECK ("invoices"."total_tokens" >= 0),
	CONSTRAINT "invoices_amount_nonnegative" CHECK ("invoices"."amount_cents" >= 0),
	CONSTRAINT "invoices_valid_status" CHECK ("invoices"."status" IN ('draft', 'finalized'))
);
--> statement-breakpoint
CREATE UNIQUE INDEX "invoices_customer_period_unique" ON "invoices" USING btree ("customer_id","period_start","period_end");