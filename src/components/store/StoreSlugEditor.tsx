
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Link2, Save } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface StoreSlugEditorProps {
  storeSlug: string;
  setStoreSlug: (value: string) => void;
  isEditing: boolean;
  setIsEditing: (value: boolean) => void;
  handleSubmit: () => Promise<void>;
  isLoading: boolean;
}

const StoreSlugEditor = ({
  storeSlug,
  setStoreSlug,
  isEditing,
  setIsEditing,
  handleSubmit,
  isLoading
}: StoreSlugEditorProps) => {
  const [slugError, setSlugError] = useState<string | null>(null);
  const { toast } = useToast();

  const validateSlug = async (slug: string) => {
    if (!slug) {
      setSlugError("الرابط المخصص مطلوب");
      return false;
    }

    // التحقق من الشكل العام للرابط
    if (!/^[a-z0-9-]+$/.test(slug)) {
      setSlugError("يسمح فقط بالحروف الإنجليزية الصغيرة والأرقام والشرطات");
      return false;
    }

    // التحقق من عدم وجود شرطتين متتاليتين
    if (slug.includes('--')) {
      setSlugError("لا يمكن استخدام شرطتين متتاليتين");
      return false;
    }

    // التحقق من أن الرابط غير مستخدم
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
  };

  return (
    <Card className="border-2 border-[#ffbcad] dark:border-[#ff9178]/40">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <Link2 className="h-5 w-5 text-[#ff9178]" />
          <span>رابط المتجر</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onFormSubmit} className="space-y-4">
          <div className="flex items-center gap-4">
            <Input
              type="text"
              value={storeSlug}
              onChange={(e) => {
                // تحويل النص إلى حروف صغيرة وإزالة المسافات والرموز الخاصة
                const value = e.target.value
                  .toLowerCase()
                  .replace(/[^a-z0-9-]/g, '')
                  .replace(/\s+/g, '-');
                setStoreSlug(value);
              }}
              placeholder="ادخل رابط المتجر المميز"
              className="text-right flex-1 dir-ltr"
              disabled={!isEditing}
            />
            <Button
              type="button"
              variant={isEditing ? "destructive" : "outline"}
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? "إلغاء" : "تعديل"}
            </Button>
          </div>

          {isEditing && (
            <>
              <p className="text-sm text-gray-500 text-right">
                سيكون رابط متجرك: https://qrmenuc.com/{storeSlug || 'your-store'}
              </p>
              {slugError && (
                <p className="text-sm text-red-500 text-right">{slugError}</p>
              )}
              <Button 
                type="submit" 
                className="w-full bg-[#ff9178] hover:bg-[#ff7d61] text-white"
                disabled={isLoading}
              >
                <Save className="ml-2 h-4 w-4" />
                {isLoading ? "جاري الحفظ..." : "حفظ التغييرات"}
              </Button>
            </>
          )}
        </form>
      </CardContent>
    </Card>
  );
};

export default StoreSlugEditor;
