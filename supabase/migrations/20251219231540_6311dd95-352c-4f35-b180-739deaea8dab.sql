-- إضافة عمود نسبة الخصم للمنتجات
ALTER TABLE public.products 
ADD COLUMN discount_percentage numeric DEFAULT 0 CHECK (discount_percentage >= 0 AND discount_percentage <= 100);

-- إضافة تعليق للتوضيح
COMMENT ON COLUMN public.products.discount_percentage IS 'نسبة الخصم على المنتج (0-100)';