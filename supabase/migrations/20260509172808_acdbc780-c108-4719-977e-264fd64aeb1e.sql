
ALTER TABLE public.workflows
  ADD COLUMN IF NOT EXISTS webhook_token uuid NOT NULL DEFAULT gen_random_uuid(),
  ADD COLUMN IF NOT EXISTS schedule_cron text,
  ADD COLUMN IF NOT EXISTS last_run_at timestamptz;

CREATE UNIQUE INDEX IF NOT EXISTS workflows_webhook_token_key ON public.workflows(webhook_token);
CREATE INDEX IF NOT EXISTS workflows_active_schedule_idx ON public.workflows(active) WHERE schedule_cron IS NOT NULL;
