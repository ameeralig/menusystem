CREATE TABLE IF NOT EXISTS public.ai_user_credits (
  user_id UUID PRIMARY KEY,
  balance INTEGER NOT NULL DEFAULT 100,
  total_used INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.ai_user_credits TO authenticated;
GRANT ALL ON public.ai_user_credits TO service_role;
ALTER TABLE public.ai_user_credits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users read own ai credits" ON public.ai_user_credits FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.ai_credit_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  amount INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.ai_credit_purchases TO authenticated;
GRANT ALL ON public.ai_credit_purchases TO service_role;
ALTER TABLE public.ai_credit_purchases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users read own purchases" ON public.ai_credit_purchases FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "users create own purchases" ON public.ai_credit_purchases FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.consume_ai_credit(_user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE remaining INTEGER;
BEGIN
  INSERT INTO public.ai_user_credits (user_id) VALUES (_user_id)
  ON CONFLICT (user_id) DO NOTHING;

  UPDATE public.ai_user_credits
     SET balance = balance - 1,
         total_used = total_used + 1,
         updated_at = now()
   WHERE user_id = _user_id AND balance > 0
  RETURNING balance INTO remaining;

  IF remaining IS NULL THEN
    RETURN -1;
  END IF;
  RETURN remaining;
END;
$$;