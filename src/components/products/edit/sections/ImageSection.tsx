
import React from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ImageIcon } from "lucide-react";
import ImageUploadSection from "@/components/products/edit/ImageUploadSection";

interface ImageSectionProps {
  currentImageUrl: string | null;
  uploadMethod: "url" | "file";
  setUploadMethod: (method: "url" | "file") => void;
  imageUrl: string;
  setImageUrl: (url: string) => void;
  selectedFile: File | null;
  setSelectedFile: (file: File | null) => void;
  previewUrl: string | null;
  setPreviewUrl: (url: string | null) => void;
}

const ImageSection = (props: ImageSectionProps) => {
  return (
    <AccordionItem value="product-image">
      <AccordionTrigger className="text-right">
        <div className="flex items-center gap-2">
          <ImageIcon className="h-5 w-5" />
          <span>صورة المنتج</span>
        </div>
      </AccordionTrigger>
      <AccordionContent>
        <div className="pt-2">
          <ImageUploadSection {...props} />
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};

export default ImageSection;
