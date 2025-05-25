
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion } from "@/components/ui/accordion";
import { ArrowRight, Loader2, X } from "lucide-react";
import { Product } from "@/types/product";
import { useIsMobile } from "@/hooks/use-mobile";
import BasicInfoSection from "@/components/products/edit/sections/BasicInfoSection";
import ProductSettingsSection from "@/components/products/edit/sections/ProductSettingsSection";
import ImageSection from "@/components/products/edit/sections/ImageSection";

interface EditProductFormProps {
  product: Product;
  onSubmit: (e: React.FormEvent, imageData?: { uploadMethod: "url" | "file"; imageUrl?: string; selectedFile?: File | null }) => void;
  onCancel: () => void;
  name: string;
  setName: (value: string) => void;
  description: string;
  setDescription: (value: string) => void;
  price: string;
  setPrice: (value: string) => void;
  category: string;
  setCategory: (value: string) => void;
  isNew: boolean;
  setIsNew: (value: boolean) => void;
  isPopular: boolean;
  setIsPopular: (value: boolean) => void;
  isAvailable: boolean;
  setIsAvailable: (value: boolean) => void;
  isLoading: boolean;
}

const EditProductForm = ({
  product,
  onSubmit,
  onCancel,
  name,
  setName,
  description,
  setDescription,
  price,
  setPrice,
  category,
  setCategory,
  isNew,
  setIsNew,
  isPopular,
  setIsPopular,
  isAvailable,
  setIsAvailable,
  isLoading,
}: EditProductFormProps) => {
  const isMobile = useIsMobile();

  // حالات إدارة الصور
  const [uploadMethod, setUploadMethod] = useState<"url" | "file">("url");
  const [imageUrl, setImageUrl] = useState(product.image_url || "");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const imageData = {
      uploadMethod,
      imageUrl: uploadMethod === "url" ? imageUrl : undefined,
      selectedFile: uploadMethod === "file" ? selectedFile : null,
    };
    
    onSubmit(e, imageData);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl md:text-2xl">تعديل المنتج</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Accordion type="multiple" defaultValue={["basic-info", "product-image"]} className="w-full">
            <BasicInfoSection
              name={name}
              setName={setName}
              description={description}
              setDescription={setDescription}
              price={price}
              setPrice={setPrice}
              category={category}
              setCategory={setCategory}
            />

            <ImageSection
              currentImageUrl={product.image_url}
              uploadMethod={uploadMethod}
              setUploadMethod={setUploadMethod}
              imageUrl={imageUrl}
              setImageUrl={setImageUrl}
              selectedFile={selectedFile}
              setSelectedFile={setSelectedFile}
              previewUrl={previewUrl}
              setPreviewUrl={setPreviewUrl}
            />

            <ProductSettingsSection
              isNew={isNew}
              setIsNew={setIsNew}
              isPopular={isPopular}
              setIsPopular={setIsPopular}
              isAvailable={isAvailable}
              setIsAvailable={setIsAvailable}
            />
          </Accordion>

          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1"
              size={isMobile ? "sm" : "default"}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              حفظ التغييرات
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              size={isMobile ? "sm" : "default"}
            >
              <ArrowRight className="ml-2 h-3 w-3 md:h-4 md:w-4" />
              إلغاء
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default EditProductForm;
