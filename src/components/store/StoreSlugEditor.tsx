
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Link2, Save } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

interface StoreSlugEditorProps {
  storeSlug: string;
  setStoreSlug: (value: string) => void;
  isEditing: boolean;
  setIsEditing: (value: boolean) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
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
  const [localStoreSlug, setLocalStoreSlug] = useState(storeSlug);
  const { toast } = useToast();

  // تحديث القيمة المحلية عند تغيير القيمة الخارجية
  useEffect(() => {
    setLocalStoreSlug(storeSlug);
  }, [storeSlug]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!localStoreSlug.trim()) {
      toast({
        title: "خطأ",
        description: "يجب تعيين نطاق فرعي لمتجرك",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }
    
    // التحقق من أن النطاق الفرعي يحتوي على أحرف صالحة فقط
    if (!/^[a-z0-9-]+$/.test(localStoreSlug)) {
      toast({
        title: "خطأ",
        description: "النطاق الفرعي يجب أن يحتوي على أحرف إنجليزية صغيرة وأرقام وشرطات فقط",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }
    
    setStoreSlug(localStoreSlug);
    await handleSubmit(e);
    setIsEditing(false);
  };

  return (
    <Card className="border-2 border-[#ffbcad] dark:border-[#ff9178]/40">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <Link2 className="h-5 w-5 text-[#ff9178]" />
          <span>النطاق الفرعي المخصص للمتجر</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="flex items-center gap-4">
            <Input
              type="text"
              value={localStoreSlug}
              onChange={(e) => {
                // تحويل النص إلى حروف صغيرة وإزالة المسافات والرموز الخاصة
                const value = e.target.value
                  .toLowerCase()
                  .replace(/[^a-z0-9-]/g, '')
                  .replace(/\s+/g, '-');
                setLocalStoreSlug(value);
              }}
              placeholder="أدخل النطاق الفرعي لمتجرك (مثل: almadina)"
              className="text-right flex-1 dir-ltr"
              disabled={!isEditing}
            />
            <Button
              type="button"
              variant={isEditing ? "destructive" : "outline"}
              onClick={() => {
                if (isEditing) {
                  setLocalStoreSlug(storeSlug); // إعادة ضبط القيمة المحلية عند الإلغاء
                }
                setIsEditing(!isEditing);
              }}
            >
              {isEditing ? "إلغاء" : "تعديل"}
            </Button>
          </div>

          {isEditing && (
            <>
              <p className="text-sm text-gray-500 text-right">
                سيكون رابط متجرك: <span className="font-bold dir-ltr inline-block">{localStoreSlug || 'your-store'}.qrmenuc.com</span>
              </p>
              <div className="text-sm text-amber-600 mt-2 mb-2 bg-amber-50 p-2 rounded-md border border-amber-200">
                <p className="text-right">
                  ملاحظة مهمة: بمجرد حفظ النطاق الفرعي، سيصبح هو الطريقة الوحيدة للوصول إلى صفحة المنتجات الخاصة بك.
                </p>
              </div>
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
