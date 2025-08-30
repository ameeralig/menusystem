-- إصلاح مشكلة الأمان في جدول الشكاوى والمقترحات

-- إزالة جميع السياسات الحالية أولاً
DROP POLICY IF EXISTS "Anyone can insert feedback" ON public.feedback;
DROP POLICY IF EXISTS "Secure feedback insertion" ON public.feedback;
DROP POLICY IF EXISTS "Users can view feedback for their store" ON public.feedback;
DROP POLICY IF EXISTS "Store owners can view their feedback" ON public.feedback;
DROP POLICY IF EXISTS "Store owners can update feedback status" ON public.feedback;

-- إنشاء سياسة أمان محسنة للإدراج
CREATE POLICY "Secure feedback insertion" 
ON public.feedback 
FOR INSERT 
WITH CHECK (
  -- التأكد من أن store_owner_id موجود
  store_owner_id IS NOT NULL 
  -- التأكد من أن اسم الزائر صحيح
  AND visitor_name IS NOT NULL 
  AND length(trim(visitor_name)) > 0 
  AND length(visitor_name) <= 100
  -- التحقق من رقم الهاتف (اختياري)
  AND (visitor_phone IS NULL OR (length(trim(visitor_phone)) >= 8 AND length(visitor_phone) <= 20))
  -- التأكد من نوع الشكوى
  AND type IS NOT NULL 
  AND length(trim(type)) > 0
  -- التأكد من الوصف
  AND description IS NOT NULL 
  AND length(trim(description)) > 0 
  AND length(description) <= 1000
);

-- سياسة عرض الشكاوى لأصحاب المتاجر فقط
CREATE POLICY "Store owners can view their feedback" 
ON public.feedback 
FOR SELECT 
USING (
  auth.uid() = store_owner_id
  AND auth.uid() IS NOT NULL
);

-- سياسة تحديث حالة الشكوى
CREATE POLICY "Store owners can update feedback status" 
ON public.feedback 
FOR UPDATE 
USING (auth.uid() = store_owner_id AND auth.uid() IS NOT NULL)
WITH CHECK (
  auth.uid() = store_owner_id
  AND auth.uid() IS NOT NULL
);

-- إنشاء دالة التحقق من صحة البيانات
CREATE OR REPLACE FUNCTION public.validate_feedback_data()
RETURNS TRIGGER AS $$
BEGIN
  -- تنظيف البيانات
  NEW.visitor_name = trim(NEW.visitor_name);
  NEW.description = trim(NEW.description);
  NEW.type = trim(NEW.type);
  
  IF NEW.visitor_phone IS NOT NULL THEN
    NEW.visitor_phone = trim(NEW.visitor_phone);
    IF length(NEW.visitor_phone) = 0 THEN
      NEW.visitor_phone = NULL;
    END IF;
  END IF;

  -- التحقق من الحقول المطلوبة
  IF NEW.visitor_name IS NULL OR length(NEW.visitor_name) = 0 THEN
    RAISE EXCEPTION 'اسم الزائر مطلوب';
  END IF;
  
  IF NEW.description IS NULL OR length(NEW.description) = 0 THEN
    RAISE EXCEPTION 'وصف الشكوى مطلوب';
  END IF;
  
  IF NEW.type IS NULL OR length(NEW.type) = 0 THEN
    RAISE EXCEPTION 'نوع الشكوى مطلوب';
  END IF;

  IF NEW.store_owner_id IS NULL THEN
    RAISE EXCEPTION 'معرف صاحب المتجر مطلوب';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- إضافة trigger
DROP TRIGGER IF EXISTS validate_feedback_before_insert ON public.feedback;
CREATE TRIGGER validate_feedback_before_insert
  BEFORE INSERT ON public.feedback
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_feedback_data();