
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Palette, Save } from "lucide-react";

export const colorThemes = [
  { id: "default", name: "الافتراضي", value: "default" },
  { id: "coral", name: "مرجاني", value: "coral" },
  { id: "purple", name: "بنفسجي", value: "purple" },
  { id: "blue", name: "أزرق", value: "blue" },
  { id: "green", name: "أخضر", value: "green" },
  { id: "pink", name: "وردي", value: "pink" },
  { id: "teal", name: "فيروزي", value: "teal" },
  { id: "amber", name: "كهرماني", value: "amber" },
  { id: "indigo", name: "نيلي", value: "indigo" },
  { id: "rose", name: "وردي فاتح", value: "rose" }
];

interface ColorThemeSelectorProps {
  colorTheme: string;
  setColorTheme: (value: string) => void;
  isLoading: boolean;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
}

const ColorThemeSelector = ({ colorTheme, setColorTheme, isLoading, handleSubmit }: ColorThemeSelectorProps) => {
  return (
    <Card className="border-2 border-[#ffbcad] dark:border-[#ff9178]/40">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <Palette className="h-5 w-5 text-[#ff9178]" />
          <span>مظهر المتجر</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="block text-right text-sm text-gray-600 dark:text-gray-400">
              اختر لون المتجر
            </label>
            <Select
              value={colorTheme}
              onValueChange={setColorTheme}
              disabled={isLoading}
            >
              <SelectTrigger className="w-full text-right">
                <SelectValue placeholder="اختر لون المتجر" />
              </SelectTrigger>
              <SelectContent>
                {colorThemes.map((theme) => (
                  <SelectItem
                    key={theme.id}
                    value={theme.value}
                    className="text-right"
                  >
                    {theme.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="grid grid-cols-5 gap-2 mt-4">
              {colorThemes.map((theme) => (
                <div
                  key={theme.id}
                  className={`w-full h-8 rounded-md cursor-pointer border-2 ${
                    colorTheme === theme.value ? 'border-[#ff9178]' : 'border-transparent'
                  }`}
                  style={{
                    background: theme.id === "coral" ? "#ff9178" : `var(--${theme.value}-500)`,
                  }}
                  onClick={() => setColorTheme(theme.value)}
                />
              ))}
            </div>
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

export default ColorThemeSelector;
