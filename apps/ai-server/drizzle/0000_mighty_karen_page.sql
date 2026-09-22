CREATE TABLE "tasks" (
	"id" uuid PRIMARY KEY NOT NULL,
	"input" text NOT NULL,
	"status" varchar(32) NOT NULL,
	"plan" jsonb,
	"error" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
