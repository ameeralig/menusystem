
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Store, Save, Link2 } from "lucide-react";
import { useState } from "react";

interface StoreNameEditorProps {
  storeName: string;
  setStoreName: (value: string) => void;
  isEditing: boolean;
  setIsEditing: (value: boolean) => void;
  handleSubmit: () => Promise<void>;
  isLoading: boolean;
  storeSlug?: string;
  setStoreSlug?: (value: string) => void;
  slugError?: string;
}

const StoreNameEditor = ({
  storeName,
  setStoreName,
  storeSlug,
  setStoreSlug,
  isLoading,
  handleSubmit,
  slugError
}: StoreNameEditorProps) => {
  const [showSlugPreview, setShowSlugPreview] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleSubmit();
  };

  const handleSlugChange = (value: string) => {
    if (setStoreSlug) {
      // تحويل النص إلى حروف صغيرة وإزالة الأحرف غير المسموح بها
      const sanitized = value.toLowerCase()
        .replace(/[^a-z0-9-]/g, '')
        .replace(/--+/g, '-'); // تحويل الشرطات المتعددة إلى شرطة واحدة
      setStoreSlug(sanitized);
    }
  };

  return (
    <Card className="border-2 border-[#ffbcad] dark:border-[#ff9178]/40">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <Store className="h-5 w-5 text-[#ff9178]" />
          <span>اسم المتجر</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="block text-right text-sm text-gray-600 dark:text-gray-400">
              أدخل اسم المتجر الخاص بك
            </label>
            <Input
              type="text"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              placeholder="أدخل اسم المتجر"
              className="text-right"
            />
          </div>

          {setStoreSlug && (
            <div className="space-y-2">
              <label className="block text-right text-sm text-gray-600 dark:text-gray-400">
                رابط المتجر المخصص
              </label>
              <div className="relative">
                <Input
                  type="text"
                  value={storeSlug || ""}
                  onChange={(e) => handleSlugChange(e.target.value)}
                  placeholder="ادخل رابط المتجر المميز"
                  className="text-left pl-10"
                  onFocus={() => setShowSlugPreview(true)}
                  onBlur={() => setShowSlugPreview(false)}
                />
                <Link2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
              {slugError && (
                <p className="text-sm text-red-500 text-right">{slugError}</p>
              )}
              {showSlugPreview && (
                <p className="text-sm text-gray-500 text-left">
                  /ar/p/{storeSlug || 'your-store'}
                </p>
              )}
            </div>
          )}

          <Button 
            type="submit" 
            className="w-full bg-[#ff9178] hover:bg-[#ff7d61] text-white"
            disabled={isLoading}
          >
            <Save className="ml-2 h-4 w-4" />
            {isLoading ? "جاري الحفظ..." : "حفظ التغييرات"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default StoreNameEditor;
