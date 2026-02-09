import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Upload, ImagePlus, Link as LinkIcon, Star, TrendingUp, ChevronRight, X, Percent, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import ImageRepositoryPicker from "@/components/shared/ImageRepositoryPicker";
import { formatBytes } from "@/utils/cloudinaryUpload";

export interface ProductFormData {
  name: string;
  description: string;
  price: string;
  image_url: string;
  category: string;
  is_new: boolean;
  is_popular: boolean;
  discount_percentage: string;
  original_price: string;
  discount_method: 'percentage' | 'original_price';
}

interface ProductDetailsStepProps {
  formData: ProductFormData;
  onFormDataChange: (data: ProductFormData) => void;
  onBack: () => void;
  onSubmit: () => void;
  loading: boolean;
  imageUploadState: {
    uploadMethod: "url" | "file" | "repository";
    selectedFile: File | null;
    previewUrl: string | null;
  };
  onImageUploadStateChange: (state: {
    uploadMethod: "url" | "file" | "repository";
    selectedFile: File | null;
    previewUrl: string | null;
  }) => void;
}

export const ProductDetailsStep = ({
  formData,
  onFormDataChange,
  onBack,
  onSubmit,
  loading,
  imageUploadState,
  onImageUploadStateChange,
}: ProductDetailsStepProps) => {
  const [showRepositoryPicker, setShowRepositoryPicker] = useState(false);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error("حجم الملف كبير جداً. الحد الأقصى هو 10MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        onImageUploadStateChange({
          ...imageUploadState,
          selectedFile: file,
          previewUrl: reader.result as string,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRepositorySelect = (imageUrl: string, imageId: string) => {
    onFormDataChange({ ...formData, image_url: imageUrl });
    onImageUploadStateChange({
      uploadMethod: "repository",
      selectedFile: null,
      previewUrl: imageUrl,
    });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">اسم المنتج</Label>
        <Input
          id="name"
          required
          value={formData.name}
          onChange={(e) => onFormDataChange({ ...formData, name: e.target.value })}
          placeholder="أدخل اسم المنتج"
          className="w-full"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">وصف المنتج</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => onFormDataChange({ ...formData, description: e.target.value })}
          placeholder="أدخل وصف المنتج (اختياري)"
          className="w-full min-h-[100px]"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="price">السعر (بالدينار العراقي)</Label>
        <Input
          id="price"
          required
          type="number"
          min="0"
          step="0.01"
          value={formData.price}
          onChange={(e) => onFormDataChange({ ...formData, price: e.target.value })}
          placeholder="أدخل سعر المنتج"
          className="w-full"
        />
      </div>

      {/* طريقة الخصم */}
      <div className="space-y-4">
        <Label>طريقة الخصم</Label>
        <div className="flex gap-2">
          <Button
            type="button"
            variant={formData.discount_method === 'original_price' ? "default" : "outline"}
            onClick={() => onFormDataChange({ ...formData, discount_method: 'original_price', discount_percentage: '' })}
            className="flex-1 text-sm"
            size="sm"
          >
            سعر قبل وبعد
          </Button>
          <Button
            type="button"
            variant={formData.discount_method === 'percentage' ? "default" : "outline"}
            onClick={() => onFormDataChange({ ...formData, discount_method: 'percentage', original_price: '' })}
            className="flex-1 text-sm"
            size="sm"
          >
            <Percent className="w-4 h-4 ml-1" />
            نسبة مئوية
          </Button>
        </div>

        {formData.discount_method === 'original_price' ? (
          <div className="space-y-2">
            <Label htmlFor="original_price">السعر الأصلي (قبل الخصم)</Label>
            <Input
              id="original_price"
              type="number"
              min="0"
              step="0.01"
              value={formData.original_price}
              onChange={(e) => onFormDataChange({ ...formData, original_price: e.target.value })}
              placeholder="مثال: 5000"
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              السعر الحالي ({formData.price || '0'} د.ع) سيكون السعر الجديد بعد الخصم
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <Label htmlFor="discount" className="flex items-center gap-1">
              <Percent className="w-4 h-4" />
              نسبة الخصم
            </Label>
            <Input
              id="discount"
              type="number"
              min="0"
              max="100"
              step="1"
              value={formData.discount_percentage}
              onChange={(e) => onFormDataChange({ ...formData, discount_percentage: e.target.value })}
              placeholder="0"
              className="w-full"
            />
          </div>
        )}
      </div>

      {/* معاينة السعر بعد الخصم */}
      {formData.discount_method === 'original_price' && formData.original_price && parseFloat(formData.original_price) > parseFloat(formData.price || '0') && (
        <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
          <p className="text-sm text-green-700 dark:text-green-300">
            السعر الجديد: <span className="font-bold">{new Intl.NumberFormat('ar-IQ').format(parseFloat(formData.price || '0'))} د.ع</span>
            <span className="mr-2 text-gray-500 line-through text-xs">{new Intl.NumberFormat('ar-IQ').format(parseFloat(formData.original_price))} د.ع</span>
          </p>
        </div>
      )}
      {formData.discount_method === 'percentage' && formData.discount_percentage && parseFloat(formData.discount_percentage) > 0 && formData.price && (
        <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
          <p className="text-sm text-green-700 dark:text-green-300">
            السعر بعد الخصم: <span className="font-bold">{new Intl.NumberFormat('ar-IQ').format(parseFloat(formData.price) - (parseFloat(formData.price) * parseFloat(formData.discount_percentage) / 100))} د.ع</span>
            <span className="mr-2 text-gray-500 line-through text-xs">{new Intl.NumberFormat('ar-IQ').format(parseFloat(formData.price))} د.ع</span>
          </p>
        </div>
      )}

      <div className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Switch
              id="is_new"
              checked={formData.is_new}
              onCheckedChange={(checked) => onFormDataChange({ ...formData, is_new: checked })}
            />
            <Label htmlFor="is_new" className="flex items-center gap-2 cursor-pointer">
              <Star className="h-4 w-4 text-yellow-500" />
              منتج جديد
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              id="is_popular"
              checked={formData.is_popular}
              onCheckedChange={(checked) => onFormDataChange({ ...formData, is_popular: checked })}
            />
            <Label htmlFor="is_popular" className="flex items-center gap-2 cursor-pointer">
              <TrendingUp className="h-4 w-4 text-red-500" />
              الأكثر طلباً
            </Label>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <Label>صورة المنتج</Label>
        <div className="grid grid-cols-3 gap-2">
          <Button
            type="button"
            variant={imageUploadState.uploadMethod === "url" ? "default" : "outline"}
            onClick={() => onImageUploadStateChange({ ...imageUploadState, uploadMethod: "url" })}
            size="sm"
            className="text-xs"
          >
            <LinkIcon className="w-3 h-3 ml-1" />
            رابط
          </Button>
          <Button
            type="button"
            variant={imageUploadState.uploadMethod === "file" ? "default" : "outline"}
            onClick={() => onImageUploadStateChange({ ...imageUploadState, uploadMethod: "file" })}
            size="sm"
            className="text-xs"
          >
            <Upload className="w-3 h-3 ml-1" />
            رفع
          </Button>
          <Button
            type="button"
            variant={imageUploadState.uploadMethod === "repository" ? "default" : "outline"}
            onClick={() => setShowRepositoryPicker(true)}
            size="sm"
            className="text-xs"
          >
            <ImageIcon className="w-3 h-3 ml-1" />
            المستودع
          </Button>
        </div>

        {imageUploadState.uploadMethod === "url" ? (
          <div className="space-y-2">
            <Input
              type="url"
              value={formData.image_url}
              onChange={(e) => onFormDataChange({ ...formData, image_url: e.target.value })}
              placeholder="أدخل رابط صورة المنتج"
              className="w-full"
            />
          </div>
        ) : imageUploadState.uploadMethod === "file" ? (
          <div className="space-y-4">
            {/* معلومات الملف المحدد */}
            {imageUploadState.selectedFile && (
              <div className="flex items-center justify-between p-2 bg-muted/50 rounded-lg text-sm">
                <span className="truncate max-w-[200px]">{imageUploadState.selectedFile.name}</span>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {imageUploadState.selectedFile.type.split('/')[1]?.toUpperCase()}
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    {formatBytes(imageUploadState.selectedFile.size)}
                  </Badge>
                </div>
              </div>
            )}
            
            <div 
              className={cn(
                "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors",
                "flex flex-col items-center justify-center gap-2"
              )}
              onClick={() => document.getElementById('file-upload-modal')?.click()}
            >
              {imageUploadState.previewUrl ? (
                <div className="relative">
                  <img 
                    src={imageUploadState.previewUrl} 
                    alt="Preview" 
                    className="max-h-48 rounded-lg"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      onImageUploadStateChange({
                        ...imageUploadState,
                        previewUrl: null,
                        selectedFile: null,
                      });
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <>
                  <ImagePlus className="w-12 h-12 text-muted-foreground" />
                  <p className="text-muted-foreground">اضغط هنا لاختيار صورة</p>
                </>
              )}
            </div>
            
            <input
              id="file-upload-modal"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileSelect}
            />
          </div>
        ) : null}

        {/* معاينة الصورة المختارة من المستودع */}
        {imageUploadState.uploadMethod === "repository" && imageUploadState.previewUrl && (
          <div className="relative">
            <img 
              src={imageUploadState.previewUrl} 
              alt="صورة من المستودع" 
              className="w-full max-h-48 object-cover rounded-lg border"
            />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2"
              onClick={() => {
                onFormDataChange({ ...formData, image_url: '' });
                onImageUploadStateChange({
                  uploadMethod: "url",
                  previewUrl: null,
                  selectedFile: null,
                });
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      <div className="flex gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          disabled={loading}
          className="flex-1"
        >
          <ChevronRight className="w-4 h-4 ml-2" />
          السابق
        </Button>
        <Button
          type="button"
          className="flex-1"
          disabled={loading}
          onClick={onSubmit}
        >
          {loading ? "جاري الحفظ..." : "حفظ المنتج"}
        </Button>
      </div>

      <ImageRepositoryPicker
        isOpen={showRepositoryPicker}
        onClose={() => setShowRepositoryPicker(false)}
        onSelect={handleRepositorySelect}
      />
    </div>
  );
};
