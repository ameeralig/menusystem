
-- جدول جلسات الواتساب للمصادقة
CREATE TABLE public.whatsapp_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number TEXT NOT NULL,
  user_id UUID NOT NULL,
  is_authenticated BOOLEAN DEFAULT false,
  session_token TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ DEFAULT (now() + interval '24 hours'),
  last_activity_at TIMESTAMPTZ DEFAULT now(),
  auth_attempts INTEGER DEFAULT 0,
  UNIQUE(phone_number)
);

-- تفعيل RLS
ALTER TABLE public.whatsapp_sessions ENABLE ROW LEVEL SECURITY;

-- سياسة: service role يمكنه إدارة كل الجلسات (Edge Function يستخدم service role)
CREATE POLICY "Service role can manage all sessions"
ON public.whatsapp_sessions
FOR ALL
TO public
USING (true)
WITH CHECK (true);

-- سياسة: المستخدم يمكنه رؤية جلساته فقط
CREATE POLICY "Users can view own sessions"
ON public.whatsapp_sessions
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- وظيفة تنظيف الجلسات المنتهية
CREATE OR REPLACE FUNCTION public.cleanup_expired_whatsapp_sessions()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM public.whatsapp_sessions
  WHERE expires_at < now();
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;
