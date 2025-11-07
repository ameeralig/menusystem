
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { ImageIcon, X, Loader2, Trash2 } from "lucide-react";
import { CategoryImage } from "@/types/categoryImage";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import ImageCropDialog from "@/components/shared/ImageCropDialog";

interface CategoryImageCardProps {
  category: string;
  categoryImage: CategoryImage | undefined;
  onFileUpload: (category: string, file: File) => Promise<void>;
  onUrlUpload: (category: string, url: string) => Promise<void>;
  onRemoveImage: (category: string) => Promise<void>;
  onDeleteCategory?: (category: string, confirmationText?: string) => Promise<any>;
  uploading: boolean;
  userId?: string;
}

export const CategoryImageCard = ({
  category,
  categoryImage,
  onFileUpload,
  onUrlUpload,
  onRemoveImage,
  onDeleteCategory,
  uploading,
  userId
}: CategoryImageCardProps) => {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [imageSrc, setImageSrc] = useState<string | undefined>(categoryImage?.image_url);
  const [confirmationText, setConfirmationText] = useState("");
  const [productCount, setProductCount] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [uploadMethod, setUploadMethod] = useState<"file" | "url">("file");
  const [imageUrl, setImageUrl] = useState("");
  const [cropDialogOpen, setCropDialogOpen] = useState(false);
  const [tempImageSrc, setTempImageSrc] = useState<string>("");
  const { toast } = useToast();

  const handleUrlSubmit = () => {
    if (imageUrl.trim()) {
      onUrlUpload(category, imageUrl.trim());
      setImageUrl("");
    }
  };

  // عند تغيير صورة التصنيف أو إعادة التحميل، نستخدم القيمة الجديدة
  useEffect(() => {
    if (categoryImage?.image_url) {
      console.log(`تم تحديث صورة التصنيف ${category}:`, categoryImage.image_url);
      
      // إعادة تعيين حالات الخطأ والتحميل
      setIsLoading(true);
      setImageError(false);
      setImageLoaded(false);
      
      // تحديث رابط الصورة مع طابع زمني جديد لتجنب التخزين المؤقت
      const timestamp = Date.now();
      let newSrc = categoryImage.image_url;
      
      // إضافة طابع زمني جديد
      if (newSrc.includes('?')) {
        newSrc = `${newSrc.split('?')[0]}?t=${timestamp}`;
      } else {
        newSrc = `${newSrc}?t=${timestamp}`;
      }
      
      setImageSrc(newSrc);
    } else {
      console.log(`لا توجد صورة للتصنيف ${category}`);
      setImageSrc(undefined);
      setImageLoaded(false);
    }
  }, [category, categoryImage?.image_url]);

  const handleImageLoad = () => {
    console.log(`تم تحميل صورة التصنيف ${category} بنجاح`);
    setImageError(false);
    setIsLoading(false);
    setImageLoaded(true);
  };

  const handleImageError = () => {
    console.error(`خطأ في تحميل صورة التصنيف ${category}`);
    setImageError(true);
    setIsLoading(false);
    setImageLoaded(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const objectUrl = URL.createObjectURL(file);
      setTempImageSrc(objectUrl);
      setCropDialogOpen(true);
      
      // إعادة تعيين حقل الملف بعد الرفع
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleCropComplete = (croppedBlob: Blob) => {
    const croppedFile = new File([croppedBlob], "category-image.jpg", { type: "image/jpeg" });
    onFileUpload(category, croppedFile);
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const checkProductCount = async () => {
    if (!userId) return 0;
    
    try {
      const { data: products, error } = await supabase
        .from("products")
        .select("id")
        .eq("user_id", userId)
        .eq("category", category);

      if (error) throw error;
      return products ? products.length : 0;
    } catch (error) {
      console.error("خطأ في جلب عدد المنتجات:", error);
      return 0;
    }
  };

  const handleDeleteClick = async () => {
    if (!onDeleteCategory) return;

    const count = await checkProductCount();
    setProductCount(count);

    if (count === 0) {
      // حذف مباشر إذا لم توجد منتجات
      setIsDeleting(true);
      try {
        await onDeleteCategory(category);
      } finally {
        setIsDeleting(false);
      }
    }
    // إذا كانت هناك منتجات، سيفتح الحوار تلقائياً
  };

  const handleConfirmDelete = async () => {
    if (!onDeleteCategory) return;

    setIsDeleting(true);
    try {
      const result = await onDeleteCategory(category, confirmationText);
      if (result?.success) {
        setConfirmationText("");
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-base font-medium">{category}</Label>
          <div className="flex items-center gap-1">
            {imageSrc && !imageError && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onRemoveImage(category)}
                    className="h-8 w-8"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>إزالة الصورة</p>
                </TooltipContent>
              </Tooltip>
            )}
            {onDeleteCategory && (
              <AlertDialog>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={handleDeleteClick}
                        disabled={isDeleting}
                      >
                        {isDeleting ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </AlertDialogTrigger>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>حذف التصنيف</p>
                  </TooltipContent>
                </Tooltip>
                {productCount > 0 && (
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>تأكيد حذف التصنيف والمنتجات</AlertDialogTitle>
                      <AlertDialogDescription className="space-y-3">
                        <p>
                          التصنيف "{category}" يحتوي على <strong>{productCount}</strong> منتج.
                        </p>
                        <p className="text-destructive font-medium">
                          تحذير: سيتم حذف جميع المنتجات في هذا التصنيف نهائياً!
                        </p>
                        <div className="space-y-2">
                          <Label htmlFor="confirmation">
                            للمتابعة، اكتب: <strong>احذف التصنيف</strong>
                          </Label>
                          <Input
                            id="confirmation"
                            value={confirmationText}
                            onChange={(e) => setConfirmationText(e.target.value)}
                            placeholder="احذف التصنيف"
                            className="text-center"
                          />
                        </div>
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel onClick={() => setConfirmationText("")}>
                        إلغاء
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleConfirmDelete}
                        disabled={confirmationText !== "احذف التصنيف" || isDeleting}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        {isDeleting ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            جاري الحذف...
                          </>
                        ) : (
                          "حذف التصنيف والمنتجات"
                        )}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                )}
              </AlertDialog>
            )}
          </div>
        </div>

        {imageSrc && !imageError ? (
          <div className="relative aspect-video rounded-md overflow-hidden bg-muted cursor-pointer" onClick={triggerFileInput}>
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-muted/50 z-10">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            )}
            <img
              src={imageSrc}
              alt={category}
              className={`
                w-full h-full object-cover transition-all duration-500
                ${!imageLoaded ? 'blur-md opacity-60' : 'blur-0 opacity-100'}
              `}
              onLoad={handleImageLoad}
              onError={handleImageError}
              loading="lazy"
              style={{ display: isLoading ? 'none' : 'block' }}
            />
          </div>
        ) : (
          <div 
            className="aspect-video rounded-md bg-muted flex flex-col items-center justify-center cursor-pointer hover:bg-muted/80 transition-colors"
            onClick={triggerFileInput}
          >
            <ImageIcon className="h-8 w-8 text-muted-foreground mb-2" />
            <span className="text-xs text-muted-foreground">انقر لاختيار صورة</span>
          </div>
        )}

        <div className="flex flex-col gap-3">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          
          {/* أزرار اختيار نوع الرفع */}
          <div className="flex gap-2">
            <Button
              type="button"
              variant={uploadMethod === "file" ? "default" : "outline"}
              size="sm"
              className="flex-1 text-xs"
              onClick={() => setUploadMethod("file")}
            >
              رفع من الجهاز
            </Button>
            <Button
              type="button"
              variant={uploadMethod === "url" ? "default" : "outline"}
              size="sm"
              className="flex-1 text-xs"
              onClick={() => setUploadMethod("url")}
            >
              رابط الصورة
            </Button>
          </div>

          {/* محتوى الرفع حسب النوع المختار */}
          {uploadMethod === "file" ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full"
              onClick={triggerFileInput}
              disabled={uploading}
            >
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  جاري الرفع...
                </>
              ) : (
                <>اختيار ملف</>
              )}
            </Button>
          ) : (
            <div className="flex flex-col gap-2">
              <Input
                placeholder="أدخل رابط الصورة هنا"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                disabled={uploading}
                className="w-full"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full"
                onClick={handleUrlSubmit}
                disabled={uploading || !imageUrl.trim()}
              >
                {uploading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    جاري الحفظ...
                  </>
                ) : (
                  <>حفظ الصورة</>
                )}
              </Button>
            </div>
          )}
        </div>

        <ImageCropDialog
          open={cropDialogOpen}
          onClose={() => setCropDialogOpen(false)}
          imageSrc={tempImageSrc}
          onCropComplete={handleCropComplete}
          aspect={16 / 9}
          title={`قص صورة التصنيف: ${category}`}
        />
      </CardContent>
    </Card>
  );
};
