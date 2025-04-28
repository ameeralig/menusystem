
export interface Product {
  id: string;
  name: string;
  price: number;
  description?: string | null;
  image_url?: string | null;
  category?: string | null; // اسم التصنيف (للتوافق مع النظام القديم)
  category_id?: string | null; // معرف التصنيف (للنظام الجديد)
  user_id: string;
  is_new?: boolean | null;
  is_popular?: boolean | null;
  display_order?: number | null;
}
