import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import { X, Package } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CategorySelectionStep } from "./CategorySelectionStep";
import { ProductDetailsStep, ProductFormData } from "./ProductDetailsStep";
import { uploadImage, optimizeImage, deleteOldImageIfExists } from "@/utils/storageHelpers";
import { logUserActivity } from "@/hooks/analytics/useActivityLogger";

interface AddProductModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onProductAdded?: () => void;
  colorTheme?: string | null;
}

const AddProductModal = ({ isOpen, onOpenChange, onProductAdded, colorTheme }: AddProductModalProps) => {
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
    original_price: "",
    discount_method: "original_price",
  });

  // State for image upload (shared with ProductDetailsStep)
  const [imageUploadState, setImageUploadState] = useState({
    uploadMethod: "url" as "url" | "file" | "repository",
    selectedFile: null as File | null,
    previewUrl: null as string | null,
  });

  // الحصول على لون الثيم
  const getThemeColor = () => {
    if (colorTheme?.startsWith('#')) {
      return colorTheme;
    }
    
    const themeColors: { [key: string]: string } = {
      coral: '#fb923c',
      purple: '#a855f7',
      blue: '#3b82f6',
      green: '#22c55e',
      red: '#ef4444',
    };
    
    return themeColors[colorTheme || ''] || '#3b82f6';
  };

  const themeColor = getThemeColor();

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

      // رفع صورة جديدة أو استخدام رابط المستودع
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

      const discountValue = formData.discount_method === 'percentage' && formData.discount_percentage 
        ? parseFloat(formData.discount_percentage) 
        : 0;
      const originalPriceValue = formData.discount_method === 'original_price' && formData.original_price 
        ? parseFloat(formData.original_price) 
        : null;
      
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
          original_price: originalPriceValue,
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
      resetForm();
      
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
      original_price: "",
      discount_method: "original_price",
    });
    setImageUploadState({
      uploadMethod: "url",
      selectedFile: null,
      previewUrl: null,
    });
    setCurrentStep(1);
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  if (!isOpen) return null;

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* الخلفية الضبابية */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 z-50 backdrop-blur-md bg-black/40"
          />

          {/* البطاقة العائمة */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none overflow-y-auto"
          >
            <div className="pointer-events-auto w-full max-w-lg my-8">
              {/* زر الإغلاق */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleClose}
                className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/20 backdrop-blur-lg border border-white/30 flex items-center justify-center text-white shadow-lg"
              >
                <X className="w-5 h-5" />
              </motion.button>

              {/* البطاقة الزجاجية */}
              <div 
                className="rounded-3xl overflow-hidden shadow-2xl border border-white/20"
                style={{
                  background: `linear-gradient(135deg, ${themeColor}ee, ${themeColor}cc)`,
                  backdropFilter: 'blur(20px)',
                }}
              >
                {/* تأثير الإضاءة العلوي */}
                <div 
                  className="absolute top-0 left-0 right-0 h-32 opacity-30 pointer-events-none"
                  style={{
                    background: 'linear-gradient(180deg, rgba(255,255,255,0.4) 0%, transparent 100%)',
                  }}
                />

                {/* رأس البطاقة */}
                <div className="relative p-6 text-center text-white border-b border-white/20">
                  {/* أيقونة */}
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.1, type: "spring" }}
                    className="mx-auto mb-4 w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-lg border border-white/30 flex items-center justify-center shadow-lg"
                  >
                    <Package className="w-8 h-8 text-white" />
                  </motion.div>

                  {/* العنوان */}
                  <motion.h2 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="text-2xl font-bold drop-shadow-lg"
                  >
                    إضافة منتج جديد
                  </motion.h2>

                  {/* مؤشر الخطوات */}
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="flex items-center justify-center gap-2 mt-4"
                  >
                    <div className={cn(
                      "flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm transition-all",
                      currentStep >= 1 
                        ? "bg-white text-primary shadow-lg" 
                        : "bg-white/30 text-white/70"
                    )}>
                      1
                    </div>
                    <div className={cn(
                      "h-1 w-12 rounded transition-all",
                      currentStep >= 2 ? "bg-white" : "bg-white/30"
                    )} />
                    <div className={cn(
                      "flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm transition-all",
                      currentStep >= 2 
                        ? "bg-white text-primary shadow-lg" 
                        : "bg-white/30 text-white/70"
                    )}>
                      2
                    </div>
                  </motion.div>
                </div>

                {/* محتوى النموذج */}
                <div className="relative p-6 bg-white dark:bg-gray-900 max-h-[60vh] overflow-y-auto">
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
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
};

export default AddProductModal;
