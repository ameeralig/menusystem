-- تحديث enum الأدوار لإضافة موظف
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'employee';

-- إضافة حقل تفعيل نظام الموظفين في إعدادات المتجر
ALTER TABLE public.store_settings 
ADD COLUMN IF NOT EXISTS employee_system_enabled boolean DEFAULT false;

-- جدول الموظفين
CREATE TABLE IF NOT EXISTS public.employees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_owner_id uuid NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  phone text,
  email text NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(store_owner_id, email)
);

-- جدول الطاولات
CREATE TABLE IF NOT EXISTS public.tables (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_owner_id uuid NOT NULL,
  table_number text NOT NULL,
  capacity integer DEFAULT 4,
  is_occupied boolean DEFAULT false,
  current_order_id uuid,
  created_at timestamptz DEFAULT now(),
  UNIQUE(store_owner_id, table_number)
);

-- enum لحالة الطلب
CREATE TYPE public.order_status AS ENUM ('pending', 'preparing', 'ready', 'completed', 'cancelled');

-- جدول الطلبات
CREATE TABLE IF NOT EXISTS public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_owner_id uuid NOT NULL,
  employee_id uuid REFERENCES public.employees(id) ON DELETE SET NULL,
  table_id uuid REFERENCES public.tables(id) ON DELETE SET NULL,
  table_number text,
  status public.order_status DEFAULT 'pending',
  total_amount numeric(10,2) DEFAULT 0,
  tax_amount numeric(10,2) DEFAULT 0,
  discount_amount numeric(10,2) DEFAULT 0,
  final_amount numeric(10,2) DEFAULT 0,
  notes text,
  customer_name text,
  customer_phone text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

-- جدول عناصر الطلب
CREATE TABLE IF NOT EXISTS public.order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  product_name text NOT NULL,
  quantity integer NOT NULL CHECK (quantity > 0),
  unit_price numeric(10,2) NOT NULL CHECK (unit_price >= 0),
  subtotal numeric(10,2) NOT NULL CHECK (subtotal >= 0),
  notes text,
  created_at timestamptz DEFAULT now()
);

-- إنشاء indexes للأداء
CREATE INDEX IF NOT EXISTS idx_employees_store_owner ON public.employees(store_owner_id);
CREATE INDEX IF NOT EXISTS idx_employees_user_id ON public.employees(user_id);
CREATE INDEX IF NOT EXISTS idx_tables_store_owner ON public.tables(store_owner_id);
CREATE INDEX IF NOT EXISTS idx_orders_store_owner ON public.orders(store_owner_id);
CREATE INDEX IF NOT EXISTS idx_orders_employee ON public.orders(employee_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON public.order_items(order_id);

-- تفعيل RLS على كل الجداول
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Function للتحقق من أن المستخدم موظف نشط
CREATE OR REPLACE FUNCTION public.is_active_employee(user_uuid uuid, owner_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.employees
    WHERE user_id = user_uuid
      AND store_owner_id = owner_uuid
      AND is_active = true
  );
$$;

-- Function للحصول على store_owner_id من employee
CREATE OR REPLACE FUNCTION public.get_employee_store_owner(user_uuid uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT store_owner_id
  FROM public.employees
  WHERE user_id = user_uuid
    AND is_active = true
  LIMIT 1;
$$;

-- RLS Policies للموظفين
CREATE POLICY "Store owners can view their employees"
  ON public.employees FOR SELECT
  USING (auth.uid() = store_owner_id);

CREATE POLICY "Store owners can insert employees"
  ON public.employees FOR INSERT
  WITH CHECK (auth.uid() = store_owner_id);

CREATE POLICY "Store owners can update their employees"
  ON public.employees FOR UPDATE
  USING (auth.uid() = store_owner_id);

CREATE POLICY "Store owners can delete their employees"
  ON public.employees FOR DELETE
  USING (auth.uid() = store_owner_id);

CREATE POLICY "Employees can view their own record"
  ON public.employees FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policies للطاولات
CREATE POLICY "Store owners can manage their tables"
  ON public.tables FOR ALL
  USING (auth.uid() = store_owner_id);

CREATE POLICY "Employees can view tables"
  ON public.tables FOR SELECT
  USING (public.is_active_employee(auth.uid(), store_owner_id));

CREATE POLICY "Employees can update table status"
  ON public.tables FOR UPDATE
  USING (public.is_active_employee(auth.uid(), store_owner_id));

-- RLS Policies للطلبات
CREATE POLICY "Store owners can view their orders"
  ON public.orders FOR SELECT
  USING (auth.uid() = store_owner_id);

CREATE POLICY "Store owners can manage orders"
  ON public.orders FOR ALL
  USING (auth.uid() = store_owner_id);

CREATE POLICY "Employees can view store orders"
  ON public.orders FOR SELECT
  USING (public.is_active_employee(auth.uid(), store_owner_id));

CREATE POLICY "Employees can create orders"
  ON public.orders FOR INSERT
  WITH CHECK (public.is_active_employee(auth.uid(), store_owner_id));

CREATE POLICY "Employees can update orders"
  ON public.orders FOR UPDATE
  USING (public.is_active_employee(auth.uid(), store_owner_id));

-- RLS Policies لعناصر الطلب
CREATE POLICY "Store owners can view order items"
  ON public.order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
        AND orders.store_owner_id = auth.uid()
    )
  );

