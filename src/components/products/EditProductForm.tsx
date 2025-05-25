
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Loader2, X } from "lucide-react";
import { Product } from "@/types/product";
import { useIsMobile } from "@/hooks/use-mobile";

interface EditProductFormProps {
  product: Product;
  onSubmit: (e: React.FormEvent) => void;
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

  return (
    <Card className="w-full max-w-2xl mx-auto">
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
        <form onSubmit={onSubmit} className="space-y-4 md:space-y-6">
          {product.image_url && (
            <div className="flex justify-center mb-4 md:mb-6">
              <img
                src={product.image_url}
                alt={product.name}
                className="w-32 h-32 md:w-48 md:h-48 object-cover rounded-lg border"
              />
            </div>
          )}

          <div className="grid gap-4 md:gap-6">
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

            <div className="grid gap-4">
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
          </div>

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
