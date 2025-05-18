
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Star, TrendingUp, Loader2, Image } from "lucide-react";
import { Product } from "@/types/product";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

interface EditProductFormProps {
  product: Product | null;
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
  isLoading?: boolean;
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
  isLoading = false,
}: EditProductFormProps) => {
  if (!product) return null;
  
  // إضافة معالج للصورة وعرض محسن
  const getOptimizedImageUrl = (url: string | null | undefined) => {
    if (!url) return null;
    
    const baseUrl = url.split('?')[0];
    
    // تحسين URL الصورة لاستخدام WebP إذا كان متاحًا
    if (baseUrl.includes('supabase.co') || baseUrl.includes('lovable-app')) {
      return `${baseUrl}?format=webp&quality=80&t=${Date.now()}`;
    }
    
    return url;
  };
  
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <form onSubmit={onSubmit} className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>تعديل المنتج</CardTitle>
          <CardDescription>قم بتحديث معلومات المنتج من هنا</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* عرض صورة المنتج إذا وجدت */}
          {product.image_url && (
            <div className="mb-4">
              <Label className="mb-2 block">صورة المنتج</Label>
              <div className="relative rounded-md overflow-hidden aspect-video w-full max-w-sm mx-auto">
                {!imageLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                    <Image className="h-8 w-8 text-gray-400 animate-pulse" />
                  </div>
                )}
                <img
                  src={getOptimizedImageUrl(product.image_url)}
                  alt={product.name}
                  className={`w-full h-full object-contain transition-opacity duration-300 ${
                    imageLoaded ? 'opacity-100' : 'opacity-0'
                  }`}
                  onLoad={() => setImageLoaded(true)}
                  loading="lazy"
                  decoding="async"
                />
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">اسم المنتج</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="أدخل اسم المنتج"
                required
                className="text-right"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">وصف المنتج</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="أدخل وصف المنتج"
                className="min-h-[100px] text-right"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">السعر</Label>
                <Input
                  id="price"
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="أدخل السعر"
                  required
                  className="text-right"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">التصنيف</Label>
                <Input
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="أدخل التصنيف"
                  className="text-right"
                />
              </div>
            </div>
          </div>

          <Separator className="my-4" />

          <div className="space-y-4">
            <h3 className="text-lg font-medium">خصائص المنتج</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center justify-between space-x-4 rtl:space-x-reverse">
                <Label htmlFor="is_new" className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  منتج جديد
                </Label>
                <Switch
                  id="is_new"
                  checked={isNew}
                  onCheckedChange={setIsNew}
                />
              </div>

              <div className="flex items-center justify-between space-x-4 rtl:space-x-reverse">
                <Label htmlFor="is_popular" className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-red-500" />
                  الأكثر طلباً
                </Label>
                <Switch
                  id="is_popular"
                  checked={isPopular}
                  onCheckedChange={setIsPopular}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-4 justify-end">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
          disabled={isLoading}
        >
          إلغاء
        </Button>
        <Button 
          type="submit"
          disabled={isLoading}
          className="min-w-[100px]"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "حفظ التغييرات"
          )}
        </Button>
      </div>
    </form>
  );
};

export default EditProductForm;
