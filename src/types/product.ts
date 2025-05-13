
export interface Product {
  id: string;
  name: string;
  price: number;
  description?: string | null;
  image_url?: string | null;
  category?: string | null;
  user_id: string;
  is_new?: boolean | null;
  is_popular?: boolean | null;
  display_order?: number | null;
  category_id?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}
