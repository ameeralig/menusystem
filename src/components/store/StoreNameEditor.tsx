import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Store, Save } from "lucide-react";

interface StoreNameEditorProps {
  storeName: string;
  setStoreName: (value: string) => void;
  isEditing: boolean;
  setIsEditing: (value: boolean) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  isLoading: boolean;
}

const StoreNameEditor = ({
  storeName,
  setStoreName,
  isEditing,
  setIsEditing,
  handleSubmit,
  isLoading
}: StoreNameEditorProps) => {
  return (
    <Card className="border-2 border-purple-100 dark:border-purple-900">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <Store className="h-5 w-5 text-purple-500" />
          <span>اسم المتجر</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center gap-4">
            <Input
              type="text"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              placeholder="أدخل اسم المتجر"
              className="text-right flex-1"
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
            <Button 
              type="submit" 
              className="w-full bg-purple-600 hover:bg-purple-700"
              disabled={isLoading}
            >
              <Save className="ml-2 h-4 w-4" />
              {isLoading ? "جاري الحفظ..." : "حفظ التغييرات"}
            </Button>
          )}
        </form>
      </CardContent>
    </Card>
  );
};

export default StoreNameEditor;