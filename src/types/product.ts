
export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  category: string | null;
  is_new: boolean;
  is_popular: boolean;
  display_order?: number | null;
}
