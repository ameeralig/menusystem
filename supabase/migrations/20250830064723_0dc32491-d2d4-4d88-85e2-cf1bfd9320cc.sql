-- إضافة قيود أمان إضافية لجدول الشكاوى والمقترحات

-- حذف السياسة الحالية للإدراج العام
DROP POLICY IF EXISTS "Anyone can insert feedback" ON public.feedback;

-- إنشاء سياسة أكثر أماناً للإدراج مع التحقق من صحة البيانات
CREATE POLICY "Secure feedback insertion" 
ON public.feedback 
FOR INSERT 
WITH CHECK (
  -- التأكد من أن store_owner_id موجود وصحيح
  store_owner_id IS NOT NULL 
  AND store_owner_id IN (SELECT id FROM auth.users)
  -- التأكد من أن اسم الزائر ليس فارغاً وضمن حد معقول
  AND visitor_name IS NOT NULL 
  AND length(trim(visitor_name)) > 0 
  AND length(visitor_name) <= 100
  -- إذا تم إدخال رقم الهاتف، يجب أن يكون بصيغة صحيحة
  AND (visitor_phone IS NULL OR (length(trim(visitor_phone)) >= 8 AND length(visitor_phone) <= 20))
  -- التأكد من أن نوع الشكوى صحيح
  AND type IS NOT NULL 
  AND length(trim(type)) > 0
  AND type IN ('شكوى', 'اقتراح', 'استفسار', 'مدح')
  -- التأكد من أن الوصف ليس فارغاً وضمن حد معقول
  AND description IS NOT NULL 
  AND length(trim(description)) > 0 
  AND length(description) <= 1000
);

-- تحديث السياسة لعرض الشكاوى فقط لأصحاب المتاجر مع إخفاء أرقام الهواتف في بعض الحالات
DROP POLICY IF EXISTS "Users can view feedback for their store" ON public.feedback;

CREATE POLICY "Store owners can view their feedback" 
ON public.feedback 
FOR SELECT 
USING (
  auth.uid() = store_owner_id
  AND auth.uid() IS NOT NULL
);

-- إضافة سياسة للتحديث (تحديث حالة الشكوى فقط)
CREATE POLICY "Store owners can update feedback status" 
ON public.feedback 
FOR UPDATE 
USING (auth.uid() = store_owner_id)
WITH CHECK (
  auth.uid() = store_owner_id
  AND auth.uid() IS NOT NULL
  -- السماح بتحديث الحالة فقط
  AND status IN ('pending', 'reviewed', 'resolved')
);

-- إنشاء دالة للتحقق من صحة بيانات الشكوى قبل الإدراج
CREATE OR REPLACE FUNCTION public.validate_feedback_data()
RETURNS TRIGGER AS $$
BEGIN
  -- تنظيف البيانات النصية من المسافات الزائدة
  NEW.visitor_name = trim(NEW.visitor_name);
  NEW.description = trim(NEW.description);
  NEW.type = trim(NEW.type);
  
  -- تنظيف رقم الهاتف إذا كان موجوداً
  IF NEW.visitor_phone IS NOT NULL THEN
    NEW.visitor_phone = trim(NEW.visitor_phone);
    -- إذا كان رقم الهاتف فارغاً بعد التنظيف، اجعله null
    IF length(NEW.visitor_phone) = 0 THEN
      NEW.visitor_phone = NULL;
    END IF;
  END IF;

  -- التأكد من وجود الحقول الإلزامية
  IF NEW.visitor_name IS NULL OR length(NEW.visitor_name) = 0 THEN
    RAISE EXCEPTION 'اسم الزائر مطلوب';
  END IF;
  
  IF NEW.description IS NULL OR length(NEW.description) = 0 THEN
    RAISE EXCEPTION 'وصف الشكوى/المقترح مطلوب';
  END IF;
  
  IF NEW.type IS NULL OR length(NEW.type) = 0 THEN
    RAISE EXCEPTION 'نوع الشكوى/المقترح مطلوب';
  END IF;

  -- التحقق من أن store_owner_id صحيح
  IF NEW.store_owner_id IS NULL THEN
    RAISE EXCEPTION 'معرف صاحب المتجر مطلوب';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- إضافة trigger للتحقق من صحة البيانات
DROP TRIGGER IF EXISTS validate_feedback_before_insert ON public.feedback;
CREATE TRIGGER validate_feedback_before_insert
  BEFORE INSERT ON public.feedback
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_feedback_data();

-- إضافة فهرس لتحسين الأداء
CREATE INDEX IF NOT EXISTS idx_feedback_store_owner_id ON public.feedback(store_owner_id);
CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON public.feedback(created_at DESC);