-- إضافة حقول الطلبات الخارجية إلى جدول store_settings
ALTER TABLE public.store_settings
ADD COLUMN IF NOT EXISTS external_orders_enabled boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS delivery_fee numeric(10,2) DEFAULT 0;