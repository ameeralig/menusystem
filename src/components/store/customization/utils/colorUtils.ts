
import { colorThemes } from "../color-picker/colorThemes";

// دالة مساعدة للحصول على اللون المناسب للنص بناءً على لون الخلفية
export const getContrastColor = (hexColor: string): string => {
  // تحويل اللون السداسي إلى RGB
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);
  
  // حساب السطوع باستخدام صيغة YIQ
  const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
  
  // إذا كان لون الخلفية فاتحاً، استخدم نص داكن والعكس صحيح
  return (yiq >= 128) ? '#000000' : '#ffffff';
};

// دالة للحصول على اسم اللون المختار
export const getColorName = (hexColor: string, selectedTheme: string): string => {
  const theme = colorThemes.find(theme => theme.value === selectedTheme);
  if (theme) {
    return theme.name;
  }
  
  const themeByHex = colorThemes.find(theme => theme.hex.toLowerCase() === hexColor.toLowerCase());
  if (themeByHex) {
    return themeByHex.name;
  }
  
  return "لون مخصص";
};
