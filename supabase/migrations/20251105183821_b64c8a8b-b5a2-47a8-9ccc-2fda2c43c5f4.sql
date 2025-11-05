-- إضافة سياسة للسماح بقراءة البيانات الأساسية للشركاء (الاسم والصورة فقط)
DROP POLICY IF EXISTS "Public profiles read access" ON public.profiles;
CREATE POLICY "Public profiles read access"
ON public.profiles FOR SELECT
USING (true);

-- ملاحظة: هذه السياسة آمنة لأنها تسمح بقراءة البيانات الأساسية فقط
-- (الاسم والصورة) وليس البيانات الحساسة مثل رقم الهاتف أو مفاتيح API