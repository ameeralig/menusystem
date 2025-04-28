
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
  storeSlug: string;
  setStoreSlug: (value: string) => void;
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
  isEditing,
  setIsEditing,
  handleSubmit,
  isLoading
}: StoreNameEditorProps) => {
  const [slugError, setSlugError] = useState<string | null>(null);
  const [isSlugPristine, setIsSlugPristine] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const checkSlug = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: settings } = await supabase
        .from("store_settings")
        .select("slug")
        .eq("user_id", user.id)
        .maybeSingle();

      if (settings?.slug) {
        setStoreSlug(settings.slug);
        setIsSlugPristine(false);
      }
    };

    checkSlug();
  }, [setStoreSlug]);

  const validateSlug = async (slug: string) => {
    if (!slug) {
      setSlugError("الرابط المخصص مطلوب");
      return false;
    }

    if (!/^[a-z0-9-]+$/.test(slug)) {
      setSlugError("يسمح فقط بالحروف الإنجليزية الصغيرة والأرقام والشرطات");
      return false;
    }

    if (slug.includes('--')) {
      setSlugError("لا يمكن استخدام شرطتين متتاليتين");
      return false;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setSlugError("يجب تسجيل الدخول أولاً");
        return false;
      }

      const { data: existingStore } = await supabase
        .from("store_settings")
        .select("user_id")
        .eq("slug", slug)
        .maybeSingle();

      if (existingStore && existingStore.user_id !== user.id) {
        setSlugError("هذا الرابط مستخدم بالفعل");
        return false;
      }
    } catch (error) {
      console.error("Error checking slug:", error);
      setSlugError("حدث خطأ أثناء التحقق من الرابط");
      return false;
    }

    setSlugError(null);
    return true;
  };

  const onFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isSlugPristine) {
      // إذا كان الرابط قد تم حفظه مسبقاً، نقوم فقط بحفظ اسم المتجر
      await handleSubmit();
      return;
    }

    const isValid = await validateSlug(storeSlug);
    if (!isValid) {
      toast({
        title: "خطأ في الرابط المخصص",
        description: slugError,
        variant: "destructive",
      });
      return;
    }

    await handleSubmit();
    setIsSlugPristine(false);
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
        <form onSubmit={onFormSubmit} className="space-y-4">
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

          {isSlugPristine && (
            <div className="space-y-2">
              <label className="block text-right text-sm text-gray-600 dark:text-gray-400">
                رابط المتجر المخصص (سيتم حفظه مرة واحدة فقط)
              </label>
              <div className="relative">
                <Input
                  type="text"
                  value={storeSlug}
                  onChange={(e) => {
                    const value = e.target.value
                      .toLowerCase()
                      .replace(/[^a-z0-9-]/g, '')
                      .replace(/\s+/g, '-');
                    setStoreSlug(value);
                  }}
                  placeholder="ادخل رابط المتجر المميز (مثال: mado)"
                  className="text-left pl-10"
                  required
                />
                <Link2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
              {slugError && (
                <p className="text-sm text-red-500 text-right mt-1">{slugError}</p>
              )}
              <p className="text-sm text-gray-500 text-right mt-1 ltr">
                رابط متجرك سيكون: https://qrmenuc.com/{storeSlug || 'your-store'}
              </p>
              <p className="text-sm text-amber-500 text-right mt-1">
                ملاحظة: لا يمكن تغيير الرابط بعد حفظه
              </p>
            </div>
          )}

          {!isSlugPristine && (
            <div className="space-y-2">
              <p className="text-sm text-gray-500 text-right mt-1 ltr">
                رابط متجرك: https://qrmenuc.com/{storeSlug}
              </p>
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
