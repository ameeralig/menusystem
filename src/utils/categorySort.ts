import { CategoryImage } from "@/types/categoryImage";

/**
 * دالة موحدة لترتيب التصنيفات حسب display_order
 * تستخدم في جميع أنحاء التطبيق لضمان ترتيب متسق
 */
export const sortCategoriesByOrder = (
  categories: string[],
  categoryImages: CategoryImage[]
): string[] => {
  // إنشاء Map للوصول السريع إلى display_order
  const orderMap = new Map<string, number>();
  categoryImages.forEach(img => {
    if (img.display_order !== null && img.display_order !== undefined) {
      orderMap.set(img.category, img.display_order);
    }
  });
  
  return [...categories].sort((a, b) => {
    const aOrder = orderMap.get(a);
    const bOrder = orderMap.get(b);
    
    // إذا كان كلاهما له ترتيب محدد
    if (aOrder !== undefined && bOrder !== undefined) {
      return aOrder - bOrder;
    }
    
    // إذا كان فقط a له ترتيب، يأتي أولاً
    if (aOrder !== undefined && bOrder === undefined) {
      return -1;
    }
    
    // إذا كان فقط b له ترتيب، يأتي أولاً
    if (aOrder === undefined && bOrder !== undefined) {
      return 1;
    }
    
    // إذا لم يكن لأي منهما ترتيب، نحتفظ بالترتيب الأصلي (لا نرتب!)
    return 0;
  });
};

/**
 * الحصول على ترتيب تصنيف معين
 */
export const getCategoryOrder = (
  category: string,
  categoryImages: CategoryImage[]
): number => {
  const image = categoryImages.find(img => img.category === category);
  return image?.display_order ?? 999999;
};
