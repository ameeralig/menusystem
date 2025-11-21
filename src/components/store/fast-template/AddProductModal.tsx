import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Upload, ImagePlus, Link as LinkIcon, Star, TrendingUp, X, Plus, ChevronRight, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";

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
  const [currentStep, setCurrentStep] = useState(1);
  const [categories, setCategories] = useState<string[]>([]);
  const [isAddingNewCategory, setIsAddingNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    image_url: "",
    category: "",
    is_new: false,
    is_popular: false,
  });

  // جلب التصنيفات الموجودة
  useEffect(() => {
    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen]);

  const fetchCategories = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: products } = await supabase
        .from("products")
        .select("category")
        .eq("user_id", user.id)
        .not("category", "is", null);

      if (products) {
        const uniqueCategories = [...new Set(products.map(p => p.category).filter(Boolean))] as string[];
        setCategories(uniqueCategories);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

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

  const handleCategorySelect = (category: string) => {
    setFormData({ ...formData, category });
    setIsAddingNewCategory(false);
  };

  const handleAddNewCategory = () => {
    if (newCategoryName.trim()) {
      setFormData({ ...formData, category: newCategoryName.trim() });
      setCategories([...categories, newCategoryName.trim()]);
      setNewCategoryName("");
      setIsAddingNewCategory(false);
    }
  };

  const handleNextStep = () => {
    if (currentStep === 1 && !formData.category) {
      toast.error("يرجى اختيار تصنيف أو إضافة تصنيف جديد");
      return;
    }
    setCurrentStep(2);
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
      setCurrentStep(1);
      setIsAddingNewCategory(false);
      
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
          <div className="flex items-center gap-2 mt-4">
            <div className={cn(
              "flex items-center justify-center w-8 h-8 rounded-full font-bold",
              currentStep >= 1 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            )}>
              1
            </div>
            <div className={cn("h-1 flex-1 rounded", currentStep >= 2 ? "bg-primary" : "bg-muted")} />
            <div className={cn(
              "flex items-center justify-center w-8 h-8 rounded-full font-bold",
              currentStep >= 2 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            )}>
              2
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {currentStep === 1 ? (
            // الخطوة الأولى: اختيار التصنيف
            <div className="space-y-4">
              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold mb-2">اختر تصنيف المنتج</h3>
                <p className="text-sm text-muted-foreground">اختر من التصنيفات الموجودة أو أضف تصنيف جديد</p>
              </div>

              {/* التصنيفات الموجودة */}
              {categories.length > 0 && (
                <div className="space-y-2">
                  <Label>التصنيفات الموجودة</Label>
                  <div className="grid grid-cols-2 gap-3 max-h-60 overflow-y-auto p-2">
                    {categories.map((category) => (
                      <Card
                        key={category}
                        className={cn(
                          "p-4 cursor-pointer transition-all hover:scale-105",
                          formData.category === category
                            ? "border-primary border-2 bg-primary/5"
                            : "border-border hover:border-primary/50"
                        )}
                        onClick={() => handleCategorySelect(category)}
                      >
                        <div className="text-center font-medium">{category}</div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* إضافة تصنيف جديد */}
              {!isAddingNewCategory ? (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => setIsAddingNewCategory(true)}
                >
                  <Plus className="w-4 h-4 ml-2" />
                  إضافة تصنيف جديد
                </Button>
              ) : (
                <div className="space-y-3 p-4 border rounded-lg">
                  <Label htmlFor="new-category">اسم التصنيف الجديد</Label>
                  <Input
                    id="new-category"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="مثال: مشروبات، حلويات..."
                    className="w-full"
                  />
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      onClick={handleAddNewCategory}
                      disabled={!newCategoryName.trim()}
                      className="flex-1"
                    >
                      إضافة
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsAddingNewCategory(false);
                        setNewCategoryName("");
                      }}
                    >
                      إلغاء
                    </Button>
                  </div>
                </div>
              )}

              {/* عرض التصنيف المختار */}
              {formData.category && (
                <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
                  <div className="text-sm text-muted-foreground mb-1">التصنيف المختار:</div>
                  <div className="font-semibold text-lg">{formData.category}</div>
                </div>
              )}

              {/* زر التالي */}
              <Button
                type="button"
                className="w-full"
                onClick={handleNextStep}
                disabled={!formData.category}
              >
                التالي
                <ChevronLeft className="w-4 h-4 mr-2" />
              </Button>
            </div>
          ) : (
            // الخطوة الثانية: تفاصيل المنتج
            <div className="space-y-6">
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
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentStep(1)}
                  disabled={loading}
                  className="flex-1"
                >
                  <ChevronRight className="w-4 h-4 ml-2" />
                  السابق
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={loading}
                >
                  {loading ? "جاري الحفظ..." : "حفظ المنتج"}
                </Button>
              </div>
            </div>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddProductModal;
