import React, { useState, useEffect } from "react";
import { Product } from "@/types/product";
import { X, Upload, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { optimizeImageUrl } from "@/utils/imageOptimizer";

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
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${product.user_id}/${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(fileName, imageFile, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('product-images')
          .getPublicUrl(fileName);

        imageUrl = publicUrl;

        // حذف الصورة القديمة إذا كانت موجودة
        if (product.image_url) {
          const oldFileName = product.image_url.split('/').pop();
          if (oldFileName) {
            await supabase.storage
              .from('product-images')
              .remove([`${product.user_id}/${oldFileName}`]);
          }
        }
      }

      // تحديث بيانات المنتج
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
          image_url: imageUrl
        })
        .eq('id', product.id);

      if (updateError) throw updateError;

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
              className="relative w-full max-w-2xl bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden pointer-events-auto my-8"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={onClose}
                disabled={isSaving}
                className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center bg-white/90 dark:bg-gray-800/90 rounded-full shadow-lg hover:bg-white dark:hover:bg-gray-700 transition-all duration-200 hover:scale-110 disabled:opacity-50"
              >
                <X className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              </button>

              <div className="p-6 max-h-[80vh] overflow-y-auto">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  تعديل المنتج
                </h2>

                <div className="space-y-6">
                  {/* صورة المنتج */}
                  <div>
                    <Label htmlFor="product-image">صورة المنتج</Label>
                    <div className="mt-2 flex flex-col items-center gap-4">
                      {(imagePreview || displayedImage) && (
                        <div className="relative w-full h-48 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
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
                        <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors">
                          <Upload className="w-4 h-4" />
                          <span className="text-sm">
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
                    <Label htmlFor="name">اسم المنتج *</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="أدخل اسم المنتج"
                      className="mt-2"
                    />
                  </div>

                  {/* السعر */}
                  <div>
                    <Label htmlFor="price">السعر (دينار عراقي) *</Label>
                    <Input
                      id="price"
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="0"
                      min="0"
                      step="0.01"
                      className="mt-2"
                    />
                  </div>

                  {/* التصنيف */}
                  <div>
                    <Label htmlFor="category">التصنيف</Label>
                    <Input
                      id="category"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      placeholder="أدخل التصنيف"
                      className="mt-2"
                    />
                  </div>

                  {/* الوصف */}
                  <div>
                    <Label htmlFor="description">الوصف</Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="أدخل وصف المنتج"
                      rows={4}
                      className="mt-2"
                    />
                  </div>

                  {/* الخصائص */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <Label htmlFor="is-new" className="cursor-pointer">جديد</Label>
                      <Switch
                        id="is-new"
                        checked={isNew}
                        onCheckedChange={setIsNew}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <Label htmlFor="is-popular" className="cursor-pointer">مميز</Label>
                      <Switch
                        id="is-popular"
                        checked={isPopular}
                        onCheckedChange={setIsPopular}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <Label htmlFor="is-available" className="cursor-pointer">متوفر</Label>
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