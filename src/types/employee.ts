export interface Employee {
  id: string;
  store_owner_id: string;
  user_id: string | null;
  full_name: string;
  phone: string | null;
  email: string;
  is_active: boolean;
  can_add_products?: boolean;
  can_edit_products?: boolean;
  can_delete_products?: boolean;
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

export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled';

export interface Order {
  id: string;
  store_owner_id: string;
  employee_id: string | null;
  table_id: string | null;
  table_number: string | null;
  status: OrderStatus;
  total_amount: number;
  tax_amount: number;
  discount_amount: number;
  final_amount: number;
  notes: string | null;
  customer_name: string | null;
  customer_phone: string | null;
  created_at: string;
  updated_at: string;
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
