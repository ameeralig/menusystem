import React, { useState, useEffect } from "react";
import { Product } from "@/types/product";
import { X, Upload, Loader2, Percent } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { optimizeImageUrl } from "@/utils/imageOptimizer";
import { uploadImage, optimizeImage } from "@/utils/storageHelpers";
import { logUserActivity } from "@/hooks/analytics/useActivityLogger";

interface EditProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
}

const EditProductModal: React.FC<EditProductModalProps> = ({
  product,
  isOpen,
  onClose,
  onSaved,
}) => {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [isNew, setIsNew] = useState(false);
  const [isPopular, setIsPopular] = useState(false);
  const [isAvailable, setIsAvailable] = useState(true);
  const [discountPercentage, setDiscountPercentage] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");
  const [discountMethod, setDiscountMethod] = useState<'percentage' | 'original_price'>('original_price');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  // Progressive Loading للصورة الموجودة
  const [displayedImage, setDisplayedImage] = useState<string>("");
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    if (product && isOpen) {
      setName(product.name);
      setPrice(product.price.toString());
      setDescription(product.description || "");
      setCategory(product.category || "");
      setIsNew(product.is_new || false);
      setIsPopular(product.is_popular || false);
      setIsAvailable(product.is_available !== false);
      setDiscountPercentage(product.discount_percentage?.toString() || "");
      setOriginalPrice(product.original_price?.toString() || "");
      // تحديد طريقة الخصم بناءً على البيانات الموجودة
      if (product.original_price && product.original_price > product.price) {
        setDiscountMethod('original_price');
      } else if (product.discount_percentage && product.discount_percentage > 0) {
        setDiscountMethod('percentage');
      } else {
        setDiscountMethod('original_price');
      }
      setImagePreview(product.image_url || null);
      setImageFile(null);
      
      // Progressive Loading للصورة
      if (product.image_url) {
        const thumbnailUrl = optimizeImageUrl(product.image_url, 'thumbnail');
        setDisplayedImage(thumbnailUrl);
        setImageLoaded(false);

        const mediumImg = new Image();
        mediumImg.src = optimizeImageUrl(product.image_url, 'medium');
        
        mediumImg.onload = () => {
          setDisplayedImage(mediumImg.src);
          setImageLoaded(true);
        };

        mediumImg.onerror = () => {
          setImageLoaded(true);
        };
      }
    }
  }, [product, isOpen]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error("حجم الصورة كبير جداً. الحد الأقصى 10 ميجابايت");
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!product) return;
    
    if (!name.trim()) {
      toast.error("يرجى إدخال اسم المنتج");
      return;
    }

    if (!price || parseFloat(price) <= 0) {
      toast.error("يرجى إدخال سعر صحيح");
      return;
    }

    setIsSaving(true);

    try {
      let imageUrl = product.image_url;

      // رفع الصورة الجديدة إذا تم اختيارها
      if (imageFile) {
        try {
          toast.info("جاري رفع الصورة...");
          
          // تحسين الصورة قبل الرفع
          const optimizedFile = await optimizeImage(imageFile);
          
          // استخدام دالة uploadImage المحسنة
          imageUrl = await uploadImage("product-images", optimizedFile, product.user_id, "");

          if (!imageUrl) {
            throw new Error("فشل في الحصول على رابط الصورة");
          }

          console.log("تم رفع الصورة بنجاح:", imageUrl);

          // حذف الصورة القديمة إذا كانت موجودة
          if (product.image_url) {
            try {
              const oldFileName = product.image_url.split('/').pop()?.split('?')[0];
              if (oldFileName) {
                await supabase.storage
                  .from('product-images')
                  .remove([`${product.user_id}/${oldFileName}`]);
              }
            } catch (deleteError) {
              console.warn("لم يتم حذف الصورة القديمة:", deleteError);
            }
          }
        } catch (uploadError: any) {
          console.error("خطأ في رفع الصورة:", uploadError);
          toast.error("فشل في رفع الصورة: " + (uploadError.message || "خطأ غير معروف"));
          setIsSaving(false);
          return;
        }
      }

      // تحديث بيانات المنتج
      const discountValue = discountMethod === 'percentage' && discountPercentage 
        ? parseFloat(discountPercentage) 
        : 0;
      const originalPriceValue = discountMethod === 'original_price' && originalPrice 
        ? parseFloat(originalPrice) 
        : null;
      
      const { error: updateError } = await supabase
        .from('products')
        .update({
          name: name.trim(),
          price: parseFloat(price),
          description: description.trim() || null,
          category: category.trim() || null,
          is_new: isNew,
          is_popular: isPopular,
          is_available: isAvailable,
          discount_percentage: discountValue >= 0 && discountValue <= 100 ? discountValue : 0,
          original_price: originalPriceValue,
          image_url: imageUrl
        })
        .eq('id', product.id);

      if (updateError) throw updateError;

      // تسجيل النشاط
      logUserActivity('product_edit', 'products', { 
        product_id: product.id, 
        name: name.trim() 
      });

      toast.success("تم حفظ التعديلات بنجاح");
      onSaved();
      onClose();
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error("حدث خطأ أثناء حفظ التعديلات");
    } finally {
      setIsSaving(false);
    }
  };

  if (!product) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="relative w-full max-w-2xl bg-background dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden pointer-events-auto my-8 border border-border"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={onClose}
                disabled={isSaving}
                className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center bg-muted/90 dark:bg-gray-800/90 rounded-full shadow-lg hover:bg-muted dark:hover:bg-gray-700 transition-all duration-200 hover:scale-110 disabled:opacity-50"
              >
                <X className="w-5 h-5 text-foreground" />
              </button>

              <div className="p-6 max-h-[80vh] overflow-y-auto">
                <h2 className="text-2xl font-bold text-foreground mb-6">
                  تعديل المنتج
                </h2>

                <div className="space-y-6">
                  {/* صورة المنتج */}
                  <div>
                    <Label htmlFor="product-image" className="text-foreground">صورة المنتج</Label>
                    <div className="mt-2 flex flex-col items-center gap-4">
                      {(imagePreview || displayedImage) && (
                        <div className="relative w-full h-48 bg-muted dark:bg-gray-800 rounded-lg overflow-hidden">
                          <img
                            src={imageFile ? imagePreview : displayedImage}
                            alt="معاينة"
                            className={`w-full h-full object-cover transition-all duration-500 ${
                              imageFile || imageLoaded ? 'blur-0 scale-100' : 'blur-sm scale-105'
                            }`}
                            onError={(e) => {
                              e.currentTarget.src = optimizeImageUrl(null, 'medium');
                            }}
                          />
                        </div>
                      )}
                      <label htmlFor="product-image" className="cursor-pointer">
                        <div className="flex items-center gap-2 px-4 py-2 bg-muted dark:bg-gray-800 hover:bg-muted/80 dark:hover:bg-gray-700 rounded-lg transition-colors">
                          <Upload className="w-4 h-4 text-foreground" />
                          <span className="text-sm text-foreground">
                            {imageFile ? "تغيير الصورة" : "اختيار صورة جديدة"}
                          </span>
                        </div>
                      </label>
                      <input
                        id="product-image"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </div>
                  </div>

                  {/* اسم المنتج */}
                  <div>
                    <Label htmlFor="name" className="text-foreground">اسم المنتج *</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="أدخل اسم المنتج"
                      className="mt-2 bg-background text-foreground border-border"
                    />
                  </div>

                  {/* السعر */}
                  <div>
                    <Label htmlFor="price" className="text-foreground">السعر (دينار عراقي) *</Label>
                    <Input
                      id="price"
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="0"
                      min="0"
                      step="0.01"
                      className="mt-2 bg-background text-foreground border-border"
                    />
                  </div>

                  {/* طريقة الخصم */}
                  <div className="space-y-4">
                    <Label className="text-foreground">طريقة الخصم</Label>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant={discountMethod === 'original_price' ? "default" : "outline"}
                        onClick={() => {
                          setDiscountMethod('original_price');
                          setDiscountPercentage('');
                        }}
                        className="flex-1 text-sm"
                        size="sm"
                      >
                        سعر قبل وبعد
                      </Button>
                      <Button
                        type="button"
                        variant={discountMethod === 'percentage' ? "default" : "outline"}
                        onClick={() => {
                          setDiscountMethod('percentage');
                          setOriginalPrice('');
                        }}
                        className="flex-1 text-sm"
                        size="sm"
                      >
                        <Percent className="w-4 h-4 ml-1" />
                        نسبة مئوية
                      </Button>
                    </div>

                    {discountMethod === 'original_price' ? (
                      <div>
                        <Label htmlFor="original_price" className="text-foreground">السعر الأصلي (قبل الخصم)</Label>
                        <Input
                          id="original_price"
                          type="number"
                          value={originalPrice}
                          onChange={(e) => setOriginalPrice(e.target.value)}
                          placeholder="مثال: 5000"
                          min="0"
                          step="0.01"
                          className="mt-2 bg-background text-foreground border-border"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          السعر الحالي ({price || '0'} د.ع) سيكون السعر الجديد بعد الخصم
                        </p>
                      </div>
                    ) : (
                      <div>
                        <Label htmlFor="discount" className="text-foreground">نسبة الخصم (%)</Label>
                        <Input
                          id="discount"
                          type="number"
                          value={discountPercentage}
                          onChange={(e) => setDiscountPercentage(e.target.value)}
                          placeholder="0"
                          min="0"
                          max="100"
                          step="1"
                          className="mt-2 bg-background text-foreground border-border"
                        />
                      </div>
                    )}
                  </div>
                  
                  {/* معاينة السعر بعد الخصم */}
                  {discountMethod === 'original_price' && originalPrice && parseFloat(originalPrice) > parseFloat(price || '0') && (
                    <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                      <p className="text-sm text-green-700 dark:text-green-300">
                        السعر الجديد: <span className="font-bold">{new Intl.NumberFormat('ar-IQ').format(parseFloat(price || '0'))} د.ع</span>
                        <span className="mr-2 text-gray-500 line-through text-xs">{new Intl.NumberFormat('ar-IQ').format(parseFloat(originalPrice))} د.ع</span>
                      </p>
                    </div>
                  )}
                  {discountMethod === 'percentage' && discountPercentage && parseFloat(discountPercentage) > 0 && price && (
                    <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                      <p className="text-sm text-green-700 dark:text-green-300">
                        السعر بعد الخصم: <span className="font-bold">{new Intl.NumberFormat('ar-IQ').format(parseFloat(price) - (parseFloat(price) * parseFloat(discountPercentage) / 100))} د.ع</span>
                        <span className="mr-2 text-gray-500 line-through text-xs">{new Intl.NumberFormat('ar-IQ').format(parseFloat(price))} د.ع</span>
                      </p>
                    </div>
                  )}

                  {/* التصنيف */}
                  <div>
                    <Label htmlFor="category" className="text-foreground">التصنيف</Label>
                    <Input
                      id="category"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      placeholder="أدخل التصنيف"
                      className="mt-2 bg-background text-foreground border-border"
                    />
                  </div>

                  {/* الوصف */}
                  <div>
                    <Label htmlFor="description" className="text-foreground">الوصف</Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="أدخل وصف المنتج"
                      rows={4}
                      className="mt-2 bg-background text-foreground border-border"
                    />
                  </div>

                  {/* الخصائص */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="flex items-center justify-between p-4 bg-muted dark:bg-gray-800 rounded-lg">
                      <Label htmlFor="is-new" className="cursor-pointer text-foreground">جديد</Label>
                      <Switch
                        id="is-new"
                        checked={isNew}
                        onCheckedChange={setIsNew}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-muted dark:bg-gray-800 rounded-lg">
                      <Label htmlFor="is-popular" className="cursor-pointer text-foreground">مميز</Label>
                      <Switch
                        id="is-popular"
                        checked={isPopular}
                        onCheckedChange={setIsPopular}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-muted dark:bg-gray-800 rounded-lg">
                      <Label htmlFor="is-available" className="cursor-pointer text-foreground">متوفر</Label>
                      <Switch
                        id="is-available"
                        checked={isAvailable}
                        onCheckedChange={setIsAvailable}
                      />
                    </div>
                  </div>
                </div>

                {/* أزرار الحفظ والإلغاء */}
                <div className="flex gap-3 mt-8">
                  <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex-1"
                  >
                    {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    حفظ التعديلات
                  </Button>
                  <Button
                    onClick={onClose}
                    disabled={isSaving}
                    variant="outline"
                    className="flex-1"
                  >
                    إلغاء
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default EditProductModal;