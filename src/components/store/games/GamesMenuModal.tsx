import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Disc3, Grid3X3, Tag } from "lucide-react";

interface GameOption {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  emoji: string;
}

interface GamesMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectGame: (gameId: string) => void;
  colorTheme?: string;
}

const GamesMenuModal: React.FC<GamesMenuModalProps> = ({
  isOpen,
  onClose,
  onSelectGame,
  colorTheme,
}) => {
  const getThemeColor = () => {
    if (colorTheme?.startsWith("#")) return colorTheme;
    const colors: Record<string, string> = {
      coral: "#fb923c", purple: "#a855f7", blue: "#3b82f6",
      green: "#22c55e", red: "#ef4444",
    };
    return colors[colorTheme || ""] || "#3b82f6";
  };

  const themeColor = getThemeColor();

  const games: GameOption[] = [
    {
      id: "wheel",
      name: "عجلة الحظ",
      description: "أدر العجلة واربح منتج عشوائي!",
      icon: <Disc3 className="h-8 w-8" />,
      emoji: "🎰",
    },
    {
      id: "memory",
      name: "طابق واربح",
      description: "اعثر على الأزواج المتطابقة قبل انتهاء الوقت!",
      icon: <Grid3X3 className="h-8 w-8" />,
      emoji: "🧠",
    },
    {
      id: "price",
      name: "خمّن السعر",
      description: "هل تعرف أسعار المنتجات؟ اختبر نفسك!",
      icon: <Tag className="h-8 w-8" />,
      emoji: "🏷️",
    },
  ];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", damping: 25 }}
          className="w-full max-w-sm rounded-t-2xl sm:rounded-2xl bg-background shadow-2xl overflow-hidden"
          style={{ direction: "rtl" }}
        >
          <div
            className="flex items-center justify-between p-4 text-white"
            style={{ background: `linear-gradient(135deg, ${themeColor}, ${themeColor}cc)` }}
          >
            <h2 className="text-lg font-bold">🎮 الألعاب</h2>
            <button onClick={onClose} className="p-1 rounded-full hover:bg-white/20">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="p-4 space-y-3">
            {games.map((game, index) => (
              <motion.button
                key={game.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.08 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => { onClose(); onSelectGame(game.id); }}
                className="w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-colors hover:border-primary text-right"
                style={{ borderColor: `${themeColor}25` }}
              >
                <div
                  className="flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center text-white"
                  style={{ background: `linear-gradient(135deg, ${themeColor}, ${themeColor}aa)` }}
                >
                  <span className="text-2xl">{game.emoji}</span>
                </div>
                <div className="flex-1">
                  <p className="font-bold text-foreground">{game.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{game.description}</p>
                </div>
              </motion.button>
            ))}
          </div>

          <div className="p-4 pt-0">
            <p className="text-center text-xs text-muted-foreground">
               الألعاب قيد التطوير! 🎮
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default GamesMenuModal;
