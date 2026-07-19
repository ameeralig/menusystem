
-- Add Telegram linking fields to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS telegram_link_code text UNIQUE,
  ADD COLUMN IF NOT EXISTS telegram_link_password_hash text,
  ADD COLUMN IF NOT EXISTS telegram_chat_id bigint UNIQUE,
  ADD COLUMN IF NOT EXISTS telegram_username text,
  ADD COLUMN IF NOT EXISTS telegram_first_name text,
  ADD COLUMN IF NOT EXISTS telegram_verified_at timestamptz,
  ADD COLUMN IF NOT EXISTS telegram_connected boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS telegram_last_login timestamptz;

CREATE INDEX IF NOT EXISTS idx_profiles_telegram_chat_id ON public.profiles(telegram_chat_id);
CREATE INDEX IF NOT EXISTS idx_profiles_telegram_link_code ON public.profiles(telegram_link_code);

-- Rate-limit attempts per chat
CREATE TABLE IF NOT EXISTS public.telegram_link_attempts (
  chat_id bigint PRIMARY KEY,
  attempts int NOT NULL DEFAULT 0,
  locked_until timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.telegram_link_attempts TO service_role;
ALTER TABLE public.telegram_link_attempts ENABLE ROW LEVEL SECURITY;
-- No public policies: service role only

-- Bot conversation state (waiting for code/password)
CREATE TABLE IF NOT EXISTS public.telegram_bot_sessions (
  chat_id bigint PRIMARY KEY,
  state text NOT NULL,
  link_code text,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.telegram_bot_sessions TO service_role;
ALTER TABLE public.telegram_bot_sessions ENABLE ROW LEVEL SECURITY;
