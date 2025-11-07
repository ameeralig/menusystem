
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, ImagePlus, Link as LinkIcon, Star, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { Product } from "@/types/product";
import ImageUploadPreview from "@/components/products/add/ImageUploadPreview";

interface ProductDetailsFormProps {
  productData: Partial<Product>;
  setProductData: (data: Partial<Product>) => void;
  uploadMethod: "url" | "file";
  setUploadMethod: (method: "url" | "file") => void;
  selectedFile: File | null;
  setSelectedFile: (file: File | null) => void;
  previewUrl: string | null;
  setPreviewUrl: (url: string | null) => void;
  loading: boolean;
  onSubmit: (data: Partial<Product>) => Promise<void>;
  selectedCategory: string;
}

const ProductDetailsForm = ({
  productData,
  setProductData,
  uploadMethod,
  setUploadMethod,
  selectedFile,
  setSelectedFile,
  previewUrl,
  setPreviewUrl,
  loading,
  onSubmit,
  selectedCategory
}: ProductDetailsFormProps) => {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
      
      // تحديث بيانات المنتج
      if (uploadMethod === "file") {
        setProductData({ ...productData, image_url: "" });
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // التحقق من صحة البيانات
    const newErrors: Record<string, string> = {};
    if (!productData.name?.trim()) {
      newErrors.name = "اسم المنتج مطلوب";
    }
    
    if (!productData.price || productData.price <= 0) {
      newErrors.price = "يجب إدخال سعر صحيح";
    }
    
    // إذا كانت هناك أخطاء، توقف عن الإرسال
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    // إعداد بيانات المنتج للإرسال
    const submissionData = {
      ...productData,
      category: selectedCategory || productData.category,
      image_url: uploadMethod === "url" ? productData.image_url : undefined,
    };
    
    onSubmit(submissionData);
  };

  const updateField = (field: keyof Product, value: any) => {
    setProductData({ ...productData, [field]: value });
    // مسح رسالة الخطأ عند تعديل الحقل
    if (errors[field]) {
      const newErrors = { ...errors };
      delete newErrors[field];
      setErrors(newErrors);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 py-4">
      <h2 className="text-xl font-semibold mb-6">أدخل تفاصيل المنتج</h2>
      
      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name" className={cn(errors.name && "text-destructive")}>
              اسم المنتج <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              value={productData.name || ""}
              onChange={(e) => updateField('name', e.target.value)}
              placeholder="أدخل اسم المنتج"
              className={cn(errors.name && "border-destructive")}
            />
            {errors.name && (
              <p className="text-destructive text-sm">{errors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">وصف المنتج</Label>
            <Textarea
              id="description"
              value={productData.description || ""}
              onChange={(e) => updateField('description', e.target.value)}
              placeholder="أدخل وصف المنتج (اختياري)"
              className="min-h-[120px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="price" className={cn(errors.price && "text-destructive")}>
              السعر (بالدينار العراقي) <span className="text-destructive">*</span>
            </Label>
            <Input
              id="price"
              type="number"
              min="0"
              step="0.01"
              value={productData.price || ""}
              onChange={(e) => updateField('price', parseFloat(e.target.value))}
              placeholder="أدخل سعر المنتج"
              className={cn(errors.price && "border-destructive")}
            />
            {errors.price && (
              <p className="text-destructive text-sm">{errors.price}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">التصنيف</Label>
            <Input
              id="category"
              value={selectedCategory || productData.category || ""}
              readOnly
              className="bg-muted"
            />
          </div>

          <Card className="border-muted">
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <Label htmlFor="is_new" className="cursor-pointer">منتج جديد</Label>
                </div>
                <Switch
                  id="is_new"
                  checked={productData.is_new || false}
                  onCheckedChange={(checked) => updateField('is_new', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-red-500" />
                  <Label htmlFor="is_popular" className="cursor-pointer">الأكثر طلباً</Label>
                </div>
                <Switch
                  id="is_popular"
                  checked={productData.is_popular || false}
                  onCheckedChange={(checked) => updateField('is_popular', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-6">
          <div>
            <Label>صورة المنتج</Label>
            <div className="flex gap-3 mt-2">
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
          </div>

          {uploadMethod === "url" ? (
            <div className="space-y-2">
              <Label htmlFor="image_url">رابط الصورة</Label>
              <Input
                id="image_url"
                type="url"
                value={productData.image_url || ""}
                onChange={(e) => updateField('image_url', e.target.value)}
                placeholder="أدخل رابط صورة المنتج"
              />
              
              {productData.image_url && (
                <div className="mt-4 border rounded-lg overflow-hidden">
                  <img 
                    src={productData.image_url} 
                    alt="معاينة المنتج" 
                    className="w-full h-auto max-h-64 object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://placehold.co/600x400?text=صورة+غير+متاحة";
                    }}
                  />
                </div>
              )}
            </div>
          ) : (
            <ImageUploadPreview
              previewUrl={previewUrl}
              onSelect={() => document.getElementById('product-file-upload')?.click()}
            />
          )}
          
          <input
            id="product-file-upload"
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      </div>

      <div className="pt-6 flex justify-end">
        <Button 
          type="submit"
          disabled={loading}
          size="lg"
          className="min-w-[150px]"
        >
          {loading ? "جاري الحفظ..." : "حفظ المنتج"}
        </Button>
      </div>
    </form>
  );
};

export default ProductDetailsForm;
