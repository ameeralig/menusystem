
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import ImageUploader from "@/components/shared/ImageUploader";

interface CategorySelectorProps {
  onCategorySelected: (category: string, imageUrl?: string, selectedFile?: File | null) => void;
  existingCategories: string[];
  setExistingCategories: React.Dispatch<React.SetStateAction<string[]>>;
}

const CategorySelector: React.FC<CategorySelectorProps> = ({
  onCategorySelected,
  existingCategories,
  setExistingCategories,
}) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [categoryInput, setCategoryInput] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("يجب تسجيل الدخول أولاً");
      }
      
      // الحصول على التصنيفات الفريدة من المنتجات
      const { data: products, error: productsError } = await supabase
        .from("products")
        .select("category")
        .eq("user_id", user.id)
        .not("category", "is", null);
      
      if (productsError) throw productsError;
      
      // الحصول على قائمة التصنيفات المعرفة مسبقًا
      const { data: categories, error: categoriesError } = await supabase
        .from("categories")
        .select("name")
        .eq("user_id", user.id);
        
      if (categoriesError) throw categoriesError;
      
      // دمج التصنيفات من المنتجات والتصنيفات المعرفة
      const productCategories = products
        .map(p => p.category?.trim())
        .filter(Boolean) as string[];
        
      const definedCategories = categories
        .map(c => c.name?.trim())
        .filter(Boolean) as string[];
        
      // إزالة التكرارات
      const uniqueCategories = [...new Set([...productCategories, ...definedCategories])];
      
      setExistingCategories(uniqueCategories.filter(Boolean).sort());
    } catch (error: any) {
      console.error("خطأ في جلب التصنيفات:", error);
      toast({
        title: "خطأ في جلب التصنيفات",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchCategories();
  }, []);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!categoryInput.trim()) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال اسم التصنيف",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      onCategorySelected(categoryInput.trim(), imageUrl);
    } catch (error: any) {
      console.error("خطأ:", error);
      toast({
        title: "حدث خطأ",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleSelectCategory = (category: string) => {
    if (isSubmitting) return;
    setCategoryInput(category);
  };

  return (
    <div className="space-y-8">
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-medium mb-4">أضف تصنيفًا جديدًا</h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="category">اسم التصنيف</Label>
                <Input
                  id="category"
                  value={categoryInput}
                  onChange={(e) => setCategoryInput(e.target.value)}
                  placeholder="أدخل اسم التصنيف الجديد"
                />
              </div>
              
              <div className="space-y-2">
                <Label>صورة التصنيف (اختيارية)</Label>
                <ImageUploader
                  initialImageUrl={imageUrl}
                  onImageUploaded={setImageUrl}
                  bucketName="category-images"
                  folder="categories"
                  aspectRatio="landscape"
                  maxSizeInMB={2}
                  buttonText="إضافة صورة للتصنيف"
                  placeholder="أدخل رابط صورة التصنيف"
                />
              </div>
              
              <Button 
                type="submit" 
                disabled={isSubmitting || !categoryInput.trim()} 
                className="w-full mt-4"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                    جاري المعالجة...
                  </>
                ) : (
                  "متابعة"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
        
        <div className="space-y-4">
          <h3 className="text-lg font-medium">أو اختر من التصنيفات الحالية</h3>
          {isLoading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : existingCategories.length > 0 ? (
            <div className="grid gap-2">
              {existingCategories.map((category) => (
                <Button
                  key={category}
                  variant={categoryInput === category ? "default" : "outline"}
                  className="justify-start text-right w-full"
                  onClick={() => handleSelectCategory(category)}
                >
                  {category}
                </Button>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground p-4 text-center">
              لا توجد تصنيفات سابقة
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CategorySelector;
