import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Upload, ImagePlus, Link as LinkIcon, Star, TrendingUp, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AddProductModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onProductAdded?: () => void;
}

const AddProductModal = ({ isOpen, onOpenChange, onProductAdded }: AddProductModalProps) => {
  const [loading, setLoading] = useState(false);
  const [uploadMethod, setUploadMethod] = useState<"url" | "file">("url");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    image_url: "",
    category: "",
    is_new: false,
    is_popular: false,
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("حجم الملف كبير جداً. الحد الأقصى هو 5MB");
        return;
      }
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("يجب تسجيل الدخول أولاً");
        return;
      }

      let imageUrl = formData.image_url;

      if (uploadMethod === "file" && selectedFile) {
        const fileExt = selectedFile.name.split(".").pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("product-images")
          .upload(filePath, selectedFile);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from("product-images")
          .getPublicUrl(filePath);

        imageUrl = urlData.publicUrl;
      }

      const { error } = await supabase.from("products").insert([
        {
          name: formData.name,
          description: formData.description,
          price: parseFloat(formData.price),
          image_url: imageUrl,
          category: formData.category || null,
          user_id: user.id,
          is_new: formData.is_new,
          is_popular: formData.is_popular,
        },
      ]);

      if (error) throw error;

      toast.success("تم إضافة المنتج بنجاح");
      
      // إعادة تعيين النموذج
      setFormData({
        name: "",
        description: "",
        price: "",
        image_url: "",
        category: "",
        is_new: false,
        is_popular: false,
      });
      setSelectedFile(null);
      setPreviewUrl(null);
      
      onProductAdded?.();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error adding product:", error);
      toast.error(error.message || "حدث خطأ أثناء إضافة المنتج");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">إضافة منتج جديد</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
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
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Switch
                  id="is_new"
                  checked={formData.is_new}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_new: checked })}
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
                  onCheckedChange={(checked) => setFormData({ ...formData, is_popular: checked })}
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
                variant={uploadMethod === "url" ? "default" : "outline"}
                onClick={() => setUploadMethod("url")}
                className="flex-1"
              >
                <LinkIcon className="w-4 h-4 ml-2" />
                رابط صورة
              </Button>
              <Button
                type="button"
                variant={uploadMethod === "file" ? "default" : "outline"}
                onClick={() => setUploadMethod("file")}
                className="flex-1"
              >
                <Upload className="w-4 h-4 ml-2" />
                رفع صورة
              </Button>
            </div>

            {uploadMethod === "url" ? (
              <div className="space-y-2">
                <Input
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
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
                  {previewUrl ? (
                    <div className="relative">
                      <img 
                        src={previewUrl} 
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
                          setPreviewUrl(null);
                          setSelectedFile(null);
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
              type="submit"
              className="flex-1"
              disabled={loading}
            >
              {loading ? "جاري الحفظ..." : "حفظ المنتج"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              إلغاء
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddProductModal;
