
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GripVertical, Save } from "lucide-react";
import { CategoryImage } from "@/types/categoryImage";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

interface CategoryOrderManagerProps {
  categories: string[];
  categoryImages: CategoryImage[];
  onOrderUpdate: () => void;
}

export const CategoryOrderManager = ({
  categories,
  categoryImages,
  onOrderUpdate,
}: CategoryOrderManagerProps) => {
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [orderedCategories, setOrderedCategories] = useState(categories);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // دالة لبدء السحب
  const handleDragStart = (e: React.DragEvent, category: string) => {
    setDraggedItem(category);
    e.dataTransfer.effectAllowed = "move";
  };

  // دالة للسماح بالإفلات
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  // دالة للإفلات
  const handleDrop = (e: React.DragEvent, targetCategory: string) => {
    e.preventDefault();
    
    if (!draggedItem) return;

    const newOrder = [...orderedCategories];
    const draggedIndex = newOrder.indexOf(draggedItem);
    const targetIndex = newOrder.indexOf(targetCategory);

    // إزالة العنصر المسحوب من موقعه الأصلي
    newOrder.splice(draggedIndex, 1);
    // إدراجه في الموقع الجديد
    newOrder.splice(targetIndex, 0, draggedItem);

    setOrderedCategories(newOrder);
    setDraggedItem(null);
  };

  // دالة لحفظ الترتيب الجديد
  const saveOrder = async () => {
    setIsLoading(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) {
        throw new Error("يجب تسجيل الدخول أولاً");
      }

      // تحديث ترتيب كل تصنيف
      for (let i = 0; i < orderedCategories.length; i++) {
        const category = orderedCategories[i];
        const categoryImage = categoryImages.find(img => img.category === category);
        
        if (categoryImage) {
          // تحديث الترتيب إذا كانت الصورة موجودة
          const { error } = await supabase
            .from("category_images")
            .update({ display_order: i + 1 })
            .eq("id", categoryImage.id);

          if (error) throw error;
        } else {
          // إنشاء سجل جديد إذا لم تكن الصورة موجودة
          const { error } = await supabase
            .from("category_images")
            .insert({
              user_id: userData.user.id,
              category: category,
              image_url: "",
              display_order: i + 1,
            });

          if (error) throw error;
        }
      }

      toast({
        title: "تم حفظ الترتيب",
        description: "تم تحديث ترتيب التصنيفات بنجاح",
      });

      onOrderUpdate();
    } catch (error: any) {
      console.error("خطأ في حفظ ترتيب التصنيفات:", error);
      toast({
        title: "فشل في حفظ الترتيب",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // تحديث الترتيب عند تغيير التصنيفات
  React.useEffect(() => {
    // ترتيب التصنيفات حسب display_order إذا كانت متوفرة
    const sortedCategories = [...categories].sort((a, b) => {
      const aImage = categoryImages.find(img => img.category === a);
      const bImage = categoryImages.find(img => img.category === b);
      
      const aOrder = aImage?.display_order || 999;
      const bOrder = bImage?.display_order || 999;
      
      return aOrder - bOrder;
    });
    
    setOrderedCategories(sortedCategories);
  }, [categories, categoryImages]);

  if (categories.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>ترتيب التصنيفات</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center">
            لا توجد تصنيفات لترتيبها. أضف منتجات أولاً لإنشاء التصنيفات.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>ترتيب التصنيفات</CardTitle>
        <p className="text-sm text-muted-foreground">
          اسحب التصنيفات لإعادة ترتيبها حسب ما تريد عرضه في متجرك
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          {orderedCategories.map((category, index) => (
            <div
              key={category}
              draggable
              onDragStart={(e) => handleDragStart(e, category)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, category)}
              className={`
                flex items-center gap-3 p-3 border rounded-lg cursor-move 
                transition-all duration-200 hover:shadow-md
                ${draggedItem === category ? "opacity-50" : ""}
              `}
            >
              <GripVertical className="h-4 w-4 text-muted-foreground" />
              <span className="flex-1 text-right">{category}</span>
              <span className="text-sm text-muted-foreground">
                الترتيب: {index + 1}
              </span>
            </div>
          ))}
        </div>

        <Button 
          onClick={saveOrder} 
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? (
            "جاري الحفظ..."
          ) : (
            <>
              <Save className="ml-2 h-4 w-4" />
              حفظ الترتيب
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};
