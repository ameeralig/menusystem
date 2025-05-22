
import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Spinner } from "@/components/ui/spinner";
import { CategoryImage } from "@/types/categoryImage";
import { Upload, Image as ImageIcon, X, Save } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Skeleton } from "@/components/ui/skeleton";

interface CategoryImageCardProps {
  category: string;
  categoryImage?: CategoryImage;
  onFileUpload: (category: string, file: File) => Promise<void>;
  onUrlUpload?: (category: string, url: string) => Promise<void>;
  onRemoveImage: (category: string) => Promise<void>;
  uploading: boolean;
  error?: string | null;
}

export const CategoryImageCard = ({ 
  category,
  categoryImage,
  onFileUpload,
  onUrlUpload,
  onRemoveImage,
  uploading,
  error
}: CategoryImageCardProps) => {
  const [imageUrl, setImageUrl] = useState<string>("");
  const [uploadTab, setUploadTab] = useState<string>("file");
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [imgError, setImgError] = useState<boolean>(false);

  // تحميل الصورة مع معالجة مشاكل التخزين المؤقت
  useEffect(() => {
    if (categoryImage?.image_url) {
      setIsLoading(true);
      setImgError(false);
      
      // إضافة طابع زمني للرابط لتجنب التخزين المؤقت
      const timestamp = Date.now();
      const baseUrl = categoryImage.image_url.split('?')[0];
      
      // تحسين الرابط مع تنسيق webp إذا كان من supabase
      const isSupabaseUrl = baseUrl.includes('supabase.co') || baseUrl.includes('lovable-app');
      const optimizedUrl = isSupabaseUrl
        ? `${baseUrl}?t=${timestamp}&format=webp&quality=80&preview=true`
        : `${baseUrl}?t=${timestamp}&preview=true`;
      
      console.log(`تحميل معاينة صورة التصنيف ${category}: ${optimizedUrl}`);
      
      // تحميل الصورة
      const img = new Image();
      img.onload = () => {
        console.log(`تم تحميل صورة معاينة التصنيف ${category} بنجاح`);
        setImgSrc(optimizedUrl);
        setIsLoading(false);
      };
      
      img.onerror = (e) => {
        console.error(`فشل تحميل صورة معاينة التصنيف ${category}:`, e);
        setImgError(true);
        setIsLoading(false);
      };
      
      // تعيين خصائص الصورة للتحميل الأمثل
      img.decoding = "async";
      img.fetchPriority = "high";
      img.crossOrigin = "anonymous";
      img.src = optimizedUrl;
      
      // إعادة المحاولة بعد فترة إذا فشل التحميل
      const retryTimeout = setTimeout(() => {
        if (img.complete === false) {
          console.log(`إعادة محاولة تحميل صورة معاينة التصنيف ${category}`);
          const retryTimestamp = Date.now();
          const retryUrl = isSupabaseUrl
            ? `${baseUrl}?t=${retryTimestamp}&format=webp&quality=80&retry=true`
            : `${baseUrl}?t=${retryTimestamp}&retry=true`;
          img.src = retryUrl;
        }
      }, 2000);
      
      return () => {
        clearTimeout(retryTimeout);
        img.onload = null;
        img.onerror = null;
      };
    } else {
      setImgSrc(null);
      setIsLoading(false);
    }
  }, [categoryImage?.image_url, category]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileUpload(category, e.target.files[0]);
      e.target.value = ""; // إعادة ضبط حقل الإدخال
    }
  };

  const handleUrlUpload = () => {
    if (onUrlUpload && imageUrl) {
      onUrlUpload(category, imageUrl);
      setImageUrl("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && onUrlUpload && imageUrl) {
      e.preventDefault();
      handleUrlUpload();
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-4 bg-muted/30">
        <CardTitle className="text-sm truncate font-medium">{category}</CardTitle>
      </CardHeader>
      
      <CardContent className="p-3">
        {error && (
          <Alert variant="destructive" className="mb-3 py-2">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="relative aspect-video mb-3">
          {isLoading && (
            <div className="absolute inset-0 z-10">
              <Skeleton className="w-full h-full" />
            </div>
          )}
          
          {imgSrc && !imgError ? (
            <AspectRatio ratio={16/9}>
              <img 
                src={imgSrc}
                alt={`صورة ${category}`}
                className={`w-full h-full object-cover rounded-md transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
                onError={() => {
                  console.error(`خطأ في عرض صورة معاينة التصنيف ${category}`);
                  setImgError(true);
                }}
                fetchPriority="high"
                crossOrigin="anonymous"
              />
              
              {!isLoading && !uploading && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="icon"
                      variant="destructive"
                      className="absolute top-2 right-2 h-7 w-7"
                      onClick={() => onRemoveImage(category)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>حذف الصورة</p>
                  </TooltipContent>
                </Tooltip>
              )}
            </AspectRatio>
          ) : (
            <div className="aspect-video border-2 border-dashed border-muted rounded-md flex items-center justify-center bg-muted/20">
              <div className="text-center p-4">
                <ImageIcon className="h-8 w-8 mx-auto mb-2 text-muted-foreground/70" />
                <p className="text-xs text-muted-foreground">
                  {imgError ? "فشل تحميل الصورة" : "لا توجد صورة"}
                </p>
              </div>
            </div>
          )}
          
          {uploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-md">
              <Spinner className="h-8 w-8" />
            </div>
          )}
        </div>

        {(!imgSrc || imgError) && !uploading && (
          <Tabs value={uploadTab} onValueChange={setUploadTab}>
            <TabsList className="grid w-full grid-cols-2 mb-2">
              <TabsTrigger value="file">ملف</TabsTrigger>
              <TabsTrigger value="url">رابط</TabsTrigger>
            </TabsList>
            
            <TabsContent value="file" className="mt-2">
              <div className="flex items-center space-x-2 space-x-reverse">
                <Button
                  onClick={() => document.getElementById(`file-upload-${category}`)?.click()}
                  disabled={uploading}
                  variant="outline"
                  className="w-full"
                >
                  <Upload className="h-4 w-4 ml-2" />
                  رفع صورة
                </Button>
                <input
                  id={`file-upload-${category}`}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>
            </TabsContent>
            
            <TabsContent value="url" className="mt-2 space-y-2">
              <div className="flex flex-col space-y-2">
                <div className="flex space-x-2 space-x-reverse">
                  <Input
                    placeholder="أدخل رابط الصورة..."
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={uploading}
                    className="text-right"
                    dir="rtl"
                  />
                </div>
                <Button
                  onClick={handleUrlUpload}
                  disabled={uploading || !imageUrl.trim() || !onUrlUpload}
                  className="w-full"
                  size="sm"
                >
                  <Save className="h-4 w-4 ml-2" />
                  استخدام الرابط
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
};
