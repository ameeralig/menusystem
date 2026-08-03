ALTER TABLE public.telegram_bot_sessions
  ADD COLUMN IF NOT EXISTS ai_history JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS pending_action JSONB;