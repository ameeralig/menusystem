
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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

const ColorThemeSelector = ({ colorTheme, setColorTheme, isLoading }: ColorThemeSelectorProps) => {
  return (
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
  );
};

export default ColorThemeSelector;
