-- إضافة حقل معلومات التحميل لجدول store_settings
ALTER TABLE public.store_settings 
ADD COLUMN loading_tips jsonb DEFAULT '[]'::jsonb;