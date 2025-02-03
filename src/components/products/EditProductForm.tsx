import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Star, TrendingUp } from "lucide-react";
import { Product } from "@/types/product";

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
  category: string;
  setCategory: (value: string) => void;
  isNew: boolean;
  setIsNew: (value: boolean) => void;
  isPopular: boolean;
  setIsPopular: (value: boolean) => void;
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
}: EditProductFormProps) => {
  if (!product) return null;

  return (
    <form onSubmit={onSubmit} className="max-w-md mx-auto space-y-4 mb-8">
      <div>
        <label htmlFor="name" className="block text-sm font-medium mb-1">اسم المنتج</label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      
      <div>
        <label htmlFor="description" className="block text-sm font-medium mb-1">وصف المنتج</label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      
      <div>
        <label htmlFor="price" className="block text-sm font-medium mb-1">السعر</label>
        <Input
          id="price"
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
        />
      </div>
      
      <div>
        <label htmlFor="category" className="block text-sm font-medium mb-1">التصنيف</label>
        <Input
          id="category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between space-x-4">
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <Switch
              id="is_new"
              checked={isNew}
              onCheckedChange={setIsNew}
            />
            <label htmlFor="is_new" className="flex items-center gap-2">
              <Star className="h-4 w-4 text-yellow-500" />
              منتج جديد
            </label>
          </div>
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <Switch
              id="is_popular"
              checked={isPopular}
              onCheckedChange={setIsPopular}
            />
            <label htmlFor="is_popular" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-red-500" />
              الأكثر طلباً
            </label>
          </div>
        </div>
      </div>
      
      <div className="flex gap-2">
        <Button type="submit" className="flex-1">حفظ التغييرات</Button>
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
          className="flex-1"
        >
          إلغاء
        </Button>
      </div>
    </form>
  );
};

export default EditProductForm;