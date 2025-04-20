
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Link2, Save } from "lucide-react";

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
  return (
    <Card className="border-2 border-[#ffbcad] dark:border-[#ff9178]/40">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <Link2 className="h-5 w-5 text-[#ff9178]" />
          <span>رابط المتجر</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
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
