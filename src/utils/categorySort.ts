import { CategoryImage } from "@/types/categoryImage";

/**
 * دالة موحدة لترتيب التصنيفات حسب display_order
 * تستخدم في جميع أنحاء التطبيق لضمان ترتيب متسق
 */
export const sortCategoriesByOrder = (
  categories: string[],
  categoryImages: CategoryImage[]
): string[] => {
  return [...categories].sort((a, b) => {
    const aImage = categoryImages.find(img => img.category === a);
    const bImage = categoryImages.find(img => img.category === b);
    
    // التصنيفات التي لها display_order تأتي أولاً
    const aOrder = aImage?.display_order ?? 999999;
    const bOrder = bImage?.display_order ?? 999999;
    
    // إذا كان الترتيب متساوي، نرتب أبجدياً
    if (aOrder === bOrder) {
      return a.localeCompare(b, 'ar');
    }
    
    return aOrder - bOrder;
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
