
import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Spinner } from "@/components/ui/spinner";
import { CategoryImage } from "@/types/categoryImage";
import { Upload, Image as ImageIcon, X, Save } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Alert, AlertDescription } from "@/components/ui/alert";

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
  const [previewError, setPreviewError] = useState<boolean>(false);

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

        {categoryImage?.image_url ? (
          <div className="relative aspect-video mb-3">
            {previewError ? (
              <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground">
                <p className="text-xs text-center p-2">فشل تحميل الصورة</p>
              </div>
            ) : (
              <img 
                src={categoryImage.image_url}
                alt={`صورة ${category}`}
                className="w-full h-full object-cover rounded-md"
                onError={() => setPreviewError(true)}
                fetchPriority="high"
              />
            )}
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  variant="destructive"
                  className="absolute top-2 right-2 h-7 w-7"
                  disabled={uploading}
                  onClick={() => onRemoveImage(category)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>حذف الصورة</p>
              </TooltipContent>
            </Tooltip>
          </div>
        ) : (
          <div className="aspect-video mb-3 border-2 border-dashed border-muted rounded-md flex items-center justify-center bg-muted/20">
            <div className="text-center p-4">
              <ImageIcon className="h-8 w-8 mx-auto mb-2 text-muted-foreground/70" />
              <p className="text-xs text-muted-foreground">لا توجد صورة</p>
            </div>
          </div>
        )}

        {!categoryImage?.image_url && (
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
                  {uploading ? (
                    <>
                      <Spinner className="h-4 w-4 mr-2" />
                      جاري الرفع...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 ml-2" />
                      رفع صورة
                    </>
                  )}
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
                  {uploading ? (
                    <>
                      <Spinner className="h-4 w-4 mr-2" />
                      جاري الرفع...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 ml-2" />
                      استخدام الرابط
                    </>
                  )}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
};
