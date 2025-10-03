-- إصلاح تحذيرات الأمان: إضافة search_path للـ functions

-- Trigger لتحديث updated_at للموظفين
CREATE OR REPLACE FUNCTION public.update_employees_updated_at()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Trigger لتحديث updated_at للطلبات
CREATE OR REPLACE FUNCTION public.update_orders_updated_at()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    NEW.completed_at = now();
  END IF;
  RETURN NEW;
END;
$$;

-- Trigger لتحديث حالة الطاولة عند تغيير حالة الطلب
CREATE OR REPLACE FUNCTION public.update_table_status()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status IN ('completed', 'cancelled') AND OLD.status NOT IN ('completed', 'cancelled') THEN
    UPDATE public.tables
    SET is_occupied = false, current_order_id = NULL
    WHERE id = NEW.table_id;
  ELSIF NEW.status NOT IN ('completed', 'cancelled') AND NEW.table_id IS NOT NULL THEN
    UPDATE public.tables
    SET is_occupied = true, current_order_id = NEW.id
    WHERE id = NEW.table_id;
  END IF;
  RETURN NEW;
END;
$$;

-- Function لحساب إجمالي الطلب تلقائياً
CREATE OR REPLACE FUNCTION public.calculate_order_total()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  items_total numeric(10,2);
BEGIN
  SELECT COALESCE(SUM(subtotal), 0)
  INTO items_total
  FROM public.order_items
  WHERE order_id = NEW.order_id;
  
  UPDATE public.orders
  SET total_amount = items_total,
      final_amount = items_total + COALESCE(tax_amount, 0) - COALESCE(discount_amount, 0)
  WHERE id = NEW.order_id;
  
  RETURN NEW;
END;
$$;