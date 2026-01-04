-- تفعيل pg_cron و pg_net للتنظيف المجدول
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- جدول لتخزين سجلات التنظيف
CREATE TABLE IF NOT EXISTS public.storage_cleanup_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  bucket_name TEXT NOT NULL,
  files_deleted INTEGER NOT NULL DEFAULT 0,
  space_freed BIGINT NOT NULL DEFAULT 0,
  errors JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- تفعيل RLS
ALTER TABLE public.storage_cleanup_logs ENABLE ROW LEVEL SECURITY;

-- سياسة RLS للأدمن فقط
CREATE POLICY "Admins can view cleanup logs"
ON public.storage_cleanup_logs
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- فهرس للبحث السريع
CREATE INDEX idx_cleanup_logs_created_at ON public.storage_cleanup_logs(created_at DESC);