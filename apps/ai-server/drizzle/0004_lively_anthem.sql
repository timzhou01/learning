ALTER TABLE "agent_steps"
ADD COLUMN "step_number" integer;

UPDATE "agent_steps"
SET "step_number" = 0
WHERE "step_number" IS NULL;

ALTER TABLE "agent_steps"
ALTER COLUMN "step_number" SET NOT NULL;