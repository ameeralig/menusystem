-- إزالة الـ trigger المرتبط بتحديث حالة الطاولة
DROP TRIGGER IF EXISTS trigger_update_table_status ON public.orders;
DROP TRIGGER IF EXISTS update_table_status_on_order_change ON public.orders;

-- إزالة الدالة المرتبطة بتحديث حالة الطاولة
DROP FUNCTION IF EXISTS public.update_table_status() CASCADE;

-- إزالة عمود status من جدول orders
ALTER TABLE public.orders DROP COLUMN IF EXISTS status;
