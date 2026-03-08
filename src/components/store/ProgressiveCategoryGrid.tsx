import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useMemo } from "react";
import { CategoryImage } from "@/types/categoryImage";
import { FontSettings } from "@/types/store";
import { sortCategoriesByOrder } from "@/utils/categorySort";
import { Skeleton } from "@/components/ui/skeleton";
import { Edit, GripVertical } from "lucide-react";
import CategoryImageUploadDialog from "./fast-template/CategoryImageUploadDialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ProgressiveCategoryGridProps {
  categories: string[];
  onCategorySelect: (category: string) => void;
  fontSettings?: FontSettings;
  categoryImages?: CategoryImage[];
  isLoading?: boolean;
  isStoreOwner?: boolean;
  storeOwnerId?: string;
  refreshData?: () => void;
}

const ProgressiveCategoryGrid = ({
  categories,
  onCategorySelect,
  fontSettings,
  categoryImages = [],
  isLoading = false,
  isStoreOwner = false,
  storeOwnerId,
  refreshData
}: ProgressiveCategoryGridProps) => {
  const [visibleCategories, setVisibleCategories] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedCategoryForUpload, setSelectedCategoryForUpload] = useState("");
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [orderedCategories, setOrderedCategories] = useState<string[]>([]);

  // ترتيب التصنيفات حسب display_order
  const sortedCategories = useMemo(() => {
    const sorted = sortCategoriesByOrder(categories, categoryImages);
    return sorted;
  }, [categories, categoryImages]);

  // تحديث الترتيب المحلي
  useEffect(() => {
    setOrderedCategories(sortedCategories);
  }, [sortedCategories]);

  // تحميل التصنيفات تدريجياً
  useEffect(() => {
    if (orderedCategories.length === 0 || isLoading) {
      setVisibleCategories([]);
      setCurrentIndex(0);
      return;
    }

    const timer = setInterval(() => {
      setCurrentIndex(prev => {
        const next = prev + 3;
        if (next <= orderedCategories.length) {
          setVisibleCategories(orderedCategories.slice(0, next));
          return next;
        } else {
          setVisibleCategories(orderedCategories);
          clearInterval(timer);
          return orderedCategories.length;
        }
      });
    }, 50);

    return () => clearInterval(timer);
  }, [orderedCategories, isLoading]);

  const getCategoryImage = (category: string) => {
    return categoryImages.find(img => img.category === category)?.image_url;
  };

  const getCategoryTextClasses = () => {
    if (fontSettings?.categoryText?.isCustom) {
      return "text-lg font-semibold";
    }
    switch (fontSettings?.categoryText?.family) {
      case 'Cairo': return "text-lg font-semibold font-cairo";
      case 'Amiri': return "text-lg font-semibold font-amiri";
      case 'Tajawal': return "text-lg font-semibold font-tajawal";
      default: return "text-lg font-semibold";
    }
  };

  // فتح نافذة تعديل التصنيف
  const handleEditCategory = (category: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedCategoryForUpload(category);
    setUploadDialogOpen(true);
  };

  const handleUploadSuccess = () => {
    refreshData?.();
  };

  // حفظ الترتيب
  const saveOrder = async (newOrder: string[]) => {
    if (!storeOwnerId) return;
    try {
      for (let i = 0; i < newOrder.length; i++) {
        const category = newOrder[i];
        const existing = categoryImages?.find(img => img.category === category);
        if (existing) {
          await supabase
            .from('category_images')
            .update({ display_order: i })
            .eq('id', existing.id);
        } else {
          await supabase
            .from('category_images')
            .insert({
              category,
              user_id: storeOwnerId,
              image_url: '',
              display_order: i,
            });
        }
      }
      refreshData?.();
      toast.success("تم حفظ الترتيب");
    } catch (error) {
      console.error('خطأ في حفظ الترتيب:', error);
      toast.error("فشل حفظ الترتيب");
    }
  };

  // السحب والإفلات
  const handleDragStart = (e: React.DragEvent, index: number) => {
    if (!isStoreOwner) return;
    e.dataTransfer.effectAllowed = 'move';
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (!isStoreOwner || draggedIndex === null) return;
    e.dataTransfer.dropEffect = 'move';
    if (index !== dragOverIndex) setDragOverIndex(index);
  };

  const handleDragLeave = () => setDragOverIndex(null);

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
    setVisibleCategories(newOrder);
    setDraggedIndex(null);
    setDragOverIndex(null);
    await saveOrder(newOrder);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // Skeleton loader
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="rounded-2xl overflow-hidden border border-border">
            <Skeleton className="aspect-square w-full" />
            <div className="p-3 bg-card">
              <Skeleton className="h-5 w-3/4 mx-auto" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
        <div className="text-6xl mb-4">📦</div>
        <h3 className="text-xl font-semibold text-foreground mb-2">لا توجد تصنيفات متاحة</h3>
        <p className="text-muted-foreground">ابدأ بإضافة منتجات إلى متجرك لإنشاء التصنيفات</p>
      </motion.div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* عداد التقدم */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full border border-primary/20">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            <span className="text-sm font-medium text-primary">
              {visibleCategories.length} من {orderedCategories.length} تصنيف
            </span>
          </div>
        </motion.div>

        {/* شبكة التصنيفات */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <AnimatePresence>
            {visibleCategories.map((category, index) => {
              const imageUrl = getCategoryImage(category);
              const isDragging = draggedIndex === index;
              const isDragOver = dragOverIndex === index;

              return (
                <motion.div
                  key={category}
                  initial={{ opacity: 0, scale: 0.8, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.4, delay: index * 0.05, type: "spring", stiffness: 100 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  draggable={isStoreOwner}
                  onDragStart={(e: any) => handleDragStart(e, index)}
                  onDragOver={(e: any) => handleDragOver(e, index)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e: any) => handleDrop(e, index)}
                  onDragEnd={handleDragEnd}
                  onClick={() => !isDragging && onCategorySelect(category)}
                  className={`group cursor-pointer relative ${
                    isDragging ? 'opacity-40 scale-95' : ''
                  } ${isDragOver ? 'ring-2 ring-primary ring-offset-2 rounded-2xl' : ''}`}
                >
                  <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-card to-muted shadow-lg hover:shadow-xl transition-all duration-300 border border-border">

                    {/* أيقونة السحب */}
                    {isStoreOwner && (
                      <div className="absolute top-2 left-2 z-20 bg-primary/90 text-primary-foreground rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-lg cursor-grab active:cursor-grabbing">
                        <GripVertical className="w-3.5 h-3.5" />
                      </div>
                    )}

                    {/* أيقونة التعديل */}
                    {isStoreOwner && (
                      <button
                        onClick={(e) => handleEditCategory(category, e)}
                        className="absolute top-2 right-2 z-20 bg-primary/90 text-primary-foreground rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-lg hover:bg-primary"
                        title="تعديل التصنيف"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {/* صورة التصنيف */}
                    {imageUrl ? (
                      <div className="aspect-square overflow-hidden">
                        <motion.img
                          initial={{ scale: 1.2, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ duration: 0.5 }}
                          src={imageUrl}
                          alt={category}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          loading="lazy"
                        />
                      </div>
                    ) : (
                      <div className="aspect-square flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/40">
                        <motion.div
                          initial={{ rotate: -10, scale: 0.8 }}
                          animate={{ rotate: 0, scale: 1 }}
                          transition={{ duration: 0.4, delay: index * 0.1 }}
                          className="text-4xl"
                        >
                          📦
                        </motion.div>
                      </div>
                    )}

                    {/* تأثير التدرج */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                    {/* اسم التصنيف */}
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <motion.h3
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.3, delay: 0.2 }}
                        className={`${getCategoryTextClasses()} text-white text-center drop-shadow-lg`}
                        style={{
                          fontFamily: fontSettings?.categoryText?.isCustom
                            ? fontSettings.categoryText.family
                            : undefined
                        }}
                      >
                        {category}
                      </motion.h3>
                    </div>

                    {/* تأثير الهوفر */}
                    <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    {/* رقم التصنيف */}
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className="absolute top-2 right-2 w-6 h-6 bg-primary text-primary-foreground text-xs font-bold rounded-full flex items-center justify-center shadow-lg"
                      style={{ display: isStoreOwner ? 'none' : 'flex' }}
                    >
                      {index + 1}
                    </motion.div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* مؤشر التحميل المتبقي */}
        {visibleCategories.length < orderedCategories.length && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-4">
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
              />
              <span className="text-sm">تحميل المزيد من التصنيفات...</span>
            </div>
          </motion.div>
        )}
      </div>

      {/* نافذة تعديل صورة التصنيف */}
      {isStoreOwner && storeOwnerId && (
        <CategoryImageUploadDialog
          open={uploadDialogOpen}
          onOpenChange={setUploadDialogOpen}
          category={selectedCategoryForUpload}
          currentImageUrl={getCategoryImage(selectedCategoryForUpload) || undefined}
          userId={storeOwnerId}
          onSuccess={handleUploadSuccess}
        />
      )}
    </>
  );
};

export default ProgressiveCategoryGrid;
