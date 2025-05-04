
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Product } from "@/types/product";
import ProductImageUploader from "../ProductImageUploader";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { uploadImage } from "@/utils/storageHelpers";
import { Button } from "@/components/ui/button";
import { Loader2, Save } from "lucide-react";

interface EditProductImageSectionProps {
  product: Product;
  onImageUpdate: (imageUrl: string) => void;
}

const EditProductImageSection = ({ product, onImageUpdate }: EditProductImageSectionProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState(product.image_url || "");
  const { toast } = useToast();

  const handleImageSelect = (file: File | null, url: string) => {
    setSelectedFile(file);
    setImageUrl(url);
  };

  const handleSaveImage = async () => {
    try {
      setIsUploading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("يجب تسجيل الدخول أولاً");

      let finalImageUrl = imageUrl;
      
      // إذا تم اختيار ملف، قم برفعه
      if (selectedFile) {
        finalImageUrl = await uploadImage("product-images", selectedFile, user.id, "products");
      }

      // تحديث صورة المنتج في قاعدة البيانات
      const { error } = await supabase
        .from("products")
        .update({ image_url: finalImageUrl })
        .eq("id", product.id);

      if (error) throw error;

      onImageUpdate(finalImageUrl);

      toast({
        title: "تم تحديث صورة المنتج بنجاح",
      });
    } catch (error: any) {
      console.error("خطأ في تحديث صورة المنتج:", error);
      toast({
        variant: "destructive",
        title: "خطأ في تحديث صورة المنتج",
        description: error.message,
      });
    } finally {
      setIsUploading(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>صورة المنتج</CardTitle>
        <CardDescription>
          قم بتعديل صورة المنتج وضبط كيفية ظهورها
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <ProductImageUploader
          onImageSelect={handleImageSelect}
          initialImageUrl={product.image_url || ""}
        />
        
        <Button
          type="button"
          className="w-full"
          onClick={handleSaveImage}
          disabled={isUploading || (!selectedFile && imageUrl === product.image_url)}
        >
          {isUploading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin ml-2" />
              جاري الحفظ...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 ml-2" />
              حفظ صورة المنتج
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default EditProductImageSection;
