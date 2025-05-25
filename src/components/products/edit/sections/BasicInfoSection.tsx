
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Package } from "lucide-react";

interface BasicInfoSectionProps {
  name: string;
  setName: (value: string) => void;
  description: string;
  setDescription: (value: string) => void;
  price: string;
  setPrice: (value: string) => void;
  category: string;
  setCategory: (value: string) => void;
}

const BasicInfoSection = ({
  name,
  setName,
  description,
  setDescription,
  price,
  setPrice,
  category,
  setCategory,
}: BasicInfoSectionProps) => {
  return (
    <AccordionItem value="basic-info">
      <AccordionTrigger className="text-right">
        <div className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          <span>المعلومات الأساسية</span>
        </div>
      </AccordionTrigger>
      <AccordionContent>
        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-right block">
              اسم المنتج
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="text-right"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-right block">
              الوصف
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="text-right min-h-20"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price" className="text-right block">
                السعر (د.ع)
              </Label>
              <Input
                id="price"
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="text-right"
                min="0"
                step="0.01"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category" className="text-right block">
                التصنيف
              </Label>
              <Input
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="text-right"
              />
            </div>
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};

export default BasicInfoSection;
