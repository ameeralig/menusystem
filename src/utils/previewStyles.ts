
import { CSSProperties } from "react";

export const getBackgroundStyle = (colorTheme: string | null, darkMode: boolean = false): CSSProperties => {
  console.log("تطبيق اللون على الخلفية:", colorTheme);
  
  // إذا كان اللون مخصص (يبدأ بـ #)
  if (colorTheme && colorTheme.startsWith('#')) {
    const hex = colorTheme.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    return {
      background: darkMode 
        ? `linear-gradient(135deg, rgba(${r}, ${g}, ${b}, 0.15) 0%, rgba(${r}, ${g}, ${b}, 0.25) 100%)`
        : `linear-gradient(135deg, rgba(${r}, ${g}, ${b}, 0.08) 0%, rgba(${r}, ${g}, ${b}, 0.18) 100%)`,
      transition: 'all 0.3s ease-in-out'
    };
  }
  
  // الألوان المحددة مسبقاً
  return {
    transition: 'all 0.3s ease-in-out'
  };
};

export const getThemeClasses = (colorTheme: string | null, darkMode: boolean = false): string => {
  const baseClasses = darkMode ? 'dark' : '';
  
  // إذا كان اللون مخصص، لا نحتاج كلاسات إضافية
  if (colorTheme && colorTheme.startsWith('#')) {
    return `${baseClasses} transition-all duration-300`;
  }
  
  // استخدام الألوان المحددة مسبقاً
  switch (colorTheme) {
    case 'coral':
      return `${baseClasses} bg-gradient-to-br from-[#fff5f2] to-[#ffede9] dark:from-[#ff9178]/10 dark:to-[#ff9178]/20 transition-all duration-300`;
    case 'purple':
      return `${baseClasses} bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-900/30 transition-all duration-300`;
    case 'blue':
      return `${baseClasses} bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/30 transition-all duration-300`;
    case 'green':
      return `${baseClasses} bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-900/30 transition-all duration-300`;
    case 'pink':
      return `${baseClasses} bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-900/20 dark:to-pink-900/30 transition-all duration-300`;
    case 'teal':
      return `${baseClasses} bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-900/20 dark:to-teal-900/30 transition-all duration-300`;
    case 'amber':
      return `${baseClasses} bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-900/30 transition-all duration-300`;
    case 'indigo':
      return `${baseClasses} bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-900/30 transition-all duration-300`;
    case 'rose':
      return `${baseClasses} bg-gradient-to-br from-rose-50 to-rose-100 dark:from-rose-900/20 dark:to-rose-900/30 transition-all duration-300`;
    default:
      return `${baseClasses} bg-gray-50 dark:bg-gray-900 transition-all duration-300`;
  }
};
