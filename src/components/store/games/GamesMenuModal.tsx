import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Trophy, Gamepad2, ChevronLeft } from "lucide-react";
import { useGameLeaderboard } from "@/hooks/store/useGameLeaderboard";

interface GameOption {
  id: string;
  name: string;
  description: string;
  emoji: string;
  gradient: string;
  iconBg: string;
}

interface GamesMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectGame: (gameId: string) => void;
  colorTheme?: string;
  storeOwnerId?: string;
}

const LEADERBOARD_GAMES = [
  { id: "memory_match", label: "🧠 طابق واربح", icon: "🧠" },
  { id: "price_guess", label: "🏷️ خمّن السعر", icon: "🏷️" },
];

const MiniLeaderboard: React.FC<{
  storeOwnerId: string;
  gameType: string;
  themeColor: string;
  label: string;
  icon: string;
}> = ({ storeOwnerId, gameType, themeColor, label, icon }) => {
  const { scores, loading } = useGameLeaderboard(storeOwnerId, gameType);
  const top3 = scores.slice(0, 3);
  const medals = ["🥇", "🥈", "🥉"];
  const barWidths = ["100%", "75%", "55%"];

  if (loading)
    return (
      <div className="text-xs text-muted-foreground text-center py-4 animate-pulse">
        ⏳ جاري التحميل...
      </div>
    );

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl overflow-hidden border border-border/50"
      style={{ background: `linear-gradient(145deg, ${themeColor}08, ${themeColor}03)` }}
    >
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border/30">
        <span className="text-lg">{icon}</span>
        <span className="text-sm font-bold text-foreground">{label}</span>
      </div>
      {top3.length === 0 ? (
        <div className="text-center py-6 space-y-1">
          <span className="text-2xl block">🏆</span>
          <p className="text-xs text-muted-foreground">لا توجد نتائج بعد</p>
          <p className="text-[10px] text-muted-foreground">كن أول من يسجل رقماً!</p>
        </div>
      ) : (
        <div className="p-3 space-y-2">
          {top3.map((s, i) => (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, x: 15, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ delay: i * 0.1, type: "spring", stiffness: 300 }}
              className="flex items-center gap-2.5"
            >
              <span className="text-lg w-7 text-center">{medals[i]}</span>
              <div className="flex-1 relative">
                <div className="h-9 rounded-xl overflow-hidden bg-muted/30 relative">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: barWidths[i] }}
                    transition={{ delay: 0.3 + i * 0.1, duration: 0.6, ease: "easeOut" }}
                    className="absolute inset-y-0 left-0 rounded-xl"
                    style={{
                      background: i === 0
                        ? `linear-gradient(90deg, ${themeColor}, ${themeColor}cc)`
                        : i === 1
                        ? `linear-gradient(90deg, ${themeColor}80, ${themeColor}50)`
                        : `linear-gradient(90deg, ${themeColor}50, ${themeColor}30)`,
                    }}
                  />
                  <div className="absolute inset-0 flex items-center justify-between px-3">
                    <span className={`text-xs font-bold truncate ${i === 0 ? "text-white" : "text-foreground"}`}>
                      {s.player_name}
                    </span>
                    <span className={`text-xs font-black ${i === 0 ? "text-white" : "text-foreground"}`}>
                      {s.score}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
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
      emoji: "🎰",
      gradient: "from-amber-500 to-orange-600",
      iconBg: "#f59e0b",
    },
    {
      id: "memory",
      name: "طابق واربح",
      description: "اعثر على الأزواج المتطابقة قبل انتهاء الوقت!",
      emoji: "🧠",
      gradient: "from-violet-500 to-purple-600",
      iconBg: "#8b5cf6",
    },
    {
      id: "price",
      name: "خمّن السعر",
      description: "هل تعرف أسعار المنتجات؟ اختبر نفسك!",
      emoji: "🏷️",
      gradient: "from-emerald-500 to-teal-600",
      iconBg: "#10b981",
    },
    {
      id: "billpayer",
      name: "من يدفع الحساب؟",
      description: "أضف أسماء أصدقائك وخلّ الحظ يختار!",
      emoji: "💸",
      gradient: "from-pink-500 to-rose-600",
      iconBg: "#ec4899",
    },
  ];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        {/* Animated backdrop */}
        <motion.div
          className="absolute inset-0 bg-black/70 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        />

        <motion.div
          initial={{ y: 120, opacity: 0, scale: 0.92 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 120, opacity: 0, scale: 0.92 }}
          transition={{ type: "spring", damping: 28, stiffness: 350 }}
          className="relative w-full max-w-sm rounded-t-3xl sm:rounded-3xl bg-background shadow-2xl overflow-hidden border border-border/30"
          style={{ direction: "rtl" }}
        >
          {/* Animated Header with pattern */}
          <div
            className="relative p-5 text-white overflow-hidden"
            style={{ background: `linear-gradient(135deg, ${themeColor}, ${themeColor}bb)` }}
          >
            {/* Floating decorative elements */}
            <motion.div
              animate={{ y: [-5, 5, -5], rotate: [0, 10, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="absolute top-2 left-8 text-2xl opacity-20"
            >🎮</motion.div>
            <motion.div
              animate={{ y: [5, -5, 5], rotate: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut" }}
              className="absolute top-3 left-24 text-xl opacity-15"
            >⭐</motion.div>
            <motion.div
              animate={{ y: [-3, 3, -3] }}
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
              className="absolute bottom-2 left-16 text-lg opacity-15"
            >🏆</motion.div>

            {/* Glow effect */}
            <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute -bottom-8 -left-8 w-24 h-24 rounded-full bg-white/10 blur-xl" />

            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{ rotate: [0, -10, 10, 0] }}
                  transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                  className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm"
                >
                  <Gamepad2 className="h-5 w-5" />
                </motion.div>
                <div>
                  <h2 className="text-lg font-black tracking-wide">مركز الألعاب</h2>
                  <p className="text-[10px] text-white/60 font-medium">العب واستمتع! 🎯</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-all"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Tabs with pill design */}
          <div className="px-4 pt-3">
            <div className="flex gap-1 p-1 rounded-2xl bg-muted/50 border border-border/30">
              {[
                { key: "games" as const, label: "🎮 الألعاب", icon: "🎮" },
                { key: "leaderboard" as const, label: "🏆 المتصدرين", icon: "🏆" },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all duration-300 ${
                    activeTab === tab.key
                      ? "text-white shadow-lg"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  style={
                    activeTab === tab.key
                      ? { background: `linear-gradient(135deg, ${themeColor}, ${themeColor}cc)` }
                      : {}
                  }
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="p-4 max-h-[55vh] overflow-y-auto">
            <AnimatePresence mode="wait">
              {activeTab === "games" ? (
                <motion.div
                  key="games"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="grid grid-cols-2 gap-3"
                >
                  {games.map((game, index) => (
                    <motion.button
                      key={game.id}
                      initial={{ opacity: 0, y: 20, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ delay: index * 0.08, type: "spring", stiffness: 300 }}
                      whileHover={{ scale: 1.05, y: -3 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        onClose();
                        onSelectGame(game.id);
                      }}
                      className="relative flex flex-col items-center gap-2 p-4 rounded-2xl border border-border/30 bg-card hover:shadow-xl transition-all duration-300 group overflow-hidden"
                    >
                      {/* Hover glow */}
                      <div
                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"
                        style={{ background: `radial-gradient(circle at center, ${game.iconBg}15, transparent 70%)` }}
                      />

                      <motion.div
                        whileHover={{ rotate: [0, -5, 5, 0] }}
                        transition={{ duration: 0.4 }}
                        className="relative w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg"
                        style={{
                          background: `linear-gradient(135deg, ${game.iconBg}, ${game.iconBg}bb)`,
                          boxShadow: `0 8px 20px ${game.iconBg}40`,
                        }}
                      >
                        <span className="text-2xl">{game.emoji}</span>
                        {/* Shine effect */}
                        <div className="absolute inset-0 rounded-2xl overflow-hidden">
                          <div className="absolute -top-full -left-full w-full h-full bg-gradient-to-br from-white/30 to-transparent rotate-45 group-hover:translate-x-[200%] group-hover:translate-y-[200%] transition-transform duration-700" />
                        </div>
                      </motion.div>

                      <div className="relative text-center">
                        <p className="font-bold text-sm text-foreground">{game.name}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight line-clamp-2">
                          {game.description}
                        </p>
                      </div>

                      {/* Play indicator */}
                      <div
                        className="text-[9px] font-bold px-3 py-1 rounded-full text-white"
                        style={{ background: `${game.iconBg}cc` }}
                      >
                        العب الآن ▶
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
                  className="space-y-3"
                >
                  {storeOwnerId ? (
                    LEADERBOARD_GAMES.map((g) => (
                      <MiniLeaderboard
                        key={g.id}
                        storeOwnerId={storeOwnerId}
                        gameType={g.id}
                        themeColor={themeColor}
                        label={g.label}
                        icon={g.icon}
                      />
                    ))
                  ) : (
                    <div className="text-center py-10 space-y-3">
                      <motion.div
                        animate={{ y: [0, -5, 0] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                      >
                        <Trophy className="h-12 w-12 mx-auto text-muted-foreground/50" />
                      </motion.div>
                      <p className="text-sm text-muted-foreground font-medium">
                        لا يمكن عرض المتصدرين
                      </p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-border/20">
            <p className="text-center text-[10px] text-muted-foreground font-medium">
              ✨ العب، تنافس، وسجّل اسمك في لوحة المتصدرين!
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default GamesMenuModal;
