-- إضافة حقول واتساب لجدول profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS whatsapp_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS whatsapp_bot_enabled BOOLEAN DEFAULT FALSE;