
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Moon, Sun, Laptop, Save } from "lucide-react";
import { Toggle } from "@/components/ui/toggle";
import { ThemeMode } from "@/components/store/ThemeProvider";

interface ThemeToggleSectionProps {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  isLoading: boolean;
  handleSubmit: () => Promise<void>;
}

const ThemeToggleSection = ({ 
  mode, 
  setMode, 
  isLoading, 
  handleSubmit 
}: ThemeToggleSectionProps) => {
  return (
    <Card className="border-2 border-[#ffbcad] dark:border-[#ff9178]/40 mb-6">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <Moon className="h-5 w-5 text-[#ff9178]" />
          <span>الوضع الداكن / الفاتح</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <label className="block text-right text-sm text-gray-600 dark:text-gray-400 mb-2">
              اختر وضع العرض
            </label>
            <div className="flex items-center justify-end gap-2">
              <div className="flex items-center rounded-lg border border-input bg-transparent p-1">
                <Toggle
                  pressed={mode === "light"}
                  onPressedChange={() => setMode("light")}
                  size="sm"
                  className="p-2 data-[state=on]:bg-background data-[state=on]:text-foreground"
                >
                  <Sun className="h-4 w-4 ml-2" />
                  <span>فاتح</span>
                </Toggle>
                <Toggle
                  pressed={mode === "system"}
                  onPressedChange={() => setMode("system")}
                  size="sm"
                  className="p-2 data-[state=on]:bg-background data-[state=on]:text-foreground"
                >
                  <Laptop className="h-4 w-4 ml-2" />
                  <span>تلقائي</span>
                </Toggle>
                <Toggle
                  pressed={mode === "dark"}
                  onPressedChange={() => setMode("dark")}
                  size="sm"
                  className="p-2 data-[state=on]:bg-background data-[state=on]:text-foreground"
                >
                  <Moon className="h-4 w-4 ml-2" />
                  <span>داكن</span>
                </Toggle>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-right">
              اختر الوضع المناسب لمتجرك: الداكن، الفاتح، أو التلقائي (حسب إعدادات جهاز المستخدم)
            </p>
          </div>

          <Button
            type="button"
            onClick={handleSubmit}
            className="w-full bg-[#ff9178] hover:bg-[#ff7d61] text-white"
            disabled={isLoading}
          >
            <Save className="ml-2 h-4 w-4" />
            {isLoading ? "جاري الحفظ..." : "حفظ التغييرات"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ThemeToggleSection;
