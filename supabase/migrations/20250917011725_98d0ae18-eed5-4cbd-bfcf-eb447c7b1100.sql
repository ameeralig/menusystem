-- Add per-user CallMeBot API key to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS callmebot_api_key text;
