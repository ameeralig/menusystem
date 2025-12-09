-- حذف سياسة INSERT القديمة المعقدة
DROP POLICY IF EXISTS "Allow public feedback insertion" ON public.feedback;

-- إنشاء سياسة INSERT بسيطة للزوار
CREATE POLICY "Allow public feedback insertion"
ON public.feedback
FOR INSERT
TO anon, authenticated
WITH CHECK (
  store_owner_id IS NOT NULL AND
  visitor_name IS NOT NULL AND
  type IS NOT NULL AND
  description IS NOT NULL
);