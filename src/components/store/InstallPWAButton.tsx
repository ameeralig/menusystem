import { Download, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePWAInstall } from "@/hooks/usePWAInstall";
import { motion, AnimatePresence } from "framer-motion";

interface InstallPWAButtonProps {
  colorTheme?: string | null;
  storeName?: string;
}

const InstallPWAButton = ({ colorTheme, storeName }: InstallPWAButtonProps) => {
  const { canInstall, isInstalled, handleInstall } = usePWAInstall();

  // إذا كان التطبيق مثبت أو لا يمكن تثبيته، لا نعرض الزر
  if (isInstalled || !canInstall) {
    return null;
  }

  const getThemeColor = (theme: string | null | undefined) => {
    if (theme && theme.startsWith('#')) {
      return theme;
    }
    
    const themeColors: Record<string, string> = {
      coral: '#ff9178',
      purple: '#8b5cf6',
      blue: '#3b82f6',
      green: '#10b981',
      pink: '#ec4899',
      teal: '#14b8a6',
      amber: '#f59e0b',
      indigo: '#6366f1',
      rose: '#f43f5e',
    };
    
    return themeColors[theme || ''] || '#3b82f6';
  };

  const themeColor = getThemeColor(colorTheme);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50"
      >
        <Button
          onClick={handleInstall}
          className="shadow-lg hover:shadow-xl transition-all duration-300 gap-2"
          style={{
            backgroundColor: themeColor,
            color: 'white',
          }}
          size="lg"
        >
          <Download className="w-5 h-5" />
          <span>تثبيت {storeName || 'المتجر'}</span>
        </Button>
      </motion.div>
    </AnimatePresence>
  );
};

export default InstallPWAButton;
