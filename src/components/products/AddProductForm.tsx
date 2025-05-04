
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Star, TrendingUp } from "lucide-react";
import ProductImageUploader from "./ProductImageUploader";

interface AddProductFormProps {
  loading: boolean;
  formData: {
    name: string;
    description: string;
    price: string;
    image_url: string;
    category: string;
    is_new: boolean;
    is_popular: boolean;
  };
  setFormData: (data: any) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  uploadMethod: "url" | "file";
  setUploadMethod: (method: "url" | "file") => void;
  selectedFile: File | null;
  previewUrl: string | null;
  handleFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const AddProductForm = ({
  loading,
  formData,
  setFormData,
  handleSubmit,
  uploadMethod,
  setUploadMethod,
  selectedFile,
  previewUrl,
}: AddProductFormProps) => {
  // معالج لتحديد الصورة من مكون رفع الصورة
  const handleImageSelect = (file: File | null, url: string) => {
    setFormData({ ...formData, image_url: url });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">اسم المنتج</Label>
        <Input
          id="name"
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="أدخل اسم المنتج"
          className="w-full"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">وصف المنتج</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="أدخل وصف المنتج (اختياري)"
          className="w-full min-h-[100px]"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">تصنيف المنتج (اختياري)</Label>
        <Input
          id="category"
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          placeholder="أدخل تصنيف المنتج"
          className="w-full"
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
          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
          placeholder="أدخل سعر المنتج"
          className="w-full"
        />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between space-x-4">
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <Switch
              id="is_new"
              checked={formData.is_new}
              onCheckedChange={(checked) => setFormData({ ...formData, is_new: checked })}
            />
            <Label htmlFor="is_new" className="flex items-center gap-2">
              <Star className="h-4 w-4 text-yellow-500" />
              منتج جديد
            </Label>
          </div>
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <Switch
              id="is_popular"
              checked={formData.is_popular}
              onCheckedChange={(checked) => setFormData({ ...formData, is_popular: checked })}
            />
            <Label htmlFor="is_popular" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-red-500" />
              الأكثر طلباً
            </Label>
          </div>
        </div>
      </div>

      <ProductImageUploader 
        onImageSelect={handleImageSelect}
        initialImageUrl={previewUrl || formData.image_url}
      />

      <Button
        type="submit"
        className="w-full"
        disabled={loading}
      >
        {loading ? "جاري الحفظ..." : "حفظ المنتج"}
      </Button>
    </form>
  );
};

export default AddProductForm;
