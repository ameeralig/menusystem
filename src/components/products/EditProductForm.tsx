
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Star, TrendingUp, Loader2 } from "lucide-react";
import { Product } from "@/types/product";
import { Category } from "@/types/category";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface EditProductFormProps {
  product: Product | null;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  onCancel: () => void;
  name: string;
  setName: (value: string) => void;
  description: string;
  setDescription: (value: string) => void;
  price: string;
  setPrice: (value: string) => void;
  categoryId: string;
  setCategoryId: (value: string) => void;
  categories: Category[];
  isNew: boolean;
  setIsNew: (value: boolean) => void;
  isPopular: boolean;
  setIsPopular: (value: boolean) => void;
  isLoading?: boolean;
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
  categoryId,
  setCategoryId,
  categories,
  isNew,
  setIsNew,
  isPopular,
  setIsPopular,
  isLoading = false,
}: EditProductFormProps) => {
  if (!product) return null;

  return (
    <form onSubmit={onSubmit} className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>تعديل المنتج</CardTitle>
          <CardDescription>قم بتحديث معلومات المنتج من هنا</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">اسم المنتج</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="أدخل اسم المنتج"
                required
                className="text-right"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">وصف المنتج</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="أدخل وصف المنتج"
                className="min-h-[100px] text-right"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">السعر</Label>
                <Input
                  id="price"
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="أدخل السعر"
                  required
                  className="text-right"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="categoryId">التصنيف</Label>
                <Select value={categoryId} onValueChange={setCategoryId}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر التصنيف" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no-category">بدون تصنيف</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Separator className="my-4" />

          <div className="space-y-4">
            <h3 className="text-lg font-medium">خصائص المنتج</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center justify-between space-x-4 rtl:space-x-reverse">
                <Label htmlFor="is_new" className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  منتج جديد
                </Label>
                <Switch
                  id="is_new"
                  checked={isNew}
                  onCheckedChange={setIsNew}
                />
              </div>

              <div className="flex items-center justify-between space-x-4 rtl:space-x-reverse">
                <Label htmlFor="is_popular" className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-red-500" />
                  الأكثر طلباً
                </Label>
                <Switch
                  id="is_popular"
                  checked={isPopular}
                  onCheckedChange={setIsPopular}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-4 justify-end">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
          disabled={isLoading}
        >
          إلغاء
        </Button>
        <Button 
          type="submit"
          disabled={isLoading}
          className="min-w-[100px]"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "حفظ التغييرات"
          )}
        </Button>
      </div>
    </form>
  );
};

export default EditProductForm;
