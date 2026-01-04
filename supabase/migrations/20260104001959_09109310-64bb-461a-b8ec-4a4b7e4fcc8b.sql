-- إضافة سياسة INSERT للسجلات (من Edge Function)
CREATE POLICY "Service can insert cleanup logs"
ON public.storage_cleanup_logs
FOR INSERT
WITH CHECK (true);