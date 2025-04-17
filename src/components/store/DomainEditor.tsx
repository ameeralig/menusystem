
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Globe, Save } from "lucide-react";
import { useState } from "react";

interface DomainEditorProps {
  customDomain: string;
  setCustomDomain: (value: string) => void;
  isEditing: boolean;
  setIsEditing: (value: boolean) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  isLoading: boolean;
}

const DomainEditor = ({
  customDomain,
  setCustomDomain,
  isEditing,
  setIsEditing,
  handleSubmit,
  isLoading
}: DomainEditorProps) => {
  const [localDomain, setLocalDomain] = useState(customDomain);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCustomDomain(localDomain);
    await handleSubmit(e);
    setIsEditing(false);
  };

  return (
    <Card className="border-2 border-[#ffbcad] dark:border-[#ff9178]/40">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <Globe className="h-5 w-5 text-[#ff9178]" />
          <span>الدومين المخصص</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="flex items-center gap-4">
            <Input
              type="text"
              value={localDomain}
              onChange={(e) => {
                setLocalDomain(e.target.value.trim());
              }}
              placeholder="example.com"
              className="text-right flex-1 dir-ltr"
              disabled={!isEditing}
            />
            <Button
              type="button"
              variant={isEditing ? "destructive" : "outline"}
              onClick={() => {
                if (isEditing) {
                  setLocalDomain(customDomain);
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
                أدخل الدومين المخصص الخاص بك بدون http:// أو https://
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

export default DomainEditor;
