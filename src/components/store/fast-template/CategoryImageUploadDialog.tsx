import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Link as LinkIcon } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { uploadImage } from "@/utils/storageHelpers";

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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // التحقق من نوع الملف والحجم
    const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];
    const maxSize = 10 * 1024 * 1024; // 10 ميجابايت
    
    if (!file.type.startsWith('image/') && !file.name.toLowerCase().match(/\.(jpg|jpeg|png|webp|heic|heif)$/)) {
      toast.error("يرجى اختيار صورة صالحة (JPG, PNG, WEBP, HEIC)");
      return;
    }

    if (file.size > maxSize) {
      toast.error("حجم الصورة كبير جداً. الحد الأقصى 10 ميجابايت");
      return;
    }

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
          // تحويل HEIC إلى JPEG باستخدام Canvas
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
      // إعادة تعيين قيمة input للسماح برفع نفس الملف مرة أخرى
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
      // تحديث الصورة الموجودة
      const { error } = await supabase
        .from('category_images')
        .update({ image_url: newImageUrl })
        .eq('id', existing.id);

      if (error) throw error;
    } else {
      // إضافة صورة جديدة
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
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle>تحديث صورة التصنيف: {category}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* اختيار طريقة الرفع */}
          <div className="flex gap-2">
            <Button
              type="button"
              variant={uploadMethod === 'file' ? 'default' : 'outline'}
              onClick={() => setUploadMethod('file')}
              className="flex-1"
            >
              <Upload className="ml-2 h-4 w-4" />
              رفع ملف
            </Button>
            <Button
              type="button"
              variant={uploadMethod === 'url' ? 'default' : 'outline'}
              onClick={() => setUploadMethod('url')}
              className="flex-1"
            >
              <LinkIcon className="ml-2 h-4 w-4" />
              رابط URL
            </Button>
          </div>

          {uploadMethod === 'file' ? (
            <div className="space-y-2">
              <Label htmlFor="file">اختر صورة</Label>
              <Input
                id="file"
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                disabled={uploading}
              />
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="url">رابط الصورة</Label>
              <Input
                id="url"
                type="url"
                placeholder="https://example.com/image.jpg"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                disabled={uploading}
              />
              <Button
                onClick={handleUrlUpload}
                disabled={uploading || !imageUrl.trim()}
                className="w-full"
              >
                {uploading ? "جاري الحفظ..." : "حفظ"}
              </Button>
            </div>
          )}

          {/* عرض الصورة الحالية */}
          {currentImageUrl && (
            <div className="space-y-2">
              <Label>الصورة الحالية</Label>
              <img
                src={currentImageUrl}
                alt={category}
                className="w-full h-32 object-cover rounded-lg border"
              />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CategoryImageUploadDialog;
