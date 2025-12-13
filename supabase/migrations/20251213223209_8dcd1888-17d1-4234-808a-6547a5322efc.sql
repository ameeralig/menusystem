-- إزالة سياسة القراءة العامة للملفات الشخصية
DROP POLICY IF EXISTS "Public profiles read access" ON public.profiles;

-- إضافة سياسة جديدة تسمح للمستخدمين بقراءة ملفاتهم الشخصية فقط
CREATE POLICY "Users can view own profile only" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);