export interface Employee {
  id: string;
  store_owner_id: string;
  user_id: string | null;
  full_name: string;
  phone: string | null;
  email: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Table {
  id: string;
  store_owner_id: string;
  table_number: string;
  capacity: number;
  is_occupied: boolean;
  current_order_id: string | null;
  created_at: string;
}

export interface Order {
  id: string;
  store_owner_id: string;
  employee_id: string | null;
  table_id: string | null;
  table_number: string | null;
  total_amount: number | null;
  tax_amount: number | null;
  discount_amount: number | null;
  final_amount: number | null;
  notes: string | null;
  customer_name: string | null;
  customer_phone: string | null;
  created_at: string | null;
  updated_at: string | null;
  completed_at: string | null;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  notes: string | null;
  created_at: string;
}
