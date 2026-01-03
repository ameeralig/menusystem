import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Link as LinkIcon, ImageIcon, Pencil, Save, X, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { uploadImage } from "@/utils/storageHelpers";
import { motion, AnimatePresence } from "framer-motion";

interface CategoryImageUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: string;
  currentImageUrl?: string;
  userId: string;
  onSuccess: () => void;
}

const CategoryImageUploadDialog = ({
  open,
  onOpenChange,
  category,
  currentImageUrl,
  userId,
  onSuccess
}: CategoryImageUploadDialogProps) => {
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [uploadMethod, setUploadMethod] = useState<'file' | 'url'>('file');
  const [newCategoryName, setNewCategoryName] = useState(category);
  const [isEditingName, setIsEditingName] = useState(false);
  const [savingName, setSavingName] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  useEffect(() => {
    setNewCategoryName(category);
    setIsEditingName(false);
    setPreviewImage(null);
    setImageUrl("");
  }, [category, open]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // التحقق من نوع الملف والحجم
    const maxSize = 10 * 1024 * 1024; // 10 ميجابايت
    
    if (!file.type.startsWith('image/') && !file.name.toLowerCase().match(/\.(jpg|jpeg|png|webp|heic|heif)$/)) {
      toast.error("يرجى اختيار صورة صالحة (JPG, PNG, WEBP, HEIC)");
      return;
    }

    if (file.size > maxSize) {
      toast.error("حجم الصورة كبير جداً. الحد الأقصى 10 ميجابايت");
      return;
    }

    // عرض معاينة الصورة
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    setUploading(true);
    
    try {
      console.log('بدء رفع صورة التصنيف:', { 
        name: file.name, 
        size: file.size, 
        type: file.type 
      });
      
      // معالجة صور HEIC من iPhone
      let processedFile = file;
      if (file.type === 'image/heic' || file.type === 'image/heif' || file.name.toLowerCase().endsWith('.heic')) {
        toast.info("جاري تحويل الصورة...");
        try {
          const img = new Image();
          const objectUrl = URL.createObjectURL(file);
          
          await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = () => reject(new Error('فشل تحميل الصورة'));
            img.src = objectUrl;
          });

          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0);
          
          const blob = await new Promise<Blob>((resolve, reject) => {
            canvas.toBlob(
              (b) => b ? resolve(b) : reject(new Error('فشل تحويل الصورة')),
              'image/jpeg',
              0.9
            );
          });
          
          URL.revokeObjectURL(objectUrl);
          processedFile = new File([blob], file.name.replace(/\.heic$/i, '.jpg'), { 
            type: 'image/jpeg' 
          });
          
          console.log('تم تحويل HEIC إلى JPEG بنجاح');
        } catch (conversionError) {
          console.error('خطأ في تحويل HEIC:', conversionError);
          toast.error("فشل تحويل الصورة. يرجى استخدام صيغة JPG أو PNG");
          setUploading(false);
          return;
        }
      }

      const publicUrl = await uploadImage('product-images', processedFile, userId, 'categories');
      await updateCategoryImage(publicUrl);
      
      toast.success("تم رفع الصورة بنجاح");
    } catch (error) {
      console.error('خطأ في رفع الصورة:', error);
      const errorMessage = error instanceof Error ? error.message : 'فشل رفع الصورة';
      toast.error(`خطأ: ${errorMessage}`);
    } finally {
      setUploading(false);
      if (e.target) {
        e.target.value = '';
      }
    }
  };

  const handleUrlUpload = async () => {
    if (!imageUrl.trim()) {
      toast.error("يرجى إدخال رابط الصورة");
      return;
    }

    setUploading(true);
    setPreviewImage(imageUrl);
    try {
      await updateCategoryImage(imageUrl);
    } catch (error) {
      console.error('خطأ في حفظ الصورة:', error);
      toast.error("فشل حفظ الصورة");
    } finally {
      setUploading(false);
    }
  };

  const updateCategoryImage = async (newImageUrl: string) => {
    // التحقق من وجود صورة للتصنيف
    const { data: existing } = await supabase
      .from('category_images')
      .select('id')
      .eq('user_id', userId)
      .eq('category', category)
      .single();

    if (existing) {
      const { error } = await supabase
        .from('category_images')
        .update({ image_url: newImageUrl })
        .eq('id', existing.id);

      if (error) throw error;
    } else {
      const { error } = await supabase
        .from('category_images')
        .insert({
          user_id: userId,
          category: category,
          image_url: newImageUrl
        });

      if (error) throw error;
    }

    toast.success("تم تحديث صورة التصنيف بنجاح");
    onSuccess();
    onOpenChange(false);
    setImageUrl("");
    setPreviewImage(null);
  };

  const handleUpdateCategoryName = async () => {
    if (!newCategoryName.trim()) {
      toast.error("يرجى إدخال اسم التصنيف");
      return;
    }

    if (newCategoryName.trim() === category) {
      setIsEditingName(false);
      return;
    }

    setSavingName(true);
    try {
      // 1. تحديث اسم التصنيف في جدول category_images
      const { error: categoryError } = await supabase
        .from('category_images')
        .update({ category: newCategoryName.trim() })
        .eq('user_id', userId)
        .eq('category', category);

      if (categoryError) {
        console.error('خطأ في تحديث اسم التصنيف:', categoryError);
      }

      // 2. تحديث اسم التصنيف في جميع المنتجات المرتبطة
      const { error: productsError, count } = await supabase
        .from('products')
        .update({ category: newCategoryName.trim() })
        .eq('user_id', userId)
        .eq('category', category);

      if (productsError) {
        throw productsError;
      }

      toast.success(`تم تحديث اسم التصنيف${count ? ` و ${count} منتج` : ''}`);
      setIsEditingName(false);
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('خطأ في تحديث اسم التصنيف:', error);
      toast.error("فشل تحديث اسم التصنيف");
    } finally {
      setSavingName(false);
    }
  };

  const displayImage = previewImage || currentImageUrl;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden bg-background/95 backdrop-blur-xl border-border/50" dir="rtl">
        {/* رأس البطاقة مع صورة الخلفية */}
        <div className="relative h-48 bg-gradient-to-b from-primary/20 to-background overflow-hidden">
          <AnimatePresence mode="wait">
            {displayImage ? (
              <motion.img
                key={displayImage}
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                src={displayImage}
                alt={category}
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <ImageIcon className="w-16 h-16 text-muted-foreground/30" />
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* تدرج شفاف */}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
          
          {/* اسم التصنيف */}
          <div className="absolute bottom-4 right-4 left-4">
            <AnimatePresence mode="wait">
              {isEditingName ? (
                <motion.div
                  key="editing"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex items-center gap-2"
                >
                  <Input
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    className="flex-1 bg-background/80 backdrop-blur-sm border-primary/30 text-lg font-bold"
                    placeholder="اسم التصنيف الجديد"
                    disabled={savingName}
                    autoFocus
                  />
                  <Button
                    size="icon"
                    variant="default"
                    onClick={handleUpdateCategoryName}
                    disabled={savingName}
                    className="shrink-0"
                  >
                    {savingName ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => {
                      setIsEditingName(false);
                      setNewCategoryName(category);
                    }}
                    disabled={savingName}
                    className="shrink-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </motion.div>
              ) : (
                <motion.div
                  key="display"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex items-center gap-2"
                >
                  <h2 className="text-2xl font-bold text-foreground drop-shadow-lg">
                    {category}
                  </h2>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setIsEditingName(true)}
                    className="h-8 w-8 bg-background/50 backdrop-blur-sm hover:bg-background/80"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* محتوى البطاقة */}
        <div className="p-6 space-y-6">
          {/* أزرار اختيار طريقة الرفع */}
          <div className="grid grid-cols-2 gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setUploadMethod('file')}
              className={`
                flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all
                ${uploadMethod === 'file' 
                  ? 'border-primary bg-primary/10 text-primary' 
                  : 'border-border hover:border-primary/50 text-muted-foreground hover:text-foreground'
                }
              `}
            >
              <Upload className="h-6 w-6" />
              <span className="text-sm font-medium">رفع ملف</span>
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setUploadMethod('url')}
              className={`
                flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all
                ${uploadMethod === 'url' 
                  ? 'border-primary bg-primary/10 text-primary' 
                  : 'border-border hover:border-primary/50 text-muted-foreground hover:text-foreground'
                }
              `}
            >
              <LinkIcon className="h-6 w-6" />
              <span className="text-sm font-medium">رابط URL</span>
            </motion.button>
          </div>

          {/* منطقة الرفع */}
          <AnimatePresence mode="wait">
            {uploadMethod === 'file' ? (
              <motion.div
                key="file"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-3"
              >
                <Label htmlFor="file" className="sr-only">اختر صورة</Label>
                <label
                  htmlFor="file"
                  className={`
                    flex flex-col items-center justify-center gap-3 p-8 
                    border-2 border-dashed rounded-xl cursor-pointer
                    transition-all hover:border-primary hover:bg-primary/5
                    ${uploading ? 'opacity-50 pointer-events-none' : 'border-border'}
                  `}
                >
                  {uploading ? (
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  ) : (
                    <Upload className="h-8 w-8 text-muted-foreground" />
                  )}
                  <div className="text-center">
                    <p className="text-sm font-medium text-foreground">
                      {uploading ? 'جاري الرفع...' : 'اضغط لاختيار صورة'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      JPG, PNG, WEBP (حتى 10 ميجابايت)
                    </p>
                  </div>
                </label>
                <Input
                  id="file"
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="hidden"
                />
              </motion.div>
            ) : (
              <motion.div
                key="url"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-3"
              >
                <Label htmlFor="url" className="text-sm font-medium">رابط الصورة</Label>
                <div className="flex gap-2">
                  <Input
                    id="url"
                    type="url"
                    placeholder="https://example.com/image.jpg"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    disabled={uploading}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleUrlUpload}
                    disabled={uploading || !imageUrl.trim()}
                  >
                    {uploading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      'حفظ'
                    )}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* زر الإغلاق */}
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full"
          >
            إغلاق
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CategoryImageUploadDialog;
