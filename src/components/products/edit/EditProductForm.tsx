
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { ImagePlus, Star, TrendingUp, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Product } from "@/types/product";
import { useIsMobile } from "@/hooks/use-mobile";
import ProductPreviewCard from "@/components/products/ProductPreviewCard";

interface EditProductFormProps {
  product: Product;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  onCancel: () => void;
  name: string;
  setName: (value: string) => void;
  description: string;
  setDescription: (value: string) => void;
  price: string;
  setPrice: (value: string) => void;
  category: string;
  setCategory: (value: string) => void;
  isNew: boolean;
  setIsNew: (value: boolean) => void;
  isPopular: boolean;
  setIsPopular: (value: boolean) => void;
  isLoading: boolean;
}

const EditProductForm = ({
  product,
  onSubmit,
  onCancel,
  name,
  setName,
  description,
  setDescription,
  price,
  setPrice,
  category,
  setCategory,
  isNew,
  setIsNew,
  isPopular,
  setIsPopular,
  isLoading,
}: EditProductFormProps) => {
  const isMobile = useIsMobile();
  const [showPreview, setShowPreview] = useState(false);
  
  // البيانات المعدلة للمنتج للعرض في المعاينة
  const previewProduct = {
    ...product,
    name,
    description,
    price: parseFloat(price),
    category,
    is_new: isNew,
    is_popular: isPopular,
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">تعديل المنتج</h2>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setShowPreview(!showPreview)}
        >
          {showPreview ? "إخفاء المعاينة" : "معاينة المنتج"}
        </Button>
      </div>

      <div className={cn(
        "grid gap-6",
        showPreview ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"
      )}>
        <form onSubmit={onSubmit} className="space-y-4">
          <Card className="p-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">اسم المنتج</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="أدخل اسم المنتج"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">وصف المنتج</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="أدخل وصف المنتج (اختياري)"
                  className="min-h-[100px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">السعر (بالدينار العراقي)</Label>
                <Input
                  id="price"
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="أدخل سعر المنتج"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">التصنيف</Label>
                <Input
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="أدخل تصنيف المنتج (اختياري)"
                />
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <h3 className="font-medium mb-3">خصائص المنتج</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <Label htmlFor="is_new" className="cursor-pointer">منتج جديد</Label>
                </div>
                <Switch
                  id="is_new"
                  checked={isNew}
                  onCheckedChange={setIsNew}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <TrendingUp className="h-4 w-4 text-red-500" />
                  <Label htmlFor="is_popular" className="cursor-pointer">الأكثر طلباً</Label>
                </div>
                <Switch
                  id="is_popular"
                  checked={isPopular}
                  onCheckedChange={setIsPopular}
                />
              </div>
            </div>
          </Card>

          {/* صورة المنتج - للعرض فقط */}
          {product.image_url && (
            <Card className="p-4">
              <h3 className="font-medium mb-3">صورة المنتج</h3>
              <div className="flex justify-center p-2 border rounded-md bg-muted/20">
                <img 
                  src={product.image_url}
                  alt={product.name}
                  className="max-h-48 object-contain rounded"
                />
              </div>
              <p className="text-sm text-muted-foreground mt-2 text-center">
                لتغيير الصورة، يرجى إنشاء منتج جديد
              </p>
            </Card>
          )}

          {!product.image_url && (
            <Card className="p-4">
              <h3 className="font-medium mb-3">صورة المنتج</h3>
              <div className="flex justify-center items-center p-8 border-2 border-dashed rounded-md">
                <div className="text-center">
                  <ImagePlus className="h-12 w-12 mx-auto text-muted-foreground/50" />
                  <p className="text-sm text-muted-foreground mt-2">
                    لا توجد صورة لهذا المنتج
                  </p>
                </div>
              </div>
            </Card>
          )}

          <div className="flex items-center justify-between pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
            >
              إلغاء
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  جاري الحفظ...
                </>
              ) : (
                "حفظ التغييرات"
              )}
            </Button>
          </div>
        </form>

        {/* معاينة المنتج */}
        {showPreview && (
          <div className="space-y-4">
            <Card className="p-4">
              <h3 className="font-medium mb-3 text-center">معاينة المنتج</h3>
              <div className="flex justify-center">
                <div className="w-full max-w-[250px]">
                  <ProductPreviewCard product={previewProduct} />
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default EditProductForm;
