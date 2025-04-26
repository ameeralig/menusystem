
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import { Folder, ImagePlus, Link, Upload } from "lucide-react";

interface CategorySelectorProps {
  existingCategories: string[];
  onCategorySelected: (category: string, imageUrl?: string) => void;
}

const CategorySelector = ({ existingCategories, onCategorySelected }: CategorySelectorProps) => {
  const [selectionType, setSelectionType] = useState<"existing" | "new">("existing");
  const [newCategory, setNewCategory] = useState("");
  const [uploadMethod, setUploadMethod] = useState<"file" | "url">("file");
  const [imageUrl, setImageUrl] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // إنشاء URL مؤقت لعرض الصورة (سيتم إزالته تلقائيًا عند تنظيف المكون)
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
    }
  };

  const handleSubmit = () => {
    if (selectionType === "existing" && selectedCategory) {
      onCategorySelected(selectedCategory);
    } else if (selectionType === "new" && newCategory) {
      const finalImageUrl = uploadMethod === "url" ? imageUrl : previewUrl;
      onCategorySelected(newCategory, finalImageUrl || undefined);
    }
  };

  return (
    <div className="space-y-6">
      <RadioGroup
        defaultValue="existing"
        onValueChange={(value) => setSelectionType(value as "existing" | "new")}
        className="grid gap-4"
      >
        <div className={cn(
          "flex items-center space-x-2 space-x-reverse border rounded-lg p-4",
          selectionType === "existing" ? "border-primary" : "border-gray-200"
        )}>
          <RadioGroupItem value="existing" id="existing" />
          <Label htmlFor="existing" className="flex items-center gap-2">
            <Folder className="h-4 w-4" />
            اختيار من التصنيفات الموجودة
          </Label>
        </div>
        <div className={cn(
          "flex items-center space-x-2 space-x-reverse border rounded-lg p-4",
          selectionType === "new" ? "border-primary" : "border-gray-200"
        )}>
          <RadioGroupItem value="new" id="new" />
          <Label htmlFor="new" className="flex items-center gap-2">
            <ImagePlus className="h-4 w-4" />
            إنشاء تصنيف جديد
          </Label>
        </div>
      </RadioGroup>

      {selectionType === "existing" && (
        <div className="space-y-4">
          <Label>اختر التصنيف</Label>
          <div className="grid grid-cols-2 gap-4">
            {existingCategories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                onClick={() => setSelectedCategory(category)}
                className="justify-start"
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
      )}

      {selectionType === "new" && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="categoryName">اسم التصنيف الجديد</Label>
            <Input
              id="categoryName"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="أدخل اسم التصنيف"
            />
          </div>

          <div className="space-y-2">
            <Label>صورة التصنيف</Label>
            <div className="flex gap-4">
              <Button
                type="button"
                variant={uploadMethod === "file" ? "default" : "outline"}
                onClick={() => setUploadMethod("file")}
                className="flex-1"
              >
                <Upload className="h-4 w-4 ml-2" />
                رفع صورة
              </Button>
              <Button
                type="button"
                variant={uploadMethod === "url" ? "default" : "outline"}
                onClick={() => setUploadMethod("url")}
                className="flex-1"
              >
                <Link className="h-4 w-4 ml-2" />
                رابط صورة
              </Link>
            </div>

            {uploadMethod === "url" ? (
              <Input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="أدخل رابط الصورة"
              />
            ) : (
              <div>
                <div 
                  onClick={() => document.getElementById('file-upload')?.click()}
                  className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
                >
                  {previewUrl ? (
                    <img 
                      src={previewUrl} 
                      alt="معاينة" 
                      className="max-h-48 mx-auto rounded-lg"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <ImagePlus className="h-12 w-12 text-muted-foreground" />
                      <p className="text-muted-foreground">اضغط هنا لاختيار صورة</p>
                    </div>
                  )}
                </div>
                <input
                  id="file-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
            )}
          </div>
        </div>
      )}

      <Button 
        onClick={handleSubmit}
        disabled={
          (selectionType === "existing" && !selectedCategory) ||
          (selectionType === "new" && !newCategory)
        }
        className="w-full"
      >
        متابعة
      </Button>
    </div>
  );
};

export default CategorySelector;
