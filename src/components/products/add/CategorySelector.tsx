import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import { Folder, ImagePlus, Upload, Link as LinkIcon } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface CategorySelectorProps {
  existingCategories: string[];
  setExistingCategories: (categories: string[]) => void;
  onCategorySelected: (category: string, imageUrl?: string, selectedFile?: File | null) => void;
}

const CategorySelector = ({ 
  existingCategories, 
  setExistingCategories,
  onCategorySelected 
}: CategorySelectorProps) => {
  const [selectionType, setSelectionType] = useState<"existing" | "new">("existing");
  const [newCategory, setNewCategory] = useState("");
  const [uploadMethod, setUploadMethod] = useState<"file" | "url">("file");
  const [imageUrl, setImageUrl] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  // جلب التصنيفات الموجودة
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const { data: products } = await supabase
        .from("products")
        .select("category")
        .not("category", "is", null);

      const uniqueCategories = Array.from(new Set(products?.map(p => p.category) || []));
      setExistingCategories(uniqueCategories.filter((cat): cat is string => !!cat));
      
      // جلب صور التصنيفات الحالية
      await fetchCategoryImages(uniqueCategories as string[]);
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // جلب صور التصنيفات الحالية
  const fetchCategoryImages = async (categories: string[]) => {
    try {
      if (categories.length === 0) return;
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      const { data: categoryImages } = await supabase
        .from("category_images")
        .select("*")
        .eq("user_id", user.id);
        
      console.log("صور التصنيفات المتاحة:", categoryImages);
    } catch (error) {
      console.error("Error fetching category images:", error);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
    }
  };

  const handleSubmit = async () => {
    if (selectionType === "existing" && selectedCategory) {
      onCategorySelected(selectedCategory);
    } else if (selectionType === "new" && newCategory) {
      let finalImageUrl = "";
      
      if (uploadMethod === "file" && previewUrl) {
        finalImageUrl = previewUrl;
        // تمرير الملف المحلي للمعالجة
        onCategorySelected(newCategory, finalImageUrl, selectedFile);
      } else if (uploadMethod === "url" && imageUrl) {
        finalImageUrl = imageUrl;
        onCategorySelected(newCategory, finalImageUrl);
      } else {
        // بدون صورة
        onCategorySelected(newCategory);
      }
    }
  };

  return (
    <div className="space-y-6 py-4">
      <h2 className="text-xl font-semibold mb-6">اختر التصنيف المناسب لمنتجك</h2>
      
      <RadioGroup
        defaultValue="existing"
        onValueChange={(value) => setSelectionType(value as "existing" | "new")}
        className="grid gap-4"
      >
        <div className={cn(
          "flex items-center space-x-2 space-x-reverse border rounded-lg p-4 transition-all",
          selectionType === "existing" 
            ? "border-primary bg-primary/5 shadow-sm" 
            : "border-muted hover:border-muted-foreground/50"
        )}>
          <RadioGroupItem value="existing" id="existing" />
          <Label htmlFor="existing" className="flex items-center gap-2 cursor-pointer">
            <Folder className="h-4 w-4" />
            اختيار من التصنيفات الموجودة
          </Label>
        </div>
        <div className={cn(
          "flex items-center space-x-2 space-x-reverse border rounded-lg p-4 transition-all",
          selectionType === "new"
            ? "border-primary bg-primary/5 shadow-sm" 
            : "border-muted hover:border-muted-foreground/50"
        )}>
          <RadioGroupItem value="new" id="new" />
          <Label htmlFor="new" className="flex items-center gap-2 cursor-pointer">
            <ImagePlus className="h-4 w-4" />
            إنشاء تصنيف جديد
          </Label>
        </div>
      </RadioGroup>

      {selectionType === "existing" && (
        <div className="space-y-4 pt-4">
          <Label>اختر التصنيف المناسب</Label>
          {isLoading ? (
            <div className="py-8 text-center text-muted-foreground">جارِ تحميل التصنيفات...</div>
          ) : existingCategories.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {existingCategories.map((category) => (
                <Button
                  key={category}
                  type="button"
                  variant={selectedCategory === category ? "default" : "outline"}
                  onClick={() => setSelectedCategory(category)}
                  className={cn(
                    "justify-start h-auto py-3 transition-all",
                    selectedCategory === category ? "border-primary" : ""
                  )}
                >
                  {category}
                </Button>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-muted-foreground">
              لا توجد تصنيفات بعد. يمكنك إنشاء تصنيف جديد.
            </div>
          )}
        </div>
      )}

      {selectionType === "new" && (
        <div className="space-y-6 pt-4">
          <div className="space-y-2">
            <Label htmlFor="categoryName">اسم التصنيف الجديد</Label>
            <Input
              id="categoryName"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="أدخل اسم التصنيف الجديد"
              className="max-w-md"
            />
          </div>

          <div className="space-y-4">
            <Label>صورة التصنيف (اختياري)</Label>
            <div className="flex flex-wrap gap-3">
              <Button
                type="button"
                size="sm"
                variant={uploadMethod === "file" ? "default" : "outline"}
                onClick={() => setUploadMethod("file")}
              >
                <Upload className="h-4 w-4 ml-2" />
                رفع صورة
              </Button>
              <Button
                type="button"
                size="sm"
                variant={uploadMethod === "url" ? "default" : "outline"}
                onClick={() => setUploadMethod("url")}
              >
                <LinkIcon className="h-4 w-4 ml-2" />
                رابط صورة
              </Button>
            </div>

            {uploadMethod === "url" ? (
              <div className="max-w-md">
                <Input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="أدخل رابط الصورة"
                />
              </div>
            ) : (
              <div>
                <div 
                  onClick={() => document.getElementById('category-file-upload')?.click()}
                  className={cn(
                    "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all",
                    previewUrl ? "border-primary" : "border-muted hover:border-primary/50"
                  )}
                >
                  {previewUrl ? (
                    <div className="relative">
                      <img 
                        src={previewUrl} 
                        alt="معاينة" 
                        className="max-h-48 mx-auto rounded-lg object-contain"
                      />
                      <p className="mt-2 text-sm text-muted-foreground">
                        انقر لتغيير الصورة
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2 py-8">
                      <ImagePlus className="h-12 w-12 text-muted-foreground" />
                      <p className="text-muted-foreground">اضغط هنا لاختيار صورة</p>
                    </div>
                  )}
                </div>
                <input
                  id="category-file-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
            )}
          </div>
        </div>
      )}

      <div className="pt-6 flex justify-end">
        <Button 
          onClick={handleSubmit}
          disabled={
            (selectionType === "existing" && !selectedCategory) ||
            (selectionType === "new" && !newCategory)
          }
          size="lg"
          className="min-w-[150px]"
        >
          متابعة
        </Button>
      </div>
    </div>
  );
};

export default CategorySelector;
