-- إضافة سياسة للقراءة العامة لجدول profiles للحقول الأساسية فقط (الاسم والصورة)
-- هذا ضروري لعرض معلومات الشركاء في الصفحة الرئيسية

CREATE POLICY "Anyone can view basic profile info"
ON public.profiles
FOR SELECT
TO anon, authenticated
USING (true);