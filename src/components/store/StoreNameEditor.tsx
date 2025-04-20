
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Store, Save, Link2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface StoreNameEditorProps {
  storeName: string;
  setStoreName: (value: string) => void;
  storeSlug?: string;
  setStoreSlug?: (value: string) => void;
  isEditing: boolean;
  setIsEditing: (value: boolean) => void;
  handleSubmit: () => Promise<void>;
  isLoading: boolean;
}

const StoreNameEditor = ({
  storeName,
  setStoreName,
  storeSlug,
  setStoreSlug,
  isLoading,
  handleSubmit,
}: StoreNameEditorProps) => {
  const [showSlugPreview, setShowSlugPreview] = useState(false);
  const [slugError, setSlugError] = useState<string | null>(null);
  const { toast } = useToast();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!storeSlug && setStoreSlug) {
      setSlugError("يجب إدخال الرابط المخصص");
      return;
    }

    if (slugError) {
      toast({
        title: "خطأ في الرابط المخصص",
        description: slugError,
        variant: "destructive",
      });
      return;
    }

    await handleSubmit();
  };

  const validateSlug = async (slug: string) => {
    // التحقق من الشكل العام للرابط
    if (!/^[a-z0-9-]+$/.test(slug)) {
      return "يسمح فقط بالحروف الإنجليزية الصغيرة والأرقام والشرطات";
    }

    // التحقق من عدم وجود شرطتين متتاليتين
    if (slug.includes('--')) {
      return "لا يمكن استخدام شرطتين متتاليتين";
    }

    // التحقق من أن الرابط غير مستخدم
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return "يجب تسجيل الدخول أولاً";

      const { data: existingStore } = await supabase
        .from("store_settings")
        .select("user_id")
        .eq("slug", slug)
        .single();

      if (existingStore && existingStore.user_id !== user.id) {
        return "هذا الرابط مستخدم بالفعل";
      }
    } catch (error) {
      console.error("Error checking slug:", error);
      return "حدث خطأ أثناء التحقق من الرابط";
    }

    return null;
  };

  const handleSlugChange = async (value: string) => {
    if (setStoreSlug) {
      // تنظيف الرابط من الأحرف غير المسموح بها
      const sanitizedSlug = value.toLowerCase()
        .replace(/[^a-z0-9-]/g, '')
        .replace(/--+/g, '-');
      
      setStoreSlug(sanitizedSlug);
      
      if (sanitizedSlug) {
        const error = await validateSlug(sanitizedSlug);
        setSlugError(error);
      } else {
        setSlugError("الرابط المخصص مطلوب");
      }
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
              required
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
                  placeholder="ادخل رابط المتجر المميز (مثال: mado)"
                  className="text-left pl-10"
                  onFocus={() => setShowSlugPreview(true)}
                  onBlur={() => setShowSlugPreview(false)}
                  required
                />
                <Link2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
              {slugError && (
                <p className="text-sm text-red-500 text-right mt-1">{slugError}</p>
              )}
              <p className="text-sm text-gray-500 text-right mt-1 ltr">
                رابط متجرك سيكون: https://qrmenuc.com/ar/p/{storeSlug || 'your-store'}
              </p>
            </div>
          )}

          <Button 
            type="submit" 
            className="w-full bg-[#ff9178] hover:bg-[#ff7d61] text-white"
            disabled={isLoading || !!slugError}
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
