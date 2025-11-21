import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Upload, ImagePlus, Link as LinkIcon, Plus, ChevronLeft, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { uploadImage } from "@/utils/storageHelpers";

interface CategorySelectionStepProps {
  categories: string[];
  selectedCategory: string;
  onCategorySelect: (category: string) => void;
  onNext: () => void;
  onCategoriesUpdate: (categories: string[]) => void;
}

export const CategorySelectionStep = ({
  categories,
  selectedCategory,
  onCategorySelect,
  onNext,
  onCategoriesUpdate,
}: CategorySelectionStepProps) => {
  const [isAddingNewCategory, setIsAddingNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [categoryImageUploadMethod, setCategoryImageUploadMethod] = useState<"url" | "file">("file");
  const [categoryImageFile, setCategoryImageFile] = useState<File | null>(null);
  const [categoryImageUrl, setCategoryImageUrl] = useState("");
  const [categoryImagePreview, setCategoryImagePreview] = useState<string | null>(null);

  const handleCategoryImageFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error("حجم الملف كبير جداً. الحد الأقصى هو 10MB");
        return;
      }
      setCategoryImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCategoryImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCategorySelect = (category: string) => {
    onCategorySelect(category);
    setIsAddingNewCategory(false);
  };

  const handleAddNewCategory = async () => {
    if (!newCategoryName.trim()) {
      toast.error("يرجى إدخال اسم التصنيف");
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("يجب تسجيل الدخول أولاً");
        return;
      }

      let finalImageUrl = categoryImageUrl;

      if (categoryImageUploadMethod === "file" && categoryImageFile) {
        toast.info("جاري رفع صورة التصنيف...");
        try {
          let processedFile = categoryImageFile;
          
          // معالجة صور HEIC من iPhone
          if (categoryImageFile.type === 'image/heic' || categoryImageFile.type === 'image/heif' || 
              categoryImageFile.name.toLowerCase().endsWith('.heic')) {
            toast.info("جاري تحويل الصورة...");
            const img = new Image();
            const objectUrl = URL.createObjectURL(categoryImageFile);
            
            await new Promise((resolve, reject) => {
              img.onload = resolve;
              img.onerror = () => reject(new Error('فشل تحميل الصورة'));
              img.src = objectUrl;
            });

            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(img, 0, 0);
            
            const blob = await new Promise<Blob>((resolve, reject) => {
              canvas.toBlob(
                (b) => b ? resolve(b) : reject(new Error('فشل تحويل الصورة')),
                'image/jpeg',
                0.9
              );
            });
            
            URL.revokeObjectURL(objectUrl);
            processedFile = new File([blob], categoryImageFile.name.replace(/\.heic$/i, '.jpg'), { 
              type: 'image/jpeg' 
            });
          }

          finalImageUrl = await uploadImage('صور التصنيفات', processedFile, user.id, 'categories');
        } catch (error) {
          console.error('خطأ في رفع صورة التصنيف:', error);
          toast.error("فشل رفع صورة التصنيف");
          return;
        }
      }

      if (finalImageUrl) {
        const { error: categoryImageError } = await supabase
          .from('category_images')
          .insert({
            user_id: user.id,
            category: newCategoryName.trim(),
            image_url: finalImageUrl
          });

        if (categoryImageError) {
          console.error('خطأ في حفظ صورة التصنيف:', categoryImageError);
        }
      }

      onCategorySelect(newCategoryName.trim());
      onCategoriesUpdate([...categories, newCategoryName.trim()]);
      setNewCategoryName("");
      setCategoryImageFile(null);
      setCategoryImageUrl("");
      setCategoryImagePreview(null);
      setIsAddingNewCategory(false);
      toast.success("تم إضافة التصنيف بنجاح");
    } catch (error) {
      console.error('خطأ في إضافة التصنيف:', error);
      toast.error("حدث خطأ أثناء إضافة التصنيف");
    }
  };

  const handleNext = () => {
    if (!selectedCategory) {
      toast.error("يرجى اختيار تصنيف أو إضافة تصنيف جديد");
      return;
    }
    onNext();
  };

  return (
    <div className="space-y-4">
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold mb-2">اختر تصنيف المنتج</h3>
        <p className="text-sm text-muted-foreground">اختر من التصنيفات الموجودة أو أضف تصنيف جديد</p>
      </div>

      {/* التصنيفات الموجودة */}
      {categories.length > 0 && (
        <div className="space-y-2">
          <Label>التصنيفات الموجودة</Label>
          <div className="grid grid-cols-2 gap-3 max-h-60 overflow-y-auto p-2">
            {categories.map((category) => (
              <Card
                key={category}
                className={cn(
                  "p-4 cursor-pointer transition-all hover:scale-105",
                  selectedCategory === category
                    ? "border-primary border-2 bg-primary/5"
                    : "border-border hover:border-primary/50"
                )}
                onClick={() => handleCategorySelect(category)}
              >
                <div className="text-center font-medium">{category}</div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* إضافة تصنيف جديد */}
      {!isAddingNewCategory ? (
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={() => setIsAddingNewCategory(true)}
        >
          <Plus className="w-4 h-4 ml-2" />
          إضافة تصنيف جديد
        </Button>
      ) : (
        <div className="space-y-3 p-4 border rounded-lg">
          <Label htmlFor="new-category">اسم التصنيف الجديد</Label>
          <Input
            id="new-category"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            placeholder="مثال: مشروبات، حلويات..."
            className="w-full"
          />
          
          {/* رفع صورة التصنيف */}
          <div className="space-y-3 mt-4">
            <Label>صورة التصنيف (اختياري)</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={categoryImageUploadMethod === "file" ? "default" : "outline"}
                onClick={() => setCategoryImageUploadMethod("file")}
                className="flex-1"
                size="sm"
              >
                <Upload className="w-3 h-3 ml-2" />
                رفع صورة
              </Button>
              <Button
                type="button"
                variant={categoryImageUploadMethod === "url" ? "default" : "outline"}
                onClick={() => setCategoryImageUploadMethod("url")}
                className="flex-1"
                size="sm"
              >
                <LinkIcon className="w-3 h-3 ml-2" />
                رابط صورة
              </Button>
            </div>

            {categoryImageUploadMethod === "file" ? (
              <div className="space-y-2">
                <div 
                  className={cn(
                    "border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:border-primary transition-colors",
                    "flex flex-col items-center justify-center gap-2"
                  )}
                  onClick={() => document.getElementById('category-image-upload')?.click()}
                >
                  {categoryImagePreview ? (
                    <div className="relative">
                      <img 
                        src={categoryImagePreview} 
                        alt="معاينة" 
                        className="max-h-32 rounded-lg"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-1 right-1 h-6 w-6"
                        onClick={(e) => {
                          e.stopPropagation();
                          setCategoryImagePreview(null);
                          setCategoryImageFile(null);
                        }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <>
                      <ImagePlus className="w-8 h-8 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">اضغط لاختيار صورة</p>
                    </>
                  )}
                </div>
                <input
                  id="category-image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleCategoryImageFileSelect}
                  className="hidden"
                />
              </div>
            ) : (
              <Input
                type="url"
                value={categoryImageUrl}
                onChange={(e) => setCategoryImageUrl(e.target.value)}
                placeholder="أدخل رابط صورة التصنيف"
                className="w-full"
              />
            )}
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              onClick={handleAddNewCategory}
              disabled={!newCategoryName.trim()}
              className="flex-1"
            >
              إضافة
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsAddingNewCategory(false);
                setNewCategoryName("");
                setCategoryImageFile(null);
                setCategoryImageUrl("");
                setCategoryImagePreview(null);
              }}
            >
              إلغاء
            </Button>
          </div>
        </div>
      )}

      {/* عرض التصنيف المختار */}
      {selectedCategory && (
        <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
          <div className="text-sm text-muted-foreground mb-1">التصنيف المختار:</div>
          <div className="font-semibold text-lg">{selectedCategory}</div>
        </div>
      )}

      {/* زر التالي */}
      <Button
        type="button"
        className="w-full"
        onClick={handleNext}
        disabled={!selectedCategory}
      >
        التالي
        <ChevronLeft className="w-4 h-4 mr-2" />
      </Button>
    </div>
  );
};
