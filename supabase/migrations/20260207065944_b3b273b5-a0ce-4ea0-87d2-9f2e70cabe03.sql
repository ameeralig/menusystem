
-- إضافة عمود is_suspended إلى جدول store_settings
ALTER TABLE public.store_settings 
ADD COLUMN IF NOT EXISTS is_suspended boolean DEFAULT false;
