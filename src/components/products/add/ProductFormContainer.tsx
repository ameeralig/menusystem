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
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [bannerUrl, setBannerUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // معالجة اختيار التصنيف
  const handleCategorySelected = async (category: string, imageUrl?: string, selectedFile?: File | null) => {
    setSelectedCategory(category);
    console.log(`تم اختيار التصنيف: ${category}، صورة التصنيف: ${imageUrl || 'لا توجد'}`);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("يجب تسجيل الدخول أولاً");
      
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
          finalImageUrl = await uploadImage("category-images", selectedFile, user.id, uniqueFilePath);
          
          console.log(`تم رفع صورة التصنيف بنجاح: ${finalImageUrl}`);
        }
        
        // حفظ صورة التصنيف في قاعدة البيانات
        const { data, error } = await supabase.from("category_images").upsert({
          user_id: user.id,
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
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
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
        
        finalImageUrl = await uploadImage("product-images", selectedFile, userData.user.id, uniqueFilePath);
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

  const handleImageUpload = async (file: File) => {
    try {
      setError(null);
      
      if (!file.type.startsWith('image/')) {
        setError("الرجاء اختيار ملف صورة صالح");
        return;
      }

      const MAX_SIZE = 10 * 1024 * 1024;
      if (file.size > MAX_SIZE) {
        setError("حجم الصورة كبير جداً. الحد الأقصى هو 10 ميجابايت");
        return;
      }

      // إنشاء عنوان URL مؤقت للمعاينة قبل الرفع
      const tempPreviewUrl = URL.createObjectURL(file);
      setPreviewUrl(tempPreviewUrl);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("يجب تسجيل الدخول أولاً");

      const filePath = createUniqueFilePath(user.id, 'banners', file);
      
      // تحسين إعدادات التخزين المؤقت للصورة المرفوعة
      const { data, error: uploadError } = await supabase.storage
        .from('banners')
        .upload(filePath, file, {
          cacheControl: 'public, max-age=31536000, immutable', // تخزين مؤقت لمدة سنة
          upsert: true,
          contentType: file.type
        });

      if (uploadError) throw uploadError;

      // الحصول على رابط العام
      const { data: { publicUrl } } = supabase.storage
        .from('banners')
        .getPublicUrl(filePath);
      
      // تحرير عنوان URL المؤقت
      URL.revokeObjectURL(tempPreviewUrl);
      
      // تحسين الرابط باستخدام أداة التحسين
      const optimizedUrl = optimizeImageUrl(publicUrl, {
        format: 'webp',
        quality: 90,
        bustCache: true,
        isImportant: true
      });
      
      // تحميل مسبق للصورة لتسريع العرض
      const preloadImg = new Image();
      preloadImg.src = optimizedUrl || publicUrl;
      preloadImg.fetchPriority = "high";
      
      setImageUrl(optimizedUrl || publicUrl);
      setPreviewUrl(optimizedUrl || publicUrl);
      setBannerUrl(optimizedUrl || publicUrl);

      toast({
        title: "تم رفع الصورة بنجاح",
        description: "يمكنك الآن حفظ التغييرات",
        duration: 3000,
      });

    } catch (error: any) {
      console.error("Error uploading image:", error);
      setError(error.message || "حدث خطأ أثناء رفع الصورة");
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
          handleImageUpload={handleImageUpload}
          imageUrl={imageUrl}
          bannerUrl={bannerUrl}
          error={error}
        />
      </TabsContent>
    </>
  );
};

export default ProductFormContainer;