CREATE POLICY "Store owners can manage order items"
  ON public.order_items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
        AND orders.store_owner_id = auth.uid()
    )
  );

CREATE POLICY "Employees can view order items"
  ON public.order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
        AND public.is_active_employee(auth.uid(), orders.store_owner_id)
    )
  );

CREATE POLICY "Employees can manage order items"
  ON public.order_items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
        AND public.is_active_employee(auth.uid(), orders.store_owner_id)
    )
  );

-- Trigger لتحديث updated_at للموظفين
CREATE OR REPLACE FUNCTION public.update_employees_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_employees_timestamp
  BEFORE UPDATE ON public.employees
  FOR EACH ROW
  EXECUTE FUNCTION public.update_employees_updated_at();

-- Trigger لتحديث updated_at للطلبات
CREATE OR REPLACE FUNCTION public.update_orders_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    NEW.completed_at = now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_orders_timestamp
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_orders_updated_at();

-- Trigger لتحديث حالة الطاولة عند تغيير حالة الطلب
CREATE OR REPLACE FUNCTION public.update_table_status()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status IN ('completed', 'cancelled') AND OLD.status NOT IN ('completed', 'cancelled') THEN
    UPDATE public.tables
    SET is_occupied = false, current_order_id = NULL
    WHERE id = NEW.table_id;
  ELSIF NEW.status NOT IN ('completed', 'cancelled') AND NEW.table_id IS NOT NULL THEN
    UPDATE public.tables
    SET is_occupied = true, current_order_id = NEW.id
    WHERE id = NEW.table_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_table_status
  AFTER INSERT OR UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_table_status();

-- Function لحساب إجمالي الطلب تلقائياً
CREATE OR REPLACE FUNCTION public.calculate_order_total()
RETURNS TRIGGER AS $$
DECLARE
  items_total numeric(10,2);
BEGIN
  SELECT COALESCE(SUM(subtotal), 0)
  INTO items_total
  FROM public.order_items
  WHERE order_id = NEW.order_id;
  
  UPDATE public.orders
  SET total_amount = items_total,
      final_amount = items_total + COALESCE(tax_amount, 0) - COALESCE(discount_amount, 0)
  WHERE id = NEW.order_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_calculate_order_total
  AFTER INSERT OR UPDATE OR DELETE ON public.order_items
  FOR EACH ROW
  EXECUTE FUNCTION public.calculate_order_total();