-- إضافة عمود webhook URL لـ n8n في جدول store_settings
ALTER TABLE public.store_settings 
ADD COLUMN IF NOT EXISTS n8n_webhook_url text;

COMMENT ON COLUMN public.store_settings.n8n_webhook_url IS 'رابط webhook الخاص بـ n8n لإرسال إشعارات عند إضافة أو تعديل المنتجات';