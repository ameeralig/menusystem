-- إصلاح مشكلة الأمان في جدول الموظفين
-- حذف السياسات القديمة وإعادة إنشائها مع حماية أقوى

-- حذف السياسات القديمة
DROP POLICY IF EXISTS "Employees can view their own record" ON public.employees;
DROP POLICY IF EXISTS "Store owners can view their employees" ON public.employees;
DROP POLICY IF EXISTS "Store owners can insert employees" ON public.employees;
DROP POLICY IF EXISTS "Store owners can update their employees" ON public.employees;
DROP POLICY IF EXISTS "Store owners can delete their employees" ON public.employees;

-- إنشاء سياسات جديدة محمية بشكل أفضل

-- سياسة عرض بيانات الموظف لنفسه فقط (مع التأكد من المصادقة)
CREATE POLICY "Authenticated employees can view their own record"
ON public.employees
FOR SELECT
TO authenticated
USING (
  auth.uid() IS NOT NULL 
  AND auth.uid() = user_id
);

-- سياسة عرض الموظفين لصاحب المتجر فقط (مع التأكد من المصادقة)
CREATE POLICY "Authenticated store owners can view their employees"
ON public.employees
FOR SELECT
TO authenticated
USING (
  auth.uid() IS NOT NULL 
  AND auth.uid() = store_owner_id
);

-- سياسة إضافة موظف جديد (فقط لصاحب المتجر المصادق عليه)
CREATE POLICY "Authenticated store owners can insert employees"
ON public.employees
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() IS NOT NULL 
  AND auth.uid() = store_owner_id
);

-- سياسة تحديث بيانات الموظف (فقط لصاحب المتجر المصادق عليه)
CREATE POLICY "Authenticated store owners can update their employees"
ON public.employees
FOR UPDATE
TO authenticated
USING (
  auth.uid() IS NOT NULL 
  AND auth.uid() = store_owner_id
)
WITH CHECK (
  auth.uid() IS NOT NULL 
  AND auth.uid() = store_owner_id
);

-- سياسة حذف موظف (فقط لصاحب المتجر المصادق عليه)
CREATE POLICY "Authenticated store owners can delete their employees"
ON public.employees
FOR DELETE
TO authenticated
USING (
  auth.uid() IS NOT NULL 
  AND auth.uid() = store_owner_id
);

-- التأكد من أن RLS مفعل
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;

-- التأكد من فرض RLS على جميع المستخدمين بما في ذلك مالك الجدول
ALTER TABLE public.employees FORCE ROW LEVEL SECURITY;