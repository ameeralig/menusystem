
import { motion } from "framer-motion";
import { Palette, Check } from "lucide-react";

interface ColorPreviewCardProps {
  currentColor: string;
  isActive?: boolean;
}

const ColorPreviewCard = ({ currentColor, isActive = false }: ColorPreviewCardProps) => {
  const getColorName = (hex: string): string => {
    // قاموس بسيط لأسماء الألوان الشائعة
    const colorNames: { [key: string]: string } = {
      '#ff9178': 'مرجاني دافئ',
      '#8B5CF6': 'بنفسجي',
      '#3B82F6': 'أزرق ملكي',
      '#10B981': 'أخضر زمردي',
      '#EC4899': 'وردي',
      '#14B8A6': 'فيروزي',
      '#F59E0B': 'كهرماني',
      '#6366F1': 'نيلي',
      '#F43F5E': 'وردي فاتح',
    };
    
    return colorNames[hex] || 'لون مخصص';
  };

  const getContrastColor = (hex: string): string => {
    // تحويل hex إلى RGB
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    
    // حساب السطوع
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    
    return brightness > 128 ? '#000000' : '#ffffff';
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      className="relative overflow-hidden rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm"
    >
      {/* عرض اللون */}
      <div 
        className="h-24 relative flex items-center justify-center"
        style={{ backgroundColor: currentColor }}
      >
        {isActive && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div 
              className="p-2 rounded-full shadow-lg"
              style={{ 
                backgroundColor: getContrastColor(currentColor),
                color: currentColor
              }}
            >
              <Check className="h-6 w-6" />
            </div>
          </motion.div>
        )}
        
        {/* تأثير متدرج */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            background: `linear-gradient(135deg, ${currentColor}00 0%, ${currentColor}ff 100%)`
          }}
        />
      </div>

      {/* معلومات اللون */}
      <div className="p-4 space-y-2">
        <div className="flex items-center gap-2">
          <Palette className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {getColorName(currentColor)}
          </span>
        </div>
        
        <div className="space-y-1">
          <div className="text-xs text-gray-600 dark:text-gray-400">
            كود اللون: <span className="font-mono font-medium">{currentColor}</span>
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">
            RGB: <span className="font-mono">{hexToRgb(currentColor)}</span>
          </div>
        </div>

        {isActive && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="pt-2 border-t border-gray-200 dark:border-gray-600"
          >
            <div className="text-xs text-green-600 dark:text-green-400 font-medium flex items-center gap-1">
              <Check className="h-3 w-3" />
              اللون النشط حالياً
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

// دالة مساعدة لتحويل HEX إلى RGB
const hexToRgb = (hex: string): string => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (result) {
    const r = parseInt(result[1], 16);
    const g = parseInt(result[2], 16);
    const b = parseInt(result[3], 16);
    return `${r}, ${g}, ${b}`;
  }
  return "غير محدد";
};

export default ColorPreviewCard;
