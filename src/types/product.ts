
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
  original_price?: number | null; // السعر الأصلي (طريقة خصم بديلة)
}

// حساب السعر بعد الخصم - يدعم طريقتين:
// 1. السعر الأصلي (original_price) - الأولوية الأعلى
// 2. نسبة الخصم (discount_percentage)
export const getDiscountedPrice = (price: number, discountPercentage?: number | null, originalPrice?: number | null): number => {
  // إذا كان هناك سعر أصلي، السعر الحالي هو السعر المخفض
  if (originalPrice && originalPrice > price) {
    return price;
  }
  // وإلا نستخدم نسبة الخصم
  if (!discountPercentage || discountPercentage <= 0) return price;
  return price - (price * discountPercentage / 100);
};

// الحصول على السعر الأصلي (قبل الخصم)
export const getOriginalPrice = (price: number, discountPercentage?: number | null, originalPrice?: number | null): number => {
  // إذا كان هناك سعر أصلي محدد
  if (originalPrice && originalPrice > price) {
    return originalPrice;
  }
  // وإلا السعر الحالي هو الأصلي
  return price;
};

// التحقق من وجود خصم
export const hasDiscount = (discountPercentage?: number | null, originalPrice?: number | null, currentPrice?: number): boolean => {
  // خصم بالسعر الأصلي
  if (originalPrice && currentPrice && originalPrice > currentPrice) {
    return true;
  }
  // خصم بالنسبة المئوية
  return !!discountPercentage && discountPercentage > 0;
};
