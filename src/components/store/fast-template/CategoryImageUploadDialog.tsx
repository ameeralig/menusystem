import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Upload, 
  Link as LinkIcon, 
  ImageIcon, 
  Pencil, 
  Save, 
  X, 
  Loader2,
  Trash2,
  AlertTriangle
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { useSmartUpload } from "@/hooks/useSmartUpload";

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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [productsCount, setProductsCount] = useState(0);
  const { upload } = useSmartUpload();

  useEffect(() => {
    setNewCategoryName(category);
    setIsEditingName(false);
    setPreviewImage(null);
    setImageUrl("");
    setShowDeleteConfirm(false);
    
    // جلب عدد المنتجات في التصنيف
    if (open && category && userId) {
      fetchProductsCount();
    }
  }, [category, open, userId]);

  const fetchProductsCount = async () => {
    const { count } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('category', category);
    
    setProductsCount(count || 0);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const maxSize = 10 * 1024 * 1024;
    
    if (!file.type.startsWith('image/') && !file.name.toLowerCase().match(/\.(jpg|jpeg|png|webp|heic|heif)$/)) {
      toast.error("يرجى اختيار صورة صالحة");
      return;
    }

    if (file.size > maxSize) {
      toast.error("حجم الصورة كبير جداً. الحد الأقصى 10 ميجابايت");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => setPreviewImage(e.target?.result as string);
    reader.readAsDataURL(file);

    setUploading(true);
    
    try {
      let processedFile = file;
      if (file.type === 'image/heic' || file.type === 'image/heif' || file.name.toLowerCase().endsWith('.heic')) {
        toast.info("جاري تحويل الصورة...");
        const img = new Image();
        const objectUrl = URL.createObjectURL(file);
        await new Promise((resolve, reject) => { img.onload = resolve; img.onerror = () => reject(new Error('فشل تحميل الصورة')); img.src = objectUrl; });
        const canvas = document.createElement('canvas');
        canvas.width = img.width; canvas.height = img.height;
        const ctx = canvas.getContext('2d'); ctx?.drawImage(img, 0, 0);
        const blob = await new Promise<Blob>((resolve, reject) => {
          canvas.toBlob((b) => b ? resolve(b) : reject(new Error('فشل تحويل الصورة')), 'image/jpeg', 0.9);
        });
        URL.revokeObjectURL(objectUrl);
        processedFile = new File([blob], file.name.replace(/\.heic$/i, '.jpg'), { type: 'image/jpeg' });
      }

      const result = await upload(processedFile, {
        bucket: 'product-images',
        folder: 'categories',
        userId,
        showToast: false,
      });

      if (!result?.url) throw new Error("فشل رفع الصورة");

      await updateCategoryImage(result.url);
      toast.success("تم رفع الصورة بنجاح");
    } catch (error) {
      console.error('خطأ في رفع الصورة:', error);
      toast.error("فشل رفع الصورة");
    } finally {
      setUploading(false);
      if (e.target) e.target.value = '';
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
      toast.error("فشل حفظ الصورة");
    } finally {
      setUploading(false);
    }
  };

  const updateCategoryImage = async (newImageUrl: string) => {
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
        .insert({ user_id: userId, category: category, image_url: newImageUrl });
      if (error) throw error;
    }

    toast.success("تم تحديث صورة التصنيف");
    onSuccess();
    onOpenChange(false);
  };

  const handleUpdateCategoryName = async () => {
    if (!newCategoryName.trim() || newCategoryName.trim() === category) {
      setIsEditingName(false);
      return;
    }

    setSavingName(true);
    try {
      await supabase
        .from('category_images')
        .update({ category: newCategoryName.trim() })
        .eq('user_id', userId)
        .eq('category', category);

      const { count } = await supabase
        .from('products')
        .update({ category: newCategoryName.trim() })
        .eq('user_id', userId)
        .eq('category', category);

      toast.success(`تم تحديث اسم التصنيف${count ? ` و ${count} منتج` : ''}`);
      setIsEditingName(false);
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      toast.error("فشل تحديث اسم التصنيف");
    } finally {
      setSavingName(false);
    }
  };

  const handleDeleteCategory = async () => {
    setDeleting(true);
    try {
      // حذف صورة التصنيف
      await supabase
        .from('category_images')
        .delete()
        .eq('user_id', userId)
        .eq('category', category);

      // حذف جميع المنتجات في التصنيف
      const { error: productsError } = await supabase
        .from('products')
        .delete()
        .eq('user_id', userId)
        .eq('category', category);

      if (productsError) throw productsError;

      toast.success(`تم حذف التصنيف "${category}" مع ${productsCount} منتج`);
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('خطأ في حذف التصنيف:', error);
      toast.error("فشل حذف التصنيف");
    } finally {
      setDeleting(false);
    }
  };

  const displayImage = previewImage || currentImageUrl;
  const themeColor = '#3b82f6';

  if (!open) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          {/* الخلفية الضبابية */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !showDeleteConfirm && onOpenChange(false)}
            className="fixed inset-0 z-50 backdrop-blur-md bg-black/40"
          />

          {/* البطاقة العائمة */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
            dir="rtl"
          >
            <div className="pointer-events-auto w-full max-w-sm">
              {/* زر الإغلاق */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => onOpenChange(false)}
                className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/20 backdrop-blur-lg border border-white/30 flex items-center justify-center text-white shadow-lg"
              >
                <X className="w-5 h-5" />
              </motion.button>

              {/* بطاقة تأكيد الحذف */}
              <AnimatePresence>
                {showDeleteConfirm && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="absolute inset-0 z-20 flex items-center justify-center"
                  >
                    <div className="bg-background/95 backdrop-blur-xl rounded-3xl p-6 border border-destructive/30 shadow-2xl max-w-xs mx-4">
                      <div className="text-center">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-destructive/10 flex items-center justify-center">
                          <AlertTriangle className="w-8 h-8 text-destructive" />
                        </div>
                        <h3 className="text-lg font-bold text-foreground mb-2">
                          حذف التصنيف؟
                        </h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          سيتم حذف التصنيف <strong>"{category}"</strong> مع جميع المنتجات المرتبطة به
                          <span className="block mt-1 text-destructive font-medium">
                            ({productsCount} منتج)
                          </span>
                        </p>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            onClick={() => setShowDeleteConfirm(false)}
                            disabled={deleting}
                            className="flex-1"
                          >
                            إلغاء
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={handleDeleteCategory}
                            disabled={deleting}
                            className="flex-1"
                          >
                            {deleting ? (
                              <Loader2 className="w-4 h-4 animate-spin ml-2" />
                            ) : (
                              <Trash2 className="w-4 h-4 ml-2" />
                            )}
                            حذف
                          </Button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

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

                {/* محتوى البطاقة */}
                <div className="relative p-6 text-center text-white">
                  {/* صورة التصنيف */}
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.1, type: "spring" }}
                    className="mx-auto mb-4 w-24 h-24 rounded-2xl bg-white/20 backdrop-blur-lg border border-white/30 flex items-center justify-center overflow-hidden shadow-lg"
                  >
                    {displayImage ? (
                      <img 
                        src={displayImage} 
                        alt={category} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ImageIcon className="w-10 h-10 text-white/60" />
                    )}
                  </motion.div>

                  {/* اسم التصنيف */}
                  <AnimatePresence mode="wait">
                    {isEditingName ? (
                      <motion.div
                        key="editing"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex items-center gap-2 mb-4"
                      >
                        <Input
                          value={newCategoryName}
                          onChange={(e) => setNewCategoryName(e.target.value)}
                          className="flex-1 bg-white/20 border-white/30 text-white placeholder:text-white/50 text-center"
                          placeholder="اسم التصنيف"
                          disabled={savingName}
                          autoFocus
                        />
                        <Button
                          size="icon"
                          onClick={handleUpdateCategoryName}
                          disabled={savingName}
                          className="shrink-0 bg-white/20 hover:bg-white/30 border-white/30"
                        >
                          {savingName ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => { setIsEditingName(false); setNewCategoryName(category); }}
                          disabled={savingName}
                          className="shrink-0 text-white hover:bg-white/20"
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
                        className="mb-4"
                      >
                        <div className="flex items-center justify-center gap-2">
                          <h2 className="text-2xl font-bold drop-shadow-lg">{category}</h2>
                          <button
                            onClick={() => setIsEditingName(true)}
                            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-white/80 text-sm mt-1">
                          {productsCount > 0 ? `${productsCount} منتج` : 'لا توجد منتجات'}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* أزرار طريقة الرفع */}
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setUploadMethod('file')}
                      className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all ${
                        uploadMethod === 'file' 
                          ? 'border-white bg-white/20' 
                          : 'border-white/30 hover:border-white/50'
                      }`}
                    >
                      <Upload className="h-4 w-4" />
                      <span className="text-sm">رفع ملف</span>
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setUploadMethod('url')}
                      className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all ${
                        uploadMethod === 'url' 
                          ? 'border-white bg-white/20' 
                          : 'border-white/30 hover:border-white/50'
                      }`}
                    >
                      <LinkIcon className="h-4 w-4" />
                      <span className="text-sm">رابط URL</span>
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
                      >
                        <label
                          htmlFor="category-file"
                          className={`flex flex-col items-center justify-center gap-2 p-6 border-2 border-dashed rounded-xl cursor-pointer transition-all hover:bg-white/10 ${
                            uploading ? 'opacity-50 pointer-events-none' : 'border-white/40'
                          }`}
                        >
                          {uploading ? (
                            <Loader2 className="h-6 w-6 animate-spin" />
                          ) : (
                            <Upload className="h-6 w-6" />
                          )}
                          <span className="text-sm">
                            {uploading ? 'جاري الرفع...' : 'اضغط لاختيار صورة'}
                          </span>
                        </label>
                        <input
                          id="category-file"
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
                        className="flex gap-2"
                      >
                        <Input
                          type="url"
                          placeholder="https://example.com/image.jpg"
                          value={imageUrl}
                          onChange={(e) => setImageUrl(e.target.value)}
                          disabled={uploading}
                          className="flex-1 bg-white/20 border-white/30 text-white placeholder:text-white/50"
                          dir="ltr"
                        />
                        <Button
                          onClick={handleUrlUpload}
                          disabled={uploading || !imageUrl.trim()}
                          className="bg-white/20 hover:bg-white/30 border-white/30"
                        >
                          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'حفظ'}
                        </Button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* أزرار الإجراءات */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex gap-2 mt-4"
              >
                <Button
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  className="flex-1 h-12 rounded-2xl bg-white/10 backdrop-blur-lg border-white/20 text-white hover:bg-white/20"
                >
                  <X className="w-4 h-4 ml-2" />
                  إغلاق
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="flex-1 h-12 rounded-2xl bg-red-500/20 backdrop-blur-lg border-red-500/30 text-white hover:bg-red-500/30"
                >
                  <Trash2 className="w-4 h-4 ml-2" />
                  حذف التصنيف
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default CategoryImageUploadDialog;
