-- إصلاح مسار البحث للوظائف الأمنية

-- تحديث وظيفة التحقق من صحة بيانات الشكوى مع search_path آمن
CREATE OR REPLACE FUNCTION public.validate_feedback_data()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public
AS $$
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
$$;

-- تحديث باقي الوظائف لإضافة search_path آمن
CREATE OR REPLACE FUNCTION public.update_system_stats()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- إذا لم يكن هناك سجل، قم بإنشاء واحد
  INSERT INTO public.system_stats (id)
  SELECT gen_random_uuid()
  WHERE NOT EXISTS (SELECT 1 FROM public.system_stats);

  -- تحديث الإحصائيات
  UPDATE public.system_stats
  SET 
    total_users = (SELECT count(*) FROM auth.users),
    total_active_stores = (SELECT count(*) FROM public.store_settings WHERE store_name IS NOT NULL),
    total_page_views = (SELECT sum(view_count) FROM public.page_views),
    last_updated = now();
END;
$$;

CREATE OR REPLACE FUNCTION public.increment_page_view(store_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  existing_record RECORD;
BEGIN
  -- Check if a record already exists for this user
  SELECT * INTO existing_record 
  FROM page_views 
  WHERE user_id = store_user_id;
  
  IF found THEN
    -- Update existing record
    UPDATE page_views 
    SET 
      view_count = existing_record.view_count + 1,
      last_viewed_at = now()
    WHERE id = existing_record.id;
  ELSE
    -- Insert new record
    INSERT INTO page_views (user_id)
    VALUES (store_user_id);
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.cleanup_expired_otps()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN 
    DELETE FROM public.password_reset_otps 
    WHERE expires_at < now() OR is_used = true; 
END;
$$;

CREATE OR REPLACE FUNCTION public.trigger_cleanup_expired_otps()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN 
    PERFORM public.cleanup_expired_otps(); 
    RETURN NEW; 
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (new.id);
  RETURN new;
END;
$$;

CREATE OR REPLACE FUNCTION public.create_notifications_table_if_not_exists()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN 'جدول الإشعارات موجود بالفعل';
EXCEPTION
  WHEN OTHERS THEN
    RETURN 'حدث خطأ أثناء التحقق من جدول الإشعارات';
END;
$$;