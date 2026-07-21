
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS telegram_last_activity TIMESTAMPTZ;
ALTER TABLE public.telegram_bot_sessions ADD COLUMN IF NOT EXISTS data JSONB NOT NULL DEFAULT '{}'::jsonb;
