import { useState } from "react";
import { Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import ImageCompressionDialog from "@/components/shared/ImageCompressionDialog";

interface InlineBannerEditorProps {
  bannerUrl?: string | null;
  imgSrc: string | null;
  imageLoaded: boolean;
  imageError: boolean;
  onImageError: () => void;
  onImageLoad: () => void;
  storeOwnerId: string;
  onUpdate: () => void;
}

const InlineBannerEditor = ({
  bannerUrl,
  imgSrc,
  imageLoaded,
  imageError,
  onImageError,
  onImageLoad,
  storeOwnerId,
  onUpdate,
}: InlineBannerEditorProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showCompressionDialog, setShowCompressionDialog] = useState(false);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // التحقق من نوع الملف
    if (!file.type.startsWith('image/')) {
      toast.error("يرجى اختيار صورة صالحة");
      return;
    }

    // التحقق من حجم الملف (حد أقصى 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("حجم الصورة كبير جداً. الحد الأقصى 5MB");
      return;
    }

    setSelectedFile(file);
    setShowCompressionDialog(true);
    // إعادة تعيين قيمة input لتمكين اختيار نفس الملف مرة أخرى
    event.target.value = '';
  };

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    try {
      // رفع الصورة إلى Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${storeOwnerId}-${Date.now()}.${fileExt}`;
      const filePath = `${storeOwnerId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('banners')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // الحصول على URL العام
      const { data: urlData } = supabase.storage
        .from('banners')
        .getPublicUrl(filePath);

      // تحديث قاعدة البيانات
      const { error: updateError } = await supabase
        .from('store_settings')
        .update({
          banner_url: urlData.publicUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', storeOwnerId);

      if (updateError) throw updateError;

      toast.success("تم رفع صورة البانر بنجاح");
      onUpdate();
    } catch (error) {
      console.error("خطأ في رفع صورة البانر:", error);
      toast.error("فشل رفع صورة البانر");
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveBanner = async () => {
    try {
      const { error } = await supabase
        .from('store_settings')
        .update({
          banner_url: null,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', storeOwnerId);

      if (error) throw error;

      toast.success("تم حذف صورة البانر");
      onUpdate();
    } catch (error) {
      console.error("خطأ في حذف صورة البانر:", error);
      toast.error("فشل حذف صورة البانر");
    }
  };

  return (
    <div className="relative w-full overflow-hidden group">
      <AspectRatio ratio={16 / 5} className="w-full">
        {!imageLoaded && !imageError && (
          <Skeleton className="w-full h-full absolute inset-0" />
        )}
        {imgSrc && !imageError ? (
          <img 
            src={imgSrc} 
            alt="صورة الغلاف"
            width="1600"
            height="500"
            className={`w-full h-full object-cover transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
            onError={() => {
              console.error("خطأ في عرض البانر:", imgSrc);
              onImageError();
            }}
            onLoad={onImageLoad}
            loading="eager"
            fetchPriority="high"
          />
        ) : (
          !bannerUrl && (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
              <div className="text-center space-y-2">
                <Upload className="h-12 w-12 mx-auto text-gray-400" />
                <p className="text-gray-500 dark:text-gray-400">لا توجد صورة بانر</p>
              </div>
            </div>
          )
        )}
        <div className="absolute inset-0 bg-black bg-opacity-30"></div>
        
        {/* أزرار التحرير */}
        <div className="absolute top-4 left-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="secondary"
            size="sm"
            disabled={isUploading}
            asChild
          >
            <label className="cursor-pointer">
              <Upload className="h-4 w-4 ml-2" />
              {isUploading ? "جاري الرفع..." : "تغيير البانر"}
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                disabled={isUploading}
              />
            </label>
          </Button>
          
          {bannerUrl && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleRemoveBanner}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </AspectRatio>
      
      {/* نافذة ضغط الصورة */}
      <ImageCompressionDialog
        open={showCompressionDialog}
        onOpenChange={setShowCompressionDialog}
        file={selectedFile}
        onConfirm={handleFileUpload}
        title="ضغط صورة البانر"
        description="يمكنك اختيار ضغط صورة البانر لتقليل حجمها قبل الرفع"
      />
    </div>
  );
};

export default InlineBannerEditor;
