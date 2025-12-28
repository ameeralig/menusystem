-- إضافة حقل السعر الأصلي للمنتجات
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS original_price numeric NULL;

-- إضافة تعليق توضيحي
COMMENT ON COLUMN public.products.original_price IS 'السعر الأصلي قبل الخصم (طريقة بديلة للخصم بدلاً من النسبة المئوية)';