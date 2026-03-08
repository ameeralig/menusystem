import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Disc3, Grid3X3, Tag, CreditCard, Trophy } from "lucide-react";
import { useGameLeaderboard } from "@/hooks/store/useGameLeaderboard";

interface GameOption {
  id: string;
  name: string;
  description: string;
  emoji: string;
}

interface GamesMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectGame: (gameId: string) => void;
  colorTheme?: string;
  storeOwnerId?: string;
}

const LEADERBOARD_GAMES = [
  { id: "memory_match", label: "🧠 طابق واربح" },
  { id: "price_guess", label: "🏷️ خمّن السعر" },
];

const MiniLeaderboard: React.FC<{
  storeOwnerId: string;
  gameType: string;
  themeColor: string;
  label: string;
}> = ({ storeOwnerId, gameType, themeColor, label }) => {
  const { scores, loading } = useGameLeaderboard(storeOwnerId, gameType);
  const top3 = scores.slice(0, 3);
  const medals = ["🥇", "🥈", "🥉"];

  if (loading)
    return (
      <div className="text-xs text-muted-foreground text-center py-3">
        جاري التحميل...
      </div>
    );
  if (top3.length === 0)
    return (
      <div className="text-center py-3">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-[10px] text-muted-foreground mt-1">لا توجد نتائج بعد</p>
      </div>
    );

  return (
    <div className="space-y-1.5">
      <p className="text-xs font-bold text-foreground">{label}</p>
      {top3.map((s, i) => (
        <motion.div
          key={s.id}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.08 }}
          className={`flex items-center gap-2 text-xs px-3 py-2 rounded-xl ${
            i === 0 ? "border-2 shadow-sm" : "bg-muted/50"
          }`}
          style={
            i === 0
              ? { borderColor: `${themeColor}40`, background: `${themeColor}08` }
              : {}
          }
        >
          <span className="text-sm">{medals[i]}</span>
          <span className="flex-1 truncate font-semibold text-foreground">
            {s.player_name}
          </span>
          <span
            className={`font-black px-2 py-0.5 rounded-lg text-[11px] ${
              i === 0 ? "text-white" : ""
            }`}
            style={
              i === 0
                ? { background: themeColor }
                : { background: `${themeColor}15`, color: themeColor }
            }
          >
            {s.score}
          </span>
        </motion.div>
      ))}
    </div>
  );
};

const GamesMenuModal: React.FC<GamesMenuModalProps> = ({
  isOpen,
  onClose,
  onSelectGame,
  colorTheme,
  storeOwnerId,
}) => {
  const [activeTab, setActiveTab] = useState<"games" | "leaderboard">("games");

  const getThemeColor = () => {
    if (colorTheme?.startsWith("#")) return colorTheme;
    const colors: Record<string, string> = {
      coral: "#fb923c",
      purple: "#a855f7",
      blue: "#3b82f6",
      green: "#22c55e",
      red: "#ef4444",
    };
    return colors[colorTheme || ""] || "#3b82f6";
  };

  const themeColor = getThemeColor();

  const games: GameOption[] = [
    {
      id: "wheel",
      name: "عجلة الحظ",
      description: "أدر العجلة واربح منتج عشوائي!",
      emoji: "🎰",
    },
    {
      id: "memory",
      name: "طابق واربح",
      description: "اعثر على الأزواج المتطابقة قبل انتهاء الوقت!",
      emoji: "🧠",
    },
    {
      id: "price",
      name: "خمّن السعر",
      description: "هل تعرف أسعار المنتجات؟ اختبر نفسك!",
      emoji: "🏷️",
    },
    {
      id: "billpayer",
      name: "من سيدفع الحساب؟",
      description: "أضف أسماء أصدقائك وخلّ الحظ يختار مين يدفع!",
      emoji: "💸",
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
          {/* Header */}
          <div
            className="flex items-center justify-between p-4 text-white"
            style={{
              background: `linear-gradient(135deg, ${themeColor}, ${themeColor}cc)`,
            }}
          >
            <h2 className="text-lg font-bold">🎮 الألعاب</h2>
            <button
              onClick={onClose}
              className="p-1 rounded-full hover:bg-white/20"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-border">
            <button
              onClick={() => setActiveTab("games")}
              className={`flex-1 py-2.5 text-sm font-bold transition-colors relative ${
                activeTab === "games"
                  ? "text-foreground"
                  : "text-muted-foreground"
              }`}
            >
              🎮 الألعاب
              {activeTab === "games" && (
                <motion.div
                  layoutId="tab-indicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
                  style={{ background: themeColor }}
                />
              )}
            </button>
            <button
              onClick={() => setActiveTab("leaderboard")}
              className={`flex-1 py-2.5 text-sm font-bold transition-colors relative ${
                activeTab === "leaderboard"
                  ? "text-foreground"
                  : "text-muted-foreground"
              }`}
            >
              🏆 المتصدرين
              {activeTab === "leaderboard" && (
                <motion.div
                  layoutId="tab-indicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
                  style={{ background: themeColor }}
                />
              )}
            </button>
          </div>

          {/* Content */}
          <div className="p-4 max-h-[60vh] overflow-y-auto">
            <AnimatePresence mode="wait">
              {activeTab === "games" ? (
                <motion.div
                  key="games"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-3"
                >
                  {games.map((game, index) => (
                    <motion.button
                      key={game.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.08 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        onClose();
                        onSelectGame(game.id);
                      }}
                      className="w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-colors hover:border-primary text-right"
                      style={{ borderColor: `${themeColor}25` }}
                    >
                      <div
                        className="flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center text-white"
                        style={{
                          background: `linear-gradient(135deg, ${themeColor}, ${themeColor}aa)`,
                        }}
                      >
                        <span className="text-2xl">{game.emoji}</span>
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-foreground">{game.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {game.description}
                        </p>
                      </div>
                    </motion.button>
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  key="leaderboard"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-5"
                >
                  {storeOwnerId ? (
                    LEADERBOARD_GAMES.map((g) => (
                      <MiniLeaderboard
                        key={g.id}
                        storeOwnerId={storeOwnerId}
                        gameType={g.id}
                        themeColor={themeColor}
                        label={g.label}
                      />
                    ))
                  ) : (
                    <div className="text-center py-8 space-y-2">
                      <Trophy className="h-10 w-10 mx-auto text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        لا يمكن عرض المتصدرين
                      </p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="p-4 pt-0">
            <p className="text-center text-xs text-muted-foreground">
              العب وسجّل اسمك في لوحة المتصدرين! 🎮
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default GamesMenuModal;
