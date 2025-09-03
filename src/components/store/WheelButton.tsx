import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Gamepad2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface WheelButtonProps {
  slug: string;
  colorTheme?: string;
}

const WheelButton: React.FC<WheelButtonProps> = ({ slug, colorTheme }) => {
  const getThemeColors = (theme: string) => {
    const themes: { [key: string]: string } = {
      default: "bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800",
      coral: "bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600",
      purple: "bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600",
      blue: "bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600",
      green: "bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600",
      pink: "bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600",
      teal: "bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600",
      amber: "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600",
      indigo: "bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600",
      rose: "bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600"
    };
    return themes[theme] || themes.default;
  };

  const buttonColors = colorTheme ? getThemeColors(colorTheme) : getThemeColors('default');

  return (
    <motion.div
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ 
        duration: 0.6, 
        delay: 0.3,
        type: "spring",
        stiffness: 260,
        damping: 20
      }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <Link to={`/store/${slug}/wheel`}>
        <Button
          className={`${buttonColors} text-white shadow-lg relative overflow-hidden group`}
          size="lg"
        >
          {/* تأثير الوهج */}
          <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse" />
          
          {/* محتوى الزر */}
          <div className="relative flex items-center gap-2">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ 
                duration: 3,
                repeat: Infinity,
                ease: "linear"
              }}
            >
              <Gamepad2 className="w-5 h-5" />
            </motion.div>
            <span className="font-bold">عجلة الحظ</span>
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0] }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="text-lg"
            >
              🎡
            </motion.span>
          </div>
          
          {/* نجمات متحركة */}
          <motion.div
            className="absolute -top-1 -right-1"
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, 180, 360]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            ⭐
          </motion.div>
          
          <motion.div
            className="absolute -bottom-1 -left-1"
            animate={{ 
              scale: [1, 1.3, 1],
              rotate: [360, 180, 0]
            }}
            transition={{ 
              duration: 2.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.5
            }}
          >
            ✨
          </motion.div>
        </Button>
      </Link>
    </motion.div>
  );
};

export default WheelButton;