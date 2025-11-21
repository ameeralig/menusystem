import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Upload, ImagePlus, Link as LinkIcon, Star, TrendingUp, ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface ProductFormData {
  name: string;
  description: string;
  price: string;
  image_url: string;
  category: string;
  is_new: boolean;
  is_popular: boolean;
}

interface ProductDetailsStepProps {
  formData: ProductFormData;
  onFormDataChange: (data: ProductFormData) => void;
  onBack: () => void;
  onSubmit: () => void;
  loading: boolean;
  imageUploadState: {
    uploadMethod: "url" | "file";
    selectedFile: File | null;
    previewUrl: string | null;
  };
  onImageUploadStateChange: (state: {
    uploadMethod: "url" | "file";
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

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("حجم الملف كبير جداً. الحد الأقصى هو 5MB");
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
        <div className="flex gap-4">
          <Button
            type="button"
            variant={imageUploadState.uploadMethod === "url" ? "default" : "outline"}
            onClick={() => onImageUploadStateChange({ ...imageUploadState, uploadMethod: "url" })}
            className="flex-1"
          >
            <LinkIcon className="w-4 h-4 ml-2" />
            رابط صورة
          </Button>
          <Button
            type="button"
            variant={imageUploadState.uploadMethod === "file" ? "default" : "outline"}
            onClick={() => onImageUploadStateChange({ ...imageUploadState, uploadMethod: "file" })}
            className="flex-1"
          >
            <Upload className="w-4 h-4 ml-2" />
            رفع صورة
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
        ) : (
          <div className="space-y-4">
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
              onChange={handleFileSelect}
              className="hidden"
            />
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
    </div>
  );
};
