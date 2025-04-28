
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import AddProductForm from "@/components/products/AddProductForm";
import CategorySelector from "@/components/products/CategorySelector";
import { uploadImage } from "@/utils/storageHelpers";
import { useCategories } from "@/hooks/store/useCategories";
import { Category } from "@/types/category";

const AddProduct = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showProductForm, setShowProductForm] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [uploadMethod, setUploadMethod] = useState<"url" | "file">("url");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const { categories, isLoading: categoriesLoading } = useCategories(currentUserId);
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    image_url: "",
    is_new: false,
    is_popular: false,
  });

  // الحصول على معرف المستخدم الحالي
  useEffect(() => {
    const getUserId = async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        setCurrentUserId(data.user.id);
      }
    };
    getUserId();
  }, []);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
    }
  };

  const handleCategorySelected = (categoryId: string, category?: Category) => {
    setSelectedCategoryId(categoryId);
    if (category) {
      setSelectedCategory(category);
    }
    setShowProductForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedCategoryId) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "يجب اختيار تصنيف للمنتج"
      });
      return;
    }
    
    setLoading(true);

    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        throw new Error("يجب تسجيل الدخول أولاً");
      }

      let finalImageUrl = formData.image_url;
      
      if (uploadMethod === "file" && selectedFile) {
        finalImageUrl = await uploadImage("product-images", selectedFile, userData.user.id, "products");
      }

      const { error } = await supabase.from("products").insert({
        user_id: userData.user.id,
        name: formData.name,
        description: formData.description || null,
        price: parseFloat(formData.price),
        image_url: finalImageUrl || null,
        category: selectedCategory?.name || null, // نحتفظ باسم التصنيف للتوافق مع النظام القديم
        category_id: selectedCategoryId, // نستخدم معرف التصنيف للربط
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

  // تنظيف عنوان URL المؤقت عند إزالة المكون
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-2xl mx-auto space-y-8">
        <Card className="p-6">
          <h1 className="text-2xl font-bold mb-6 text-center">إضافة منتج جديد</h1>
          
          {!showProductForm ? (
            <CategorySelector
              existingCategories={categories}
              isLoading={categoriesLoading}
              onCategorySelected={handleCategorySelected}
            />
          ) : (
            <AddProductForm
              loading={loading}
              formData={{ ...formData, categoryName: selectedCategory?.name || "" }}
              setFormData={setFormData}
              handleSubmit={handleSubmit}
              uploadMethod={uploadMethod}
              setUploadMethod={setUploadMethod}
              selectedFile={selectedFile}
              previewUrl={previewUrl}
              handleFileSelect={handleFileSelect}
              categoryName={selectedCategory?.name || ""}
            />
          )}
        </Card>
      </div>
    </div>
  );
};

export default AddProduct;
