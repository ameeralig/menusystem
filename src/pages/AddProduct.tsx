import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Upload, ImagePlus, Link as LinkIcon, Star, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";

const AddProduct = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
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
      setSelectedFile(file);
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
    }
  };

  const uploadImage = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    
    const { error: uploadError, data } = await supabase.storage
      .from('product-images')
      .upload(fileName, file);

    if (uploadError) {
      throw new Error('Failed to upload image');
    }

    const { data: { publicUrl } } = supabase.storage
      .from('product-images')
      .getPublicUrl(fileName);

    return publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        throw new Error("يجب تسجيل الدخول أولاً");
      }

      let finalImageUrl = formData.image_url;
      
      if (uploadMethod === "file" && selectedFile) {
        finalImageUrl = await uploadImage(selectedFile);
      }

      const { error } = await supabase.from("products").insert({
        user_id: userData.user.id,
        name: formData.name,
        description: formData.description || null,
        price: parseFloat(formData.price),
        image_url: finalImageUrl || null,
        category: formData.category || null,
        is_new: formData.is_new,
        is_popular: formData.is_popular,
      });

      if (error) throw error;

      toast({
        title: "تم إضافة المنتج بنجاح",
        duration: 3000,
      });

      navigate("/dashboard");
    } catch (error: any) {
      toast({
        title: "حدث خطأ أثناء إضافة المنتج",
        description: error.message,
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-2xl mx-auto space-y-8">
        <Card className="p-6">
          <h1 className="text-2xl font-bold mb-6 text-center">إضافة منتج جديد</h1>
          
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
                    onClick={() => document.getElementById('file-upload')?.click()}
                  >
                    {previewUrl ? (
                      <img 
                        src={previewUrl} 
                        alt="Preview" 
                        className="max-h-48 rounded-lg"
                      />
                    ) : (
                      <>
                        <ImagePlus className="w-12 h-12 text-muted-foreground" />
                        <p className="text-muted-foreground">اضغط هنا لاختيار صورة</p>
                      </>
                    )}
                  </div>
                  <input
                    id="file-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? "جاري الحفظ..." : "حفظ المنتج"}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default AddProduct;