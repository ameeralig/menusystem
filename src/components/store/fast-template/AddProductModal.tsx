import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CategorySelectionStep } from "./CategorySelectionStep";
import { ProductDetailsStep, ProductFormData } from "./ProductDetailsStep";
import { uploadImage, optimizeImage } from "@/utils/storageHelpers";
import { logUserActivity } from "@/hooks/analytics/useActivityLogger";

interface AddProductModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onProductAdded?: () => void;
}

const AddProductModal = ({ isOpen, onOpenChange, onProductAdded }: AddProductModalProps) => {
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [categories, setCategories] = useState<string[]>([]);
  
  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    description: "",
    price: "",
    image_url: "",
    category: "",
    is_new: false,
    is_popular: false,
    discount_percentage: "",
  });

  // State for image upload (shared with ProductDetailsStep)
  const [imageUploadState, setImageUploadState] = useState({
    uploadMethod: "url" as "url" | "file",
    selectedFile: null as File | null,
    previewUrl: null as string | null,
  });

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

  const handleSubmit = async () => {
    if (!formData.name || !formData.price) {
      toast.error("يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("يجب تسجيل الدخول أولاً");
        return;
      }

      let imageUrl = formData.image_url;

      if (imageUploadState.uploadMethod === "file" && imageUploadState.selectedFile) {
        try {
          toast.info("جاري رفع الصورة...");
          
          // تحسين الصورة قبل الرفع
          const optimizedFile = await optimizeImage(imageUploadState.selectedFile);
          
          // استخدام دالة uploadImage المحسنة
          imageUrl = await uploadImage("product-images", optimizedFile, user.id, "");
          
          if (!imageUrl) {
            throw new Error("فشل في الحصول على رابط الصورة");
          }
          
          console.log("تم رفع الصورة بنجاح:", imageUrl);
        } catch (uploadError: any) {
          console.error("خطأ في رفع الصورة:", uploadError);
          toast.error("فشل في رفع الصورة: " + (uploadError.message || "خطأ غير معروف"));
          setLoading(false);
          return;
        }
      }

      const discountValue = formData.discount_percentage ? parseFloat(formData.discount_percentage) : 0;
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
          discount_percentage: discountValue >= 0 && discountValue <= 100 ? discountValue : 0,
        },
      ]);

      if (error) throw error;

      // تسجيل النشاط
      logUserActivity('product_add', 'products', { 
        name: formData.name,
        category: formData.category 
      });

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
        discount_percentage: "",
      });
      setImageUploadState({
        uploadMethod: "url",
        selectedFile: null,
        previewUrl: null,
      });
      setCurrentStep(1);
      
      onProductAdded?.();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error adding product:", error);
      toast.error(error.message || "حدث خطأ أثناء إضافة المنتج");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      image_url: "",
      category: "",
      is_new: false,
      is_popular: false,
      discount_percentage: "",
    });
    setImageUploadState({
      uploadMethod: "url",
      selectedFile: null,
      previewUrl: null,
    });
    setCurrentStep(1);
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      resetForm();
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
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

        <div className="mt-4">
          {currentStep === 1 ? (
            <CategorySelectionStep
              categories={categories}
              selectedCategory={formData.category}
              onCategorySelect={(category) => setFormData({ ...formData, category })}
              onNext={() => setCurrentStep(2)}
              onCategoriesUpdate={setCategories}
            />
          ) : (
            <ProductDetailsStep
              formData={formData}
              onFormDataChange={setFormData}
              onBack={() => setCurrentStep(1)}
              onSubmit={handleSubmit}
              loading={loading}
              imageUploadState={imageUploadState}
              onImageUploadStateChange={setImageUploadState}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddProductModal;
