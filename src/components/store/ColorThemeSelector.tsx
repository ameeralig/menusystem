
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";

interface ColorThemeSelectorProps {
  colorTheme: string;
  setColorTheme: (theme: string) => void;
  isLoading?: boolean;
  handleSubmit?: (e: React.FormEvent) => Promise<void>;
}

const themeOptions = [
  { id: "default", name: "الافتراضي", bgClass: "bg-gray-100" },
  { id: "green", name: "أخضر", bgClass: "bg-green-100" },
  { id: "blue", name: "أزرق", bgClass: "bg-blue-100" },
  { id: "purple", name: "بنفسجي", bgClass: "bg-purple-100" },
  { id: "red", name: "أحمر", bgClass: "bg-red-100" },
  { id: "yellow", name: "أصفر", bgClass: "bg-yellow-100" },
];

const ColorThemeSelector = ({ 
  colorTheme,
  setColorTheme,
  isLoading,
  handleSubmit 
}: ColorThemeSelectorProps) => {
  
  const [isEditing, setIsEditing] = useState(false);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleThemeSelect = (themeId: string) => {
    setColorTheme(themeId);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <span className="text-gray-700 dark:text-gray-300">اختر سمة المتجر</span>
        {!isEditing && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleEdit}
            className="h-8 w-8 p-0"
          >
            <Pencil className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2">
        {themeOptions.map(theme => (
          <div
            key={theme.id}
            onClick={() => isEditing && handleThemeSelect(theme.id)}
            className={`
              rounded-md p-2 text-center cursor-pointer border-2 transition-all
              ${isEditing ? "hover:border-primary" : ""}
              ${theme.bgClass} 
              ${colorTheme === theme.id ? "border-primary shadow-sm" : "border-transparent"}
              ${!isEditing && "opacity-80 cursor-not-allowed"}
            `}
          >
            <span className="text-sm font-medium">{theme.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ColorThemeSelector;
