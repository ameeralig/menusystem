-- حذف check constraint الذي يقيد أنواع الملاحظات
ALTER TABLE feedback DROP CONSTRAINT IF EXISTS feedback_type_check;

-- إضافة check constraint جديد يسمح بجميع الأنواع المطلوبة
ALTER TABLE feedback ADD CONSTRAINT feedback_type_check 
CHECK (type IN ('complaint', 'suggestion', 'compliment', 'question', 'other'));