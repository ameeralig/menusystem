-- تعزيز أمان جدول employees بمنع الوصول المجهول صراحة

-- حذف السياسات القديمة
DROP POLICY IF EXISTS "Authenticated employees can view their own record" ON public.employees;
DROP POLICY IF EXISTS "Authenticated store owners can view their employees" ON public.employees;
DROP POLICY IF EXISTS "Authenticated store owners can insert employees" ON public.employees;
DROP POLICY IF EXISTS "Authenticated store owners can update their employees" ON public.employees;
DROP POLICY IF EXISTS "Authenticated store owners can delete their employees" ON public.employees;

-- إعادة إنشاء السياسات مع TO authenticated صراحة

-- سياسة قراءة للموظفين أنفسهم
CREATE POLICY "Employees can view own record" 
ON public.employees 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

-- سياسة قراءة لأصحاب المتاجر
CREATE POLICY "Store owners can view their employees" 
ON public.employees 
FOR SELECT 
TO authenticated
USING (auth.uid() = store_owner_id);

-- سياسة إدراج لأصحاب المتاجر
CREATE POLICY "Store owners can insert employees" 
ON public.employees 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = store_owner_id);

-- سياسة تحديث لأصحاب المتاجر
CREATE POLICY "Store owners can update their employees" 
ON public.employees 
FOR UPDATE 
TO authenticated
USING (auth.uid() = store_owner_id)
WITH CHECK (auth.uid() = store_owner_id);

-- سياسة حذف لأصحاب المتاجر
CREATE POLICY "Store owners can delete their employees" 
ON public.employees 
FOR DELETE 
TO authenticated
USING (auth.uid() = store_owner_id);