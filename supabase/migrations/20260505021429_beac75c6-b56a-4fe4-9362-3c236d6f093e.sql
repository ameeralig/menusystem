-- جدول رموز التحقق للدخول/التسجيل بالهاتف
CREATE TABLE IF NOT EXISTS public.phone_otps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone text NOT NULL,
  otp_code text NOT NULL,
  purpose text NOT NULL DEFAULT 'login', -- 'login' | 'signup'
  attempts integer NOT NULL DEFAULT 0,
  is_used boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '10 minutes')
);

CREATE INDEX IF NOT EXISTS idx_phone_otps_phone ON public.phone_otps(phone);
CREATE INDEX IF NOT EXISTS idx_phone_otps_expires ON public.phone_otps(expires_at);

ALTER TABLE public.phone_otps ENABLE ROW LEVEL SECURITY;

-- لا يُسمح للعميل بالقراءة المباشرة؛ كل العمليات تتم عبر edge function (service role)
CREATE POLICY "Service role manages phone otps"
ON public.phone_otps
FOR ALL
TO public
USING (false)
WITH CHECK (false);

-- دالة تنظيف الرموز المنتهية
CREATE OR REPLACE FUNCTION public.cleanup_expired_phone_otps()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE deleted_count integer;
BEGIN
  DELETE FROM public.phone_otps
  WHERE expires_at < now() - interval '1 hour' OR is_used = true;
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;