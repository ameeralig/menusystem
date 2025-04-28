
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import { Folder, ImagePlus, Upload, Link as LinkIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { createCategory, getCategoryByName } from "@/utils/categoryStorage";
import { Category } from "@/types/category";

interface CategorySelectorProps {
  existingCategories: Category[];
  isLoading: boolean;
  onCategorySelected: (categoryId: string, category?: Category) => void;
}

const CategorySelector = ({ existingCategories, isLoading, onCategorySelected }: CategorySelectorProps) => {
  const { toast } = useToast();
  const [selectionType, setSelectionType] = useState<"existing" | "new">("existing");
  const [newCategory, setNewCategory] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [isCreating, setIsCreating] = useState(false);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // إنشاء URL مؤقت لعرض الصورة
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
    }
  };

  const handleSubmit = async () => {
    try {
      // الحصول على معرف المستخدم الحالي
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          variant: "destructive",
          title: "خطأ",
          description: "يجب تسجيل الدخول أولاً"
        });
        return;
      }

      if (selectionType === "existing" && selectedCategoryId) {
        // استخدام تصنيف موجود
        const selectedCategory = existingCategories.find(c => c.id === selectedCategoryId);
        onCategorySelected(selectedCategoryId, selectedCategory);
      } else if (selectionType === "new" && newCategory) {
        // التحقق من وجود الملف
        if (!selectedFile) {
          toast({
            variant: "destructive",
            title: "خطأ",
            description: "يرجى اختيار صورة للتصنيف الجديد"
          });
          return;
        }

        // التحقق مما إذا كان التصنيف موجودًا بالفعل
        const existingCategory = await getCategoryByName(newCategory, user.id);
        if (existingCategory) {
          toast({
            variant: "destructive",
            title: "تصنيف موجود",
            description: "هذا التصنيف موجود بالفعل، يرجى اختياره من القائمة"
          });
          return;
        }

        setIsCreating(true);
        
        // إنشاء تصنيف جديد مع صورة
        const newCategoryData = await createCategory(newCategory, selectedFile, user.id);
        
        if (newCategoryData) {
          toast({
            title: "تم إنشاء التصنيف",
            description: `تم إنشاء التصنيف "${newCategory}" بنجاح`
          });
          onCategorySelected(newCategoryData.id, newCategoryData);
        }
      }
    } catch (error: any) {
      console.error("خطأ:", error);
      toast({
        variant: "destructive",
        title: "فشل العملية",
        description: error.message
      });
    } finally {
      setIsCreating(false);
    }
  };

  // تنظيف عنوان URL المؤقت عند إزالة المكون
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  return (
    <div className="space-y-6">
      <RadioGroup
        defaultValue="existing"
        onValueChange={(value) => setSelectionType(value as "existing" | "new")}
        className="grid gap-4"
      >
        <div className={cn(
          "flex items-center space-x-2 space-x-reverse border rounded-lg p-4",
          selectionType === "existing" ? "border-primary" : "border-gray-200"
        )}>
          <RadioGroupItem value="existing" id="existing" />
          <Label htmlFor="existing" className="flex items-center gap-2">
            <Folder className="h-4 w-4" />
            اختيار من التصنيفات الموجودة
          </Label>
        </div>
        <div className={cn(
          "flex items-center space-x-2 space-x-reverse border rounded-lg p-4",
          selectionType === "new" ? "border-primary" : "border-gray-200"
        )}>
          <RadioGroupItem value="new" id="new" />
          <Label htmlFor="new" className="flex items-center gap-2">
            <ImagePlus className="h-4 w-4" />
            إنشاء تصنيف جديد
          </Label>
        </div>
      </RadioGroup>

      {selectionType === "existing" && (
        <div className="space-y-4">
          <Label>اختر التصنيف</Label>
          {isLoading ? (
            <div className="flex justify-center p-6">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : existingCategories.length > 0 ? (
            <div className="grid grid-cols-2 gap-4">
              {existingCategories.map((category) => (
                <div key={category.id} className="relative">
                  <Button
                    type="button"
                    variant={selectedCategoryId === category.id ? "default" : "outline"}
                    onClick={() => setSelectedCategoryId(category.id)}
                    className="w-full h-auto p-2 flex flex-col items-center gap-2"
                  >
                    <div className="w-full aspect-video overflow-hidden rounded-md">
                      <img 
                        src={category.image_url} 
                        alt={category.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span>{category.name}</span>
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center p-6 bg-muted/50 rounded-lg">
              <p className="text-muted-foreground">لم يتم العثور على تصنيفات. قم بإنشاء تصنيف جديد.</p>
            </div>
          )}
        </div>
      )}

      {selectionType === "new" && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="categoryName">اسم التصنيف الجديد</Label>
            <Input
              id="categoryName"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="أدخل اسم التصنيف"
            />
          </div>

          <div className="space-y-2">
            <Label>صورة التصنيف</Label>
            <div>
              <div 
                onClick={() => document.getElementById('file-upload')?.click()}
                className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
              >
                {previewUrl ? (
                  <img 
                    src={previewUrl} 
                    alt="معاينة" 
                    className="max-h-48 mx-auto rounded-lg"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <ImagePlus className="h-12 w-12 text-muted-foreground" />
                    <p className="text-muted-foreground">اضغط هنا لاختيار صورة</p>
                  </div>
                )}
              </div>
              <input
                id="file-upload"
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          </div>
        </div>
      )}

      <Button 
        onClick={handleSubmit}
        disabled={
          isCreating ||
          (selectionType === "existing" && !selectedCategoryId) ||
          (selectionType === "new" && (!newCategory || !selectedFile))
        }
        className="w-full"
      >
        {isCreating ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
            جاري الإنشاء...
          </>
        ) : (
          "متابعة"
        )}
      </Button>
    </div>
  );
};

export default CategorySelector;
