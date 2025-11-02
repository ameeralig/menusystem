-- إضافة عمود template إلى جدول store_settings
ALTER TABLE store_settings 
ADD COLUMN IF NOT EXISTS template TEXT DEFAULT 'default';