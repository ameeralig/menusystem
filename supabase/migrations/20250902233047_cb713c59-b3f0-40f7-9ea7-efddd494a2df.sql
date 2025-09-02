-- إضافة عمود تاريخ الحل للملاحظات
ALTER TABLE feedback ADD COLUMN IF NOT EXISTS resolved_at TIMESTAMP WITH TIME ZONE;

-- إنشاء دالة لحذف الملاحظات المحلولة القديمة (أكثر من شهر)
CREATE OR REPLACE FUNCTION public.cleanup_old_resolved_feedback()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM public.feedback 
  WHERE status = 'resolved' 
    AND resolved_at IS NOT NULL 
    AND resolved_at < (now() - INTERVAL '1 month');
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- إنشاء دالة لحذف جميع الملاحظات المحلولة يدوياً
CREATE OR REPLACE FUNCTION public.delete_resolved_feedback(owner_id UUID)
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM public.feedback 
  WHERE status = 'resolved' 
    AND store_owner_id = owner_id;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- تحديث trigger لتعيين تاريخ الحل عند تغيير الحالة إلى محلول
CREATE OR REPLACE FUNCTION public.update_resolved_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'resolved' AND OLD.status != 'resolved' THEN
    NEW.resolved_at = now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- إنشاء trigger لتحديث resolved_at تلقائياً
DROP TRIGGER IF EXISTS update_feedback_resolved_at ON public.feedback;
CREATE TRIGGER update_feedback_resolved_at
  BEFORE UPDATE ON public.feedback
  FOR EACH ROW
  EXECUTE FUNCTION public.update_resolved_at();