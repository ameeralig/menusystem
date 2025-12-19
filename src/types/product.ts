
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
  is_available?: boolean | null;
  display_order?: number | null;
  category_id?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  discount_percentage?: number | null;
}

// حساب السعر بعد الخصم
export const getDiscountedPrice = (price: number, discountPercentage?: number | null): number => {
  if (!discountPercentage || discountPercentage <= 0) return price;
  return price - (price * discountPercentage / 100);
};

// التحقق من وجود خصم
export const hasDiscount = (discountPercentage?: number | null): boolean => {
  return !!discountPercentage && discountPercentage > 0;
};
