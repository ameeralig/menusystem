
import { Moon, Sun, Laptop } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";
import { useEffect, useState } from "react";

export type ThemeMode = "dark" | "light" | "system";

interface ThemeToggleProps {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
}

export function ThemeToggle({ theme, setTheme }: ThemeToggleProps) {
  const [mounted, setMounted] = useState(false);

  // ضمان أن الكود يعمل فقط على جانب العميل
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="flex items-center justify-end gap-2">
      <span className="text-sm text-muted-foreground ml-2">المظهر:</span>
      <div className="flex items-center rounded-lg border border-input bg-transparent p-1">
        <Toggle
          pressed={theme === "light"}
          onPressedChange={() => setTheme("light")}
          size="sm"
          className="data-[state=on]:bg-background data-[state=on]:text-foreground"
          title="وضع فاتح"
        >
          <Sun className="h-4 w-4" />
        </Toggle>
        <Toggle
          pressed={theme === "system"}
          onPressedChange={() => setTheme("system")}
          size="sm"
          className="data-[state=on]:bg-background data-[state=on]:text-foreground"
          title="تلقائي حسب الجهاز"
        >
          <Laptop className="h-4 w-4" />
        </Toggle>
        <Toggle
          pressed={theme === "dark"}
          onPressedChange={() => setTheme("dark")}
          size="sm"
          className="data-[state=on]:bg-background data-[state=on]:text-foreground"
          title="وضع داكن"
        >
          <Moon className="h-4 w-4" />
        </Toggle>
      </div>
    </div>
  );
}
