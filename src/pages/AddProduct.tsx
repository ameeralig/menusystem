
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import AddProductForm from "@/components/products/AddProductForm";
import CategorySelector from "@/components/products/CategorySelector";
import { uploadImage, urlToFile } from "@/utils/storageHelpers";

const AddProduct = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showProductForm, setShowProductForm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [categoryImageUrl, setCategoryImageUrl] = useState<string | undefined>();
  const [existingCategories, setExistingCategories] = useState<string[]>([]);
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

  const fetchCategories = async () => {
    try {
      const { data: products } = await supabase
        .from("products")
        .select("category")
        .not("category", "is", null);

      const uniqueCategories = Array.from(new Set(products?.map(p => p.category) || []));
      setExistingCategories(uniqueCategories.filter((cat): cat is string => !!cat));
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCategorySelected = async (category: string, imageUrl?: string) => {
    setSelectedCategory(category);
    
    if (imageUrl) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("يجب تسجيل الدخول أولاً");
        
        let finalImageUrl: string;
        
        if (imageUrl.startsWith("blob:")) {
          // تحويل blob URL إلى ملف لرفعه
          const file = await urlToFile(imageUrl, "category-image.jpg");
          finalImageUrl = await uploadImage("category-images", file, user.id, category);
        } else {
          // استخدام الرابط مباشرة
          finalImageUrl = imageUrl;
        }
        
        // حفظ صورة التصنيف في قاعدة البيانات
        await supabase.from("category_images").insert({
          user_id: user.id,
          category: category,
          image_url: finalImageUrl
        });
        
        setCategoryImageUrl(finalImageUrl);
      } catch (error: any) {
        console.error("Error uploading category image:", error);
        toast({
          variant: "destructive",
          title: "خطأ في رفع صورة التصنيف",
          description: error.message
        });
        return;
      }
    }
    
    setFormData(prev => ({ ...prev, category }));
    setShowProductForm(true);
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
        finalImageUrl = await uploadImage("product-images", selectedFile, userData.user.id, "products");
      }

      const { error } = await supabase.from("products").insert({
        user_id: userData.user.id,
        name: formData.name,
        description: formData.description || null,
        price: parseFloat(formData.price),
        image_url: finalImageUrl || null,
        category: formData.category || selectedCategory || null,
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
          
          {!showProductForm ? (
            <CategorySelector
              existingCategories={existingCategories}
              onCategorySelected={handleCategorySelected}
            />
          ) : (
            <AddProductForm
              loading={loading}
              formData={{ ...formData, category: selectedCategory }}
              setFormData={setFormData}
              handleSubmit={handleSubmit}
              uploadMethod={uploadMethod}
              setUploadMethod={setUploadMethod}
              selectedFile={selectedFile}
              previewUrl={previewUrl}
              handleFileSelect={handleFileSelect}
            />
          )}
        </Card>
      </div>
    </div>
  );
};

export default AddProduct;
