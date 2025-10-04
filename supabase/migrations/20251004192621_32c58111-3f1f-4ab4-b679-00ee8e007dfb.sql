-- إضافة صلاحيات للموظفين على جدول products
-- السماح للموظفين بقراءة جميع منتجات متجرهم
CREATE POLICY "Employees can view store products"
ON public.products
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.employees
    WHERE employees.user_id = auth.uid()
    AND employees.store_owner_id = products.user_id
    AND employees.is_active = true
  )
);

-- السماح للموظفين بإضافة منتجات للمتجر
CREATE POLICY "Employees can insert store products"
ON public.products
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.employees
    WHERE employees.user_id = auth.uid()
    AND employees.store_owner_id = products.user_id
    AND employees.is_active = true
  )
);

-- السماح للموظفين بتحديث منتجات المتجر
CREATE POLICY "Employees can update store products"
ON public.products
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.employees
    WHERE employees.user_id = auth.uid()
    AND employees.store_owner_id = products.user_id
    AND employees.is_active = true
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.employees
    WHERE employees.user_id = auth.uid()
    AND employees.store_owner_id = products.user_id
    AND employees.is_active = true
  )
);

-- السماح للموظفين بحذف منتجات المتجر
CREATE POLICY "Employees can delete store products"
ON public.products
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.employees
    WHERE employees.user_id = auth.uid()
    AND employees.store_owner_id = products.user_id
    AND employees.is_active = true
  )
);