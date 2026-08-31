-- 1) باقات الرصيد
CREATE TABLE public.ai_credit_packages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  messages INTEGER NOT NULL,
  price_iqd INTEGER NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.ai_credit_packages TO anon;
GRANT SELECT ON public.ai_credit_packages TO authenticated;
GRANT ALL ON public.ai_credit_packages TO service_role;

ALTER TABLE public.ai_credit_packages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "packages_public_read" ON public.ai_credit_packages
  FOR SELECT USING (true);
CREATE POLICY "packages_admin_manage" ON public.ai_credit_packages
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

INSERT INTO public.ai_credit_packages (name, messages, price_iqd, display_order) VALUES
  ('صغيرة', 100, 5000, 1),
  ('متوسطة', 500, 20000, 2),
  ('كبيرة', 2000, 60000, 3);

-- 2) توسيع طلبات الشراء
ALTER TABLE public.ai_credit_purchases
  ADD COLUMN IF NOT EXISTS package_id UUID REFERENCES public.ai_credit_packages(id),
  ADD COLUMN IF NOT EXISTS payment_method TEXT NOT NULL DEFAULT 'manual',
  ADD COLUMN IF NOT EXISTS receipt_url TEXT,
  ADD COLUMN IF NOT EXISTS approved_by UUID,
  ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS stripe_session_id TEXT,
  ADD COLUMN IF NOT EXISTS price_iqd INTEGER;

-- 3) الرصيد المجاني الجديد
ALTER TABLE public.ai_user_credits ALTER COLUMN balance SET DEFAULT 10;

-- 4) دالة الاعتماد
CREATE OR REPLACE FUNCTION public.approve_ai_credit_purchase(_purchase_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  p RECORD;
  new_balance INTEGER;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'غير مصرح';
  END IF;

  SELECT * INTO p FROM public.ai_credit_purchases
   WHERE id = _purchase_id AND status = 'pending' FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'الطلب غير موجود أو تمت معالجته';
  END IF;

  INSERT INTO public.ai_user_credits (user_id, balance)
  VALUES (p.user_id, p.amount)
  ON CONFLICT (user_id) DO UPDATE
    SET balance = public.ai_user_credits.balance + EXCLUDED.balance,
        updated_at = now()
  RETURNING balance INTO new_balance;

  UPDATE public.ai_credit_purchases
     SET status = 'accepted', approved_by = auth.uid(), approved_at = now()
   WHERE id = _purchase_id;

  RETURN new_balance;
END;
$$;

-- 5) صلاحيات الأدمن على الأرصدة والطلبات
CREATE POLICY "credits_admin_all" ON public.ai_user_credits
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "purchases_admin_all" ON public.ai_credit_purchases
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

GRANT SELECT, INSERT, UPDATE ON public.ai_user_credits TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.ai_credit_purchases TO authenticated;
GRANT ALL ON public.ai_user_credits TO service_role;
GRANT ALL ON public.ai_credit_purchases TO service_role;