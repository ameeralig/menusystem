import React, { useMemo, useState } from "react";
import { CategoryImage } from "@/types/categoryImage";
import { sortCategoriesByOrder } from "@/utils/categorySort";
import { Edit, GripVertical } from "lucide-react";
import CategoryImageUploadDialog from "./CategoryImageUploadDialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CategoryTabsProps {
  categories: string[];
  selectedCategory: string | null;
  onCategorySelect: (category: string | null) => void;
  colorTheme?: string | null;
  categoryImages?: CategoryImage[];
  isStoreOwner?: boolean;
  storeOwnerId?: string;
  refreshData?: () => void;
}

const CategoryTabs: React.FC<CategoryTabsProps> = ({
  categories,
  selectedCategory,
  onCategorySelect,
  colorTheme,
  categoryImages,
  isStoreOwner = false,
  storeOwnerId,
  refreshData
}) => {
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedCategoryForUpload, setSelectedCategoryForUpload] = useState<string>("");
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [orderedCategories, setOrderedCategories] = useState<string[]>([]);

  // ترتيب التصنيفات حسب display_order
  const sortedCategories = useMemo(() => {
    if (!categoryImages || categoryImages.length === 0) {
      setOrderedCategories(categories);
      return categories;
    }
    const sorted = sortCategoriesByOrder(categories, categoryImages);
    setOrderedCategories(sorted);
    return sorted;
  }, [categories, categoryImages]);

  // الحصول على صورة التصنيف
  const getCategoryImage = (category: string) => {
    return categoryImages?.find(img => img.category === category);
  };

  // فتح نافذة رفع الصورة
  const handleEditCategory = (category: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedCategoryForUpload(category);
    setUploadDialogOpen(true);
  };

  // معالجة نجاح الرفع
  const handleUploadSuccess = () => {
    if (refreshData) {
      refreshData();
    }
  };

  // حفظ الترتيب تلقائياً
  const saveOrder = async (newOrder: string[]) => {
    if (!storeOwnerId) return;

    try {
      const updates = newOrder.map((category, index) => ({
        category,
        user_id: storeOwnerId,
        display_order: index,
      }));

      for (const update of updates) {
        const existingImage = categoryImages?.find(img => img.category === update.category);
        
        if (existingImage) {
          const { error } = await supabase
            .from('category_images')
            .update({ display_order: update.display_order })
            .eq('id', existingImage.id);
          
          if (error) throw error;
        } else {
          const { error } = await supabase
            .from('category_images')
            .insert({
              category: update.category,
              user_id: update.user_id,
              image_url: '',
              display_order: update.display_order,
            });
          
          if (error) throw error;
        }
      }

      if (refreshData) {
        refreshData();
      }
      toast.success("تم حفظ الترتيب تلقائياً");
    } catch (error) {
      console.error('خطأ في حفظ الترتيب:', error);
      toast.error("فشل حفظ الترتيب");
    }
  };

  // معالجات السحب والإفلات
  const handleDragStart = (e: React.DragEvent, index: number) => {
    if (!isStoreOwner) return;
    e.dataTransfer.effectAllowed = 'move';
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (!isStoreOwner || draggedIndex === null) return;
    e.dataTransfer.dropEffect = 'move';
    
    if (index !== dragOverIndex) {
      setDragOverIndex(index);
    }
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = async (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isStoreOwner || draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const newOrder = [...orderedCategories];
    const draggedItem = newOrder[draggedIndex];
    newOrder.splice(draggedIndex, 1);
    newOrder.splice(dropIndex, 0, draggedItem);

    setOrderedCategories(newOrder);
    setDraggedIndex(null);
    setDragOverIndex(null);

    // حفظ تلقائي
    await saveOrder(newOrder);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  return (
    <>
      <div className="w-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 overflow-visible">
        <div className="container mx-auto px-3 py-5 overflow-visible">
          {/* شريط التصنيفات القابل للتمرير */}
          <div className="flex gap-6 overflow-x-auto overflow-y-visible pb-5 pt-2 px-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
            {/* صور وأسماء التصنيفات */}
            {orderedCategories.map((category, index) => {
              const categoryImage = getCategoryImage(category);
              const isSelected = selectedCategory === category;
              const isDragging = draggedIndex === index;
              const isDragOver = dragOverIndex === index;
              
              return (
                <button
                  key={category}
                  draggable={isStoreOwner}
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, index)}
                  onDragEnd={handleDragEnd}
                  onClick={(e) => {
                    if (!isDragging) {
                      onCategorySelect(category);
                    }
                  }}
                  className={`
                    flex flex-col items-center gap-1.5 flex-shrink-0 transition-all duration-200 ease-in-out group relative z-10 py-1 px-2
                    ${isDragging ? 'opacity-40 scale-95 cursor-grabbing' : isStoreOwner ? 'cursor-grab active:cursor-grabbing' : ''}
                    ${isDragOver ? 'scale-110' : ''}
                  `}
                >
                  {/* أيقونة السحب للمالك */}
                  {isStoreOwner && !isDragging && (
                    <div className="absolute -top-1 -left-1 bg-primary/90 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-lg z-30">
                      <GripVertical className="w-3 h-3" />
                    </div>
                  )}
                  {/* الصورة الدائرية */}
                  <div className={`
                    relative w-16 h-16 rounded-full overflow-visible
                    transition-all duration-200
                    ${isSelected 
                      ? 'ring-4 ring-primary shadow-lg scale-105 z-20' 
                      : 'ring-2 ring-gray-200 dark:ring-gray-700 group-hover:ring-gray-300 dark:group-hover:ring-gray-600'
                    }
                  `}
                  style={
                    isSelected && colorTheme?.startsWith('#')
                      ? { '--tw-ring-color': colorTheme } as React.CSSProperties
                      : undefined
                  }
                  >
                    <div className="w-full h-full rounded-full overflow-hidden">
                      {categoryImage?.image_url ? (
                        <img
                          src={categoryImage.image_url}
                          alt={category}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center">
                          <span className="text-2xl font-bold text-primary">
                            {category.charAt(0)}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {/* أيقونة التعديل للمالك */}
                    {isStoreOwner && (
                      <button
                        onClick={(e) => handleEditCategory(category, e)}
                        className="absolute -bottom-1 -right-1 bg-primary text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-lg z-30"
                        title="تحديث صورة التصنيف"
                      >
                        <Edit className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  {/* اسم التصنيف */}
                  <span className={`
                    text-xs font-medium whitespace-nowrap transition-colors
                    ${isSelected 
                      ? 'text-primary font-semibold' 
                      : 'text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-gray-100'
                    }
                  `}
                  style={
                    isSelected && colorTheme?.startsWith('#')
                      ? { color: colorTheme }
                      : undefined
                  }
                  >
                    {category}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* نافذة رفع صورة التصنيف */}
      {isStoreOwner && storeOwnerId && (
        <CategoryImageUploadDialog
          open={uploadDialogOpen}
          onOpenChange={setUploadDialogOpen}
          category={selectedCategoryForUpload}
          currentImageUrl={getCategoryImage(selectedCategoryForUpload)?.image_url}
          userId={storeOwnerId}
          onSuccess={handleUploadSuccess}
        />
      )}
    </>
  );
};

export default CategoryTabs;
