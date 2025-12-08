-- إضافة سياسة رفع صور التصنيفات للمستخدمين المصادقين
CREATE POLICY "Authenticated users can upload to صور التصنيفات"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'صور التصنيفات');

-- إضافة سياسة قراءة عامة للبكت
CREATE POLICY "Public read access for صور التصنيفات" 
ON storage.objects 
FOR SELECT 
TO public
USING (bucket_id = 'صور التصنيفات');

-- إضافة سياسة حذف صور التصنيفات لمالكها
CREATE POLICY "Users can delete own files in صور التصنيفات"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'صور التصنيفات' AND auth.uid() = owner);

-- إضافة سياسة تحديث صور التصنيفات لمالكها
CREATE POLICY "Users can update own files in صور التصنيفات"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'صور التصنيفات' AND auth.uid() = owner);