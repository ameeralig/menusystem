-- إضافة حقل اسم المساعد الذكي في إعدادات المتجر
ALTER TABLE store_settings
ADD COLUMN IF NOT EXISTS ai_assistant_name TEXT DEFAULT 'المساعد الذكي';