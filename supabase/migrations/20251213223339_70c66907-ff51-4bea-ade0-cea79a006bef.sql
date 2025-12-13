-- تعزيز أمان جدول profiles بمنع الوصول المجهول صراحة
-- إسقاط السياسات المكررة وإعادة إنشائها بشكل موحد

-- أولاً: حذف السياسات القديمة المكررة
DROP POLICY IF EXISTS "Users can view own profile only" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

-- إنشاء سياسة واحدة موحدة للقراءة تتطلب مصادقة صريحة
CREATE POLICY "Authenticated users can view own profile only" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (auth.uid() = id);

-- تحديث سياسة الإدراج لتكون واضحة
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Authenticated users can insert own profile" 
ON public.profiles 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = id);

-- تحديث سياسة التحديث لتكون واضحة
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Authenticated users can update own profile" 
ON public.profiles 
FOR UPDATE 
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);