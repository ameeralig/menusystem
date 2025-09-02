-- إنشاء سياسة جديدة للسماح بإرسال جميع أنواع الملاحظات
DROP POLICY IF EXISTS "Secure feedback insertion" ON public.feedback;

CREATE POLICY "Allow public feedback insertion" 
ON public.feedback 
FOR INSERT 
WITH CHECK (
  store_owner_id IS NOT NULL AND
  visitor_name IS NOT NULL AND
  length(trim(visitor_name)) > 0 AND
  length(visitor_name) <= 100 AND
  (visitor_phone IS NULL OR (length(trim(visitor_phone)) >= 8 AND length(visitor_phone) <= 20)) AND
  type IS NOT NULL AND
  length(trim(type)) > 0 AND
  type IN ('complaint', 'suggestion', 'compliment', 'question', 'other') AND
  description IS NOT NULL AND
  length(trim(description)) > 0 AND
  length(description) <= 1000
);