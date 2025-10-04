-- إضافة قيد فريد على (user_id, category) لجدول category_images
-- هذا يضمن أن كل مستخدم لديه صورة واحدة فقط لكل تصنيف

ALTER TABLE public.category_images
ADD CONSTRAINT category_images_user_category_unique 
UNIQUE (user_id, category);