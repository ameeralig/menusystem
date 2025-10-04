
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
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
  const [storeOwnerId, setStoreOwnerId] = useState<string | null>(null);
  
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

  // دالة للحصول على store_owner_id (سواء كان مالك أو موظف)
  const getStoreOwnerId = async (): Promise<string | null> => {
    if (storeOwnerId) return storeOwnerId;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      // التحقق إذا كان المستخدم موظف
      const { data: employeeData } = await supabase
        .from('employees')
        .select('store_owner_id')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .maybeSingle();

      const ownerId = employeeData?.store_owner_id || user.id;
      setStoreOwnerId(ownerId);
      return ownerId;
    } catch (error) {
      console.error("Error getting store owner id:", error);
      return null;
    }
  };

  // معالجة اختيار التصنيف
  const handleCategorySelected = async (category: string, imageUrl?: string, selectedFile?: File | null) => {
    setSelectedCategory(category);
    console.log(`تم اختيار التصنيف: ${category}، صورة التصنيف: ${imageUrl || 'لا توجد'}`);
    
    try {
      const ownerId = await getStoreOwnerId();
      if (!ownerId) throw new Error("يجب تسجيل الدخول أولاً");
      
      console.log(`بدء عملية تعامل مع صورة التصنيف ${category}`);
      
      // تحميل صورة التصنيف إذا كانت موجودة
      if (imageUrl) {
        let finalImageUrl = imageUrl;
        
        // إذا كان الملف محلي، نقوم برفعه إلى التخزين
        if ((imageUrl.startsWith("blob:") || imageUrl.startsWith("data:")) && selectedFile) {
          console.log(`تحميل صورة التصنيف ${category} كملف محلي`);
          
          // التأكد من اسم ملف آمن (إزالة المسافات والأحرف الخاصة)
          const safeFileName = selectedFile.name
            .toLowerCase()
            .replace(/[^a-z0-9.]/g, '-')
            .replace(/--+/g, '-');
          
          // إنشاء مسار فريد للملف
          const timestamp = new Date().getTime();
          const uniqueFilePath = `${category.replace(/\s+/g, '-')}-${timestamp}-${safeFileName}`;
          
          // رفع الصورة إلى مجلد category-images
          finalImageUrl = await uploadImage("category-images", selectedFile, ownerId, uniqueFilePath);
          
          console.log(`تم رفع صورة التصنيف بنجاح: ${finalImageUrl}`);
        }
        
        // حفظ صورة التصنيف في قاعدة البيانات
        const { data, error } = await supabase.from("category_images").upsert({
          user_id: ownerId,
          category: category,
          image_url: finalImageUrl
        }, {
          onConflict: 'user_id,category'
        }).select("*");
        
        if (error) {
          throw error;
        }
        
        console.log(`تم حفظ صورة التصنيف ${category} في قاعدة البيانات`);
        
        if (data && data[0]) {
          // إضافة طابع زمني للصورة لتجنب مشكلات التخزين المؤقت
          const timestamp = new Date().getTime();
          const baseUrl = data[0].image_url.split('?')[0];
          const updatedUrl = `${baseUrl}?t=${timestamp}`;
          
          setCategoryImageUrl(updatedUrl);
        }
      }
    } catch (error: any) {
      console.error("Error handling category image:", error);
      toast({
        variant: "destructive",
        title: "خطأ في معالجة صورة التصنيف",
        description: error.message
      });
    }
    
    // تحديث بيانات المنتج بالتصنيف المختار
    setProductData(prev => ({ ...prev, category }));
    onContinueToProduct();
  };

  // معالجة إرسال النموذج
  const handleSubmit = async (data: Partial<Product>) => {
    setLoading(true);

    try {
      const ownerId = await getStoreOwnerId();
      if (!ownerId) {
        throw new Error("يجب تسجيل الدخول أولاً");
      }

      let finalImageUrl = data.image_url;
      
      // تحميل صورة المنتج إذا تم اختيار ملف
      if (uploadMethod === "file" && selectedFile) {
        // التأكد من اسم ملف آمن
        const safeFileName = selectedFile.name
          .toLowerCase()
          .replace(/[^a-z0-9.]/g, '-')
          .replace(/--+/g, '-');
          
        // إنشاء مسار فريد للملف
        const timestamp = new Date().getTime();
        const uniqueFilePath = `${data.name?.replace(/\s+/g, '-')}-${timestamp}-${safeFileName}`;
        
        finalImageUrl = await uploadImage("product-images", selectedFile, ownerId, uniqueFilePath);
      }

      const { error } = await supabase.from("products").insert({
        user_id: ownerId,
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
