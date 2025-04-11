
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Store, Save } from "lucide-react";

interface StoreNameEditorProps {
  storeName: string;
  setStoreName: (value: string) => void;
  isEditing: boolean;
  setIsEditing: (value: boolean) => void;
  handleSubmit: () => Promise<void>;
  isLoading: boolean;
}

const StoreNameEditor = ({
  storeName,
  setStoreName,
  isLoading,
  handleSubmit
}: StoreNameEditorProps) => {
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleSubmit();
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
