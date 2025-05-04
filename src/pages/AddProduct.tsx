
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ImagePlus, Link as LinkIcon, Star, TrendingUp, Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { uploadImage, urlToFile } from "@/utils/storageHelpers";
import { useIsMobile } from "@/hooks/use-mobile";
import ProductWizard, { MobileProductWizard } from "@/components/products/ProductWizard";
import ImageFitEditor, { ImageFitType } from "@/components/products/ImageFitEditor";
import ProductPreviewCard from "@/components/products/ProductPreviewCard";

// مكون خطوة اختيار التصنيف
const CategorySelectionStep = ({
  existingCategories,
  selectedCategory,
  setSelectedCategory,
  newCategory,
  setNewCategory,
  categoryImageUrl,
  setCategoryImageUrl,
  uploadMethod,
  setUploadMethod,
  handleFileSelect,
  selectedFile,
  previewUrl,
  setPreviewUrl,
  handleCategoryImageComplete
}) => {
  const [selectionType, setSelectionType] = useState<"existing" | "new">(
    existingCategories.length > 0 ? "existing" : "new"
  );

  return (
    <div className="space-y-6">
      {existingCategories.length > 0 && (
        <div className="flex gap-4 mb-4">
          <button
            type="button"
            onClick={() => setSelectionType("existing")}
            className={cn(
              "flex-1 py-2 px-4 text-center rounded-md transition-colors",
              selectionType === "existing"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            )}
          >
            استخدام تصنيف موجود
          </button>
          <button
            type="button"
            onClick={() => setSelectionType("new")}
            className={cn(
              "flex-1 py-2 px-4 text-center rounded-md transition-colors",
              selectionType === "new"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            )}
          >
            إنشاء تصنيف جديد
          </button>
        </div>
      )}

      {selectionType === "existing" && existingCategories.length > 0 ? (
        <div className="space-y-4">
          <Label>اختر التصنيف</Label>
          <div className="grid grid-cols-2 gap-4">
            {existingCategories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setSelectedCategory(category)}
                className={cn(
                  "p-3 border rounded-md text-center transition-all",
                  selectedCategory === category
                    ? "border-primary bg-primary/10"
                    : "border-muted-foreground/20 hover:border-primary/20"
                )}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="categoryName">اسم التصنيف الجديد</Label>
            <Input
              id="categoryName"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="أدخل اسم التصنيف"
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label>صورة التصنيف (اختيارية)</Label>
            <div className="flex gap-4 mb-4">
              <button
                type="button"
                onClick={() => setUploadMethod("file")}
                className={cn(
                  "flex-1 py-2 px-4 text-center rounded-md transition-colors flex items-center justify-center gap-2",
                  uploadMethod === "file"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                )}
              >
                <Upload className="w-4 h-4" />
                رفع صورة
              </button>
              <button
                type="button"
                onClick={() => setUploadMethod("url")}
                className={cn(
                  "flex-1 py-2 px-4 text-center rounded-md transition-colors flex items-center justify-center gap-2",
                  uploadMethod === "url"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                )}
              >
                <LinkIcon className="w-4 h-4" />
                رابط صورة
              </button>
            </div>

            {uploadMethod === "url" ? (
              <Input
                type="url"
                value={categoryImageUrl || ""}
                onChange={(e) => setCategoryImageUrl(e.target.value)}
                placeholder="أدخل رابط الصورة"
                className="w-full"
              />
            ) : (
              <div>
                <div 
                  onClick={() => document.getElementById('category-file-upload')?.click()}
                  className={cn(
                    "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary transition-colors",
                    previewUrl ? "border-primary/40" : "border-muted-foreground/25"
                  )}
                >
                  {previewUrl ? (
                    <ImageFitEditor 
                      imageUrl={previewUrl}
                      aspectRatio="4/3"
                      onComplete={handleCategoryImageComplete} 
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-2 py-4">
                      <ImagePlus className="h-12 w-12 text-muted-foreground" />
                      <p className="text-muted-foreground">اضغط هنا لاختيار صورة</p>
                    </div>
                  )}
                </div>
                <input
                  id="category-file-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// مكون خطوة تفاصيل المنتج
const ProductDetailsStep = ({ formData, setFormData }) => {
  return (
    <div className="space-y-4">
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

      <div className="space-y-2">
        <Label>خصائص المنتج</Label>
        <div className="flex flex-col space-y-4 mt-2">
          <div className="flex items-center justify-between space-x-4 rtl:space-x-reverse border p-3 rounded-lg">
            <Label htmlFor="is_new" className="flex items-center gap-2 cursor-pointer">
              <Star className="h-4 w-4 text-yellow-500" />
              منتج جديد
            </Label>
            <Switch
              id="is_new"
              checked={formData.is_new}
              onCheckedChange={(checked) => setFormData({ ...formData, is_new: checked })}
            />
          </div>
          
          <div className="flex items-center justify-between space-x-4 rtl:space-x-reverse border p-3 rounded-lg">
            <Label htmlFor="is_popular" className="flex items-center gap-2 cursor-pointer">
              <TrendingUp className="h-4 w-4 text-red-500" />
              الأكثر طلباً
            </Label>
            <Switch
              id="is_popular"
              checked={formData.is_popular}
              onCheckedChange={(checked) => setFormData({ ...formData, is_popular: checked })}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// مكون خطوة صورة المنتج
const ProductImageStep = ({
  productImageUrl, 
  setProductImageUrl,
  uploadMethod,
  setUploadMethod,
  handleProductFileSelect,
  productPreviewUrl,
  handleProductImageComplete
}) => {
  return (
    <div className="space-y-4">
      <div className="flex gap-4 mb-4">
        <button
          type="button"
          onClick={() => setUploadMethod("file")}
          className={cn(
            "flex-1 py-2 px-4 text-center rounded-md transition-colors flex items-center justify-center gap-2",
            uploadMethod === "file"
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground"
          )}
        >
          <Upload className="w-4 h-4" />
          رفع صورة
        </button>
        <button
          type="button"
          onClick={() => setUploadMethod("url")}
          className={cn(
            "flex-1 py-2 px-4 text-center rounded-md transition-colors flex items-center justify-center gap-2",
            uploadMethod === "url"
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground"
          )}
        >
          <LinkIcon className="w-4 h-4" />
          رابط صورة
        </button>
      </div>

      {uploadMethod === "url" ? (
        <div className="space-y-4">
          <Input
            type="url"
            value={productImageUrl || ""}
            onChange={(e) => setProductImageUrl(e.target.value)}
            placeholder="أدخل رابط صورة المنتج"
            className="w-full"
          />
          {productImageUrl && (
            <div className="mt-4">
              <ImageFitEditor 
                imageUrl={productImageUrl}
                onComplete={handleProductImageComplete} 
              />
            </div>
          )}
        </div>
      ) : (
        <div>
          <div 
            onClick={() => document.getElementById('product-file-upload')?.click()}
            className={cn(
              "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary transition-colors",
              productPreviewUrl ? "border-primary/40" : "border-muted-foreground/25"
            )}
          >
            {productPreviewUrl ? (
              <ImageFitEditor 
                imageUrl={productPreviewUrl}
                onComplete={handleProductImageComplete} 
              />
            ) : (
              <div className="flex flex-col items-center gap-2 py-12">
                <ImagePlus className="h-12 w-12 text-muted-foreground" />
                <p className="text-muted-foreground">اضغط هنا لاختيار صورة للمنتج</p>
              </div>
            )}
          </div>
          <input
            id="product-file-upload"
            type="file"
            accept="image/*"
            onChange={handleProductFileSelect}
            className="hidden"
          />
        </div>
      )}
    </div>
  );
};

// مكون خطوة المعاينة
const ProductReviewStep = ({ formData }) => {
  return (
    <div className="space-y-4">
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold">معاينة المنتج</h3>
        <p className="text-sm text-muted-foreground">هذه معاينة لشكل المنتج في المتجر</p>
      </div>

      <div className="flex justify-center">
        <div className="w-full max-w-xs">
          <ProductPreviewCard product={formData} />
        </div>
      </div>

      <div className="p-4 border rounded-lg mt-6">
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="font-medium">اسم المنتج:</span>
            <span>{formData.name}</span>
          </div>

          {formData.description && (
            <div className="flex justify-between">
              <span className="font-medium">الوصف:</span>
              <span className="text-left max-w-[60%]">{formData.description}</span>
            </div>
          )}

          <div className="flex justify-between">
            <span className="font-medium">السعر:</span>
            <span>{parseFloat(formData.price).toLocaleString("ar-IQ")} د.ع</span>
          </div>

          <div className="flex justify-between">
            <span className="font-medium">التصنيف:</span>
            <span>{formData.category || "بدون تصنيف"}</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center gap-1">
              <span className="font-medium">منتج جديد:</span>
              <span>{formData.is_new ? "نعم" : "لا"}</span>
            </div>
            
            <div className="flex items-center gap-1">
              <span className="font-medium">الأكثر طلباً:</span>
              <span>{formData.is_popular ? "نعم" : "لا"}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const AddProduct = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  
  // بيانات التصنيف
  const [selectedCategory, setSelectedCategory] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [categoryImageUrl, setCategoryImageUrl] = useState<string | undefined>();
  const [existingCategories, setExistingCategories] = useState<string[]>([]);
  
  // طريقة الرفع
  const [uploadMethod, setUploadMethod] = useState<"url" | "file">("file");
  
  // صورة التصنيف
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [adjustedCategoryImage, setAdjustedCategoryImage] = useState<{
    url: string;
    fitStyle: ImageFitType;
    zoom: number;
    position: { x: number; y: number };
  } | null>(null);
  
  // صورة المنتج
  const [productSelectedFile, setProductSelectedFile] = useState<File | null>(null);
  const [productPreviewUrl, setProductPreviewUrl] = useState<string | null>(null);
  const [adjustedProductImage, setAdjustedProductImage] = useState<{
    url: string;
    fitStyle: ImageFitType;
    zoom: number;
    position: { x: number; y: number };
  } | null>(null);
  
  // بيانات المنتج
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    image_url: "",
    category: "",
    is_new: false,
    is_popular: false,
  });

  // جلب التصنيفات
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

  // تحديث التصنيف في formData عند التغيير
  useEffect(() => {
    if (selectedCategory) {
      setFormData(prev => ({ ...prev, category: selectedCategory }));
    } else if (newCategory) {
      setFormData(prev => ({ ...prev, category: newCategory }));
    }
  }, [selectedCategory, newCategory]);

  // معالجة اختيار الملف للتصنيف
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // التحقق من حجم الملف (الحد الأقصى 5 ميجابايت)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          variant: "destructive",
          title: "الملف كبير جداً",
          description: "الحد الأقصى لحجم الملف هو 5 ميجابايت"
        });
        return;
      }
      
      // التحقق من نوع الملف
      if (!file.type.startsWith("image/")) {
        toast({
          variant: "destructive",
          title: "نوع ملف غير صالح",
          description: "الرجاء اختيار ملف صورة"
        });
        return;
      }
      
      setSelectedFile(file);
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
    }
  };

  // معالجة اختيار الملف للمنتج
  const handleProductFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // التحقق من حجم الملف (الحد الأقصى 5 ميجابايت)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          variant: "destructive",
          title: "الملف كبير جداً",
          description: "الحد الأقصى لحجم الملف هو 5 ميجابايت"
        });
        return;
      }
      
      // التحقق من نوع الملف
      if (!file.type.startsWith("image/")) {
        toast({
          variant: "destructive",
          title: "نوع ملف غير صالح",
          description: "الرجاء اختيار ملف صورة"
        });
        return;
      }
      
      setProductSelectedFile(file);
      const objectUrl = URL.createObjectURL(file);
      setProductPreviewUrl(objectUrl);
    }
  };

  // معالجة الانتهاء من ضبط صورة التصنيف
  const handleCategoryImageComplete = (adjustedData) => {
    setAdjustedCategoryImage(adjustedData);
    // هنا يمكن إضافة أي إجراءات إضافية عند الانتهاء من ضبط صورة التصنيف
  };

  // معالجة الانتهاء من ضبط صورة المنتج
  const handleProductImageComplete = (adjustedData) => {
    setAdjustedProductImage(adjustedData);
    setFormData(prev => ({ ...prev, image_url: adjustedData.url }));
    // هنا يمكن إضافة أي إجراءات إضافية عند الانتهاء من ضبط صورة المنتج
  };

  // تحديد الخطوات
  const steps = [
    {
      id: "category",
      title: "التصنيف",
      isCompleted: selectedCategory !== "" || newCategory !== "",
      isActive: currentStep === 0,
      component: (
        <CategorySelectionStep
          existingCategories={existingCategories}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          newCategory={newCategory}
          setNewCategory={setNewCategory}
          categoryImageUrl={categoryImageUrl}
          setCategoryImageUrl={setCategoryImageUrl}
          uploadMethod={uploadMethod}
          setUploadMethod={setUploadMethod}
          handleFileSelect={handleFileSelect}
          selectedFile={selectedFile}
          previewUrl={previewUrl}
          setPreviewUrl={setPreviewUrl}
          handleCategoryImageComplete={handleCategoryImageComplete}
        />
      ),
    },
    {
      id: "details",
      title: "التفاصيل",
      isCompleted: formData.name !== "" && formData.price !== "",
      isActive: currentStep === 1,
      component: <ProductDetailsStep formData={formData} setFormData={setFormData} />,
    },
    {
      id: "image",
      title: "الصورة",
      isCompleted: formData.image_url !== "" || productPreviewUrl !== null,
      isActive: currentStep === 2,
      component: (
        <ProductImageStep
          productImageUrl={formData.image_url}
          setProductImageUrl={(url) => setFormData({ ...formData, image_url: url })}
          uploadMethod={uploadMethod}
          setUploadMethod={setUploadMethod}
          handleProductFileSelect={handleProductFileSelect}
          productPreviewUrl={productPreviewUrl}
          handleProductImageComplete={handleProductImageComplete}
        />
      ),
    },
    {
      id: "review",
      title: "المعاينة",
      isCompleted: false,
      isActive: currentStep === 3,
      component: <ProductReviewStep formData={formData} />,
    },
  ];

  // حفظ المنتج
  const handleSubmit = async () => {
    setLoading(true);

    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        throw new Error("يجب تسجيل الدخول أولاً");
      }

      // إذا تم اختيار تصنيف جديد مع صورة، قم برفع الصورة وحفظها
      let finalCategoryImageUrl: string | undefined = undefined;
      
      if (newCategory && (selectedFile || categoryImageUrl)) {
        finalCategoryImageUrl = categoryImageUrl;
        
        if (selectedFile) {
          // رفع صورة التصنيف
          finalCategoryImageUrl = await uploadImage(
            "category-images", 
            selectedFile, 
            userData.user.id, 
            "categories"
          );
          
          // حفظ صورة التصنيف في قاعدة البيانات
          await supabase.from("category_images").insert({
            user_id: userData.user.id,
            category: newCategory,
            image_url: finalCategoryImageUrl
          });
        }
      }
      
      // رفع صورة المنتج
      let finalProductImageUrl = formData.image_url;
      
      if (uploadMethod === "file" && productSelectedFile) {
        finalProductImageUrl = await uploadImage(
          "product-images", 
          productSelectedFile, 
          userData.user.id, 
          "products"
        );
      }

      // حفظ المنتج
      const { error } = await supabase.from("products").insert({
        user_id: userData.user.id,
        name: formData.name,
        description: formData.description || null,
        price: parseFloat(formData.price),
        image_url: finalProductImageUrl || null,
        category: selectedCategory || newCategory || null,
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
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold mb-6">إضافة منتج جديد</h1>
        
        <div className="bg-card rounded-lg shadow-sm overflow-hidden">
          {isMobile ? (
            <MobileProductWizard
              steps={steps}
              currentStep={currentStep}
              onStepChange={setCurrentStep}
              onComplete={handleSubmit}
              isSubmitting={loading}
            />
          ) : (
            <ProductWizard
              steps={steps}
              currentStep={currentStep}
              onStepChange={setCurrentStep}
              onComplete={handleSubmit}
              isSubmitting={loading}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default AddProduct;
