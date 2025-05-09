
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { TabsContent } from "@/components/ui/tabs";
import { Product } from "@/types/product";
import { CategoryImage } from "@/types/categoryImage";
import { uploadImage } from "@/utils/storageHelpers";
import CategorySelector from "@/components/products/add/CategorySelector";
import ProductDetailsForm from "@/components/products/add/ProductDetailsForm";

interface ProductFormContainerProps {
  activeTab: "category" | "product";
  onContinueToProduct: () => void;
}

const ProductFormContainer = ({ activeTab, onContinueToProduct }: ProductFormContainerProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  // بيانات التصنيف
  const [selectedCategory, setSelectedCategory] = useState("");
  const [existingCategories, setExistingCategories] = useState<string[]>([]);
  const [categoryImageUrl, setCategoryImageUrl] = useState<string | undefined>();
  
  // بيانات المنتج
  const [productData, setProductData] = useState<Partial<Product>>({
    name: "",
    description: "",
    price: 0,
    image_url: "",
    category: "",
    is_new: false,
    is_popular: false,
  });
  
  // خيارات تحميل الصور
  const [uploadMethod, setUploadMethod] = useState<"url" | "file">("file");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // معالجة اختيار التصنيف
  const handleCategorySelected = async (category: string, imageUrl?: string) => {
    setSelectedCategory(category);
    console.log(`تم اختيار التصنيف: ${category}، صورة التصنيف: ${imageUrl || 'لا توجد'}`);
    
    if (imageUrl) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("يجب تسجيل الدخول أولاً");
        
        console.log(`بدء عملية تحميل صورة التصنيف ${category}`);
        
        // تحميل صورة التصنيف إذا كانت موجودة
        if ((imageUrl.startsWith("blob:") || imageUrl.startsWith("data:")) && selectedFile) {
          console.log(`تحميل صورة التصنيف ${category} كملف`);
          
          // رفع الصورة إلى مجلد category-images
          const finalImageUrl = await uploadImage("category-images", selectedFile, user.id, category);
          
          console.log(`تم رفع صورة التصنيف بنجاح: ${finalImageUrl}`);
          
          // حفظ صورة التصنيف في قاعدة البيانات
          const { error } = await supabase.from("category_images").upsert({
            user_id: user.id,
            category: category,
            image_url: finalImageUrl
          }, {
            onConflict: 'user_id,category'
          });
          
          if (error) {
            throw error;
          }
          
          console.log(`تم حفظ رابط صورة التصنيف ${category} في قاعدة البيانات`);
          setCategoryImageUrl(finalImageUrl);
        } else if (imageUrl) {
          console.log(`استخدام رابط الصورة مباشرة للتصنيف ${category}: ${imageUrl}`);
          // استخدام الرابط مباشرة
          const { error } = await supabase.from("category_images").upsert({
            user_id: user.id,
            category: category,
            image_url: imageUrl
          }, {
            onConflict: 'user_id,category'
          });
          
          if (error) {
            console.error("خطأ في حفظ رابط صورة التصنيف:", error);
            throw error;
          }
          
          setCategoryImageUrl(imageUrl);
        }
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
    
    // تحديث بيانات المنتج بالتصنيف المختار
    setProductData(prev => ({ ...prev, category }));
    onContinueToProduct();
  };

  // معالجة إرسال النموذج
  const handleSubmit = async (data: Partial<Product>) => {
    setLoading(true);

    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        throw new Error("يجب تسجيل الدخول أولاً");
      }

      let finalImageUrl = data.image_url;
      
      // تحميل صورة المنتج إذا تم اختيار ملف
      if (uploadMethod === "file" && selectedFile) {
        finalImageUrl = await uploadImage("product-images", selectedFile, userData.user.id, "products");
      }

      const { error } = await supabase.from("products").insert({
        user_id: userData.user.id,
        name: data.name,
        description: data.description || null,
        price: typeof data.price === 'number' ? data.price : parseFloat(data.price as string) || 0,
        image_url: finalImageUrl || null,
        category: data.category || selectedCategory || null,
        is_new: data.is_new || false,
        is_popular: data.is_popular || false,
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
    <>
      <TabsContent value="category" className="mt-0">
        <CategorySelector
          onCategorySelected={handleCategorySelected}
          existingCategories={existingCategories}
          setExistingCategories={setExistingCategories}
        />
      </TabsContent>
      
      <TabsContent value="product" className="mt-0">
        <ProductDetailsForm
          productData={productData}
          setProductData={setProductData}
          uploadMethod={uploadMethod}
          setUploadMethod={setUploadMethod}
          selectedFile={selectedFile}
          setSelectedFile={setSelectedFile}
          previewUrl={previewUrl}
          setPreviewUrl={setPreviewUrl}
          loading={loading}
          onSubmit={handleSubmit}
          selectedCategory={selectedCategory}
        />
      </TabsContent>
    </>
  );
};

export default ProductFormContainer;
