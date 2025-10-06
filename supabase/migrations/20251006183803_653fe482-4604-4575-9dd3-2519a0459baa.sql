-- إنشاء جدول لتخزين ملخصات المبيعات اليومية للموظفين
CREATE TABLE IF NOT EXISTS public.employee_daily_sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_owner_id UUID NOT NULL,
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  employee_name TEXT NOT NULL,
  sale_date DATE NOT NULL,
  total_orders INTEGER NOT NULL DEFAULT 0,
  total_sales NUMERIC(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(employee_id, sale_date)
);

-- تفعيل RLS
ALTER TABLE public.employee_daily_sales ENABLE ROW LEVEL SECURITY;

-- سياسة للسماح لأصحاب المتاجر بعرض سجلات موظفيهم
CREATE POLICY "Store owners can view their employees sales"
ON public.employee_daily_sales
FOR SELECT
USING (auth.uid() = store_owner_id);

-- سياسة للسماح بالإدراج من خلال Edge Function
CREATE POLICY "Service role can insert sales records"
ON public.employee_daily_sales
FOR INSERT
WITH CHECK (true);

-- سياسة للسماح بالحذف للسجلات القديمة
CREATE POLICY "Service role can delete old records"
ON public.employee_daily_sales
FOR DELETE
USING (true);

-- دالة لحذف السجلات الأقدم من أسبوع
CREATE OR REPLACE FUNCTION public.cleanup_old_employee_sales()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM public.employee_daily_sales
  WHERE sale_date < CURRENT_DATE - INTERVAL '7 days';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;

-- دالة لحساب مبيعات الموظفين لليوم السابق
CREATE OR REPLACE FUNCTION public.calculate_employee_daily_sales(target_date DATE DEFAULT CURRENT_DATE - 1)
RETURNS TABLE(
  employee_id UUID,
  employee_name TEXT,
  store_owner_id UUID,
  total_orders BIGINT,
  total_sales NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    e.id AS employee_id,
    e.full_name AS employee_name,
    e.store_owner_id,
    COUNT(o.id) AS total_orders,
    COALESCE(SUM(o.final_amount), 0) AS total_sales
  FROM public.employees e
  LEFT JOIN public.orders o ON o.employee_id = e.id 
    AND DATE(o.created_at) = target_date
  WHERE e.is_active = true
  GROUP BY e.id, e.full_name, e.store_owner_id;
END;
$$;

-- إنشاء فهرس لتحسين الأداء
CREATE INDEX IF NOT EXISTS idx_employee_daily_sales_date ON public.employee_daily_sales(sale_date DESC);
CREATE INDEX IF NOT EXISTS idx_employee_daily_sales_employee ON public.employee_daily_sales(employee_id, sale_date DESC);
CREATE INDEX IF NOT EXISTS idx_orders_employee_date ON public.orders(employee_id, created_at);
