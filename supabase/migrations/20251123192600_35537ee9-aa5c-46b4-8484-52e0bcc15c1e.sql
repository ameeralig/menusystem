-- إنشاء دالة has_role للتحقق من الأدوار بشكل آمن
create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = _user_id
      and role = _role
  )
$$;

-- تحديث RLS policy لجدول system_stats للاستخدام مع has_role
drop policy if exists "Allow read access for admin" on public.system_stats;

create policy "Allow read access for admin"
on public.system_stats
for select
to authenticated
using (public.has_role(auth.uid(), 'admin'));

-- تحديث RLS policy لجدول notifications لمنع الإدراج غير المصرح به
create policy "Only admins can insert notifications"
on public.notifications
for insert
to authenticated
with check (public.has_role(auth.uid(), 'admin'));

-- إضافة policy لحذف الإشعارات للمسؤولين
create policy "Admins can delete any notifications"
on public.notifications
for delete
to authenticated
using (public.has_role(auth.uid(), 'admin'));