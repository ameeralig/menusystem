
import { createContext, useContext, useEffect, useState } from "react";

export type ThemeMode = "dark" | "light" | "system";

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: ThemeMode;
  storageKey?: string;
}

interface ThemeContextProps {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "preview-theme",
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<ThemeMode>(
    () => (localStorage.getItem(storageKey) as ThemeMode) || defaultTheme
  );

  useEffect(() => {
    const root = window.document.documentElement;

    root.classList.remove("light", "dark");

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }

    localStorage.setItem(storageKey, theme);
  }, [theme, storageKey]);

  // استمع إلى تغييرات في تفضيلات النظام
  useEffect(() => {
    if (theme !== "system") return;

    function onSystemThemeChange() {
      const root = window.document.documentElement;
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";

      root.classList.remove("light", "dark");
      root.classList.add(systemTheme);
    }

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    mediaQuery.addEventListener("change", onSystemThemeChange);
    
    return () => mediaQuery.removeEventListener("change", onSystemThemeChange);
  }, [theme]);

  const value = {
    theme,
    setTheme,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export const useTheme = (): ThemeContextProps => {
  const context = useContext(ThemeContext);
  
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  
  return context;
};
