
import React from "react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Settings } from "lucide-react";

interface ProductSettingsSectionProps {
  isNew: boolean;
  setIsNew: (value: boolean) => void;
  isPopular: boolean;
  setIsPopular: (value: boolean) => void;
  isAvailable: boolean;
  setIsAvailable: (value: boolean) => void;
}

const ProductSettingsSection = ({
  isNew,
  setIsNew,
  isPopular,
  setIsPopular,
  isAvailable,
  setIsAvailable,
}: ProductSettingsSectionProps) => {
  return (
    <AccordionItem value="product-settings">
      <AccordionTrigger className="text-right">
        <div className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          <span>إعدادات المنتج</span>
        </div>
      </AccordionTrigger>
      <AccordionContent>
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <Label htmlFor="is-new" className="text-sm font-medium">
              منتج جديد
            </Label>
            <Switch
              id="is-new"
              checked={isNew}
              onCheckedChange={setIsNew}
            />
          </div>

          <div className="flex items-center justify-between p-3 border rounded-lg">
            <Label htmlFor="is-popular" className="text-sm font-medium">
              الأكثر طلباً
            </Label>
            <Switch
              id="is-popular"
              checked={isPopular}
              onCheckedChange={setIsPopular}
            />
          </div>

          <div className="flex items-center justify-between p-3 border rounded-lg">
            <Label htmlFor="is-available" className="text-sm font-medium">
              متوفر
            </Label>
            <Switch
              id="is-available"
              checked={isAvailable}
              onCheckedChange={setIsAvailable}
            />
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};

export default ProductSettingsSection;
