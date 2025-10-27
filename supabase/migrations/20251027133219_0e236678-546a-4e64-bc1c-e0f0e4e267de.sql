-- إصلاح مشكلة search_path في دالة validate_feedback_data

DROP FUNCTION IF EXISTS public.validate_feedback_data() CASCADE;

CREATE OR REPLACE FUNCTION public.validate_feedback_data()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
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
$function$;