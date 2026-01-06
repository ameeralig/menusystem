-- إضافة صلاحيات الموظفين
ALTER TABLE public.employees 
ADD COLUMN IF NOT EXISTS can_add_products boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS can_edit_products boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS can_delete_products boolean DEFAULT false;