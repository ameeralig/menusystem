-- إصلاح trigger جدول الطلبات
-- المشكلة: الـ trigger يحاول الوصول إلى عمود status غير موجود

CREATE OR REPLACE FUNCTION public.update_orders_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;