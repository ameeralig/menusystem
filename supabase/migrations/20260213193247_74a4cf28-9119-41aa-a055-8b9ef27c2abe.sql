
-- إضافة أعمدة الإعلانات إلى store_settings
ALTER TABLE public.store_settings
ADD COLUMN IF NOT EXISTS ads_enabled boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS ads_type text DEFAULT null,
ADD COLUMN IF NOT EXISTS custom_ads jsonb DEFAULT '[]'::jsonb;

-- ads_type يمكن أن يكون 'google' أو 'custom'
COMMENT ON COLUMN public.store_settings.ads_enabled IS 'تفعيل/إيقاف الإعلانات';
COMMENT ON COLUMN public.store_settings.ads_type IS 'نوع الإعلان: google أو custom';
COMMENT ON COLUMN public.store_settings.custom_ads IS 'مصفوفة صور الإعلانات المخصصة';
