import React from "react";
import { motion, AnimatePresence } from "framer-motion";

export interface Badge {
  id: string;
  emoji: string;
  label: string;
  description: string;
  minScore: number;
  color: string;
}

// شارات عامة لجميع الألعاب
export const GAME_BADGES: Badge[] = [
  { id: "beginner", emoji: "🌱", label: "مبتدئ", description: "سجّل أول نتيجة", minScore: 1, color: "#22c55e" },
  { id: "player", emoji: "🎮", label: "لاعب", description: "حقق 50 نقطة", minScore: 50, color: "#3b82f6" },
  { id: "skilled", emoji: "⚡", label: "ماهر", description: "حقق 100 نقطة", minScore: 100, color: "#8b5cf6" },
  { id: "pro", emoji: "🔥", label: "محترف", description: "حقق 200 نقطة", minScore: 200, color: "#f59e0b" },
  { id: "master", emoji: "👑", label: "أسطورة", description: "حقق 350 نقطة", minScore: 350, color: "#ef4444" },
  { id: "legend", emoji: "💎", label: "خارق", description: "حقق 500 نقطة", minScore: 500, color: "#ec4899" },
];

/** الحصول على أعلى شارة مستحقة بناءً على النقاط */
export const getHighestBadge = (score: number): Badge | null => {
  const earned = GAME_BADGES.filter(b => score >= b.minScore);
  return earned.length > 0 ? earned[earned.length - 1] : null;
};

/** الحصول على جميع الشارات المستحقة */
export const getEarnedBadges = (score: number): Badge[] => {
  return GAME_BADGES.filter(b => score >= b.minScore);
};

/** الشارة التالية غير المفتوحة */
export const getNextBadge = (score: number): Badge | null => {
  return GAME_BADGES.find(b => score < b.minScore) || null;
};

/** شارة صغيرة تظهر بجانب الاسم */
export const BadgeIcon: React.FC<{ badge: Badge; size?: "sm" | "md" }> = ({ badge, size = "sm" }) => {
  const sizeClass = size === "sm" ? "text-xs" : "text-sm";
  return (
    <motion.span
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 400 }}
      className={`${sizeClass} cursor-default`}
      title={`${badge.label}: ${badge.description}`}
    >
      {badge.emoji}
    </motion.span>
  );
};

/** عرض الشارات المفتوحة بعد انتهاء اللعبة */
export const UnlockedBadgesDisplay: React.FC<{
  score: number;
  previousScore?: number;
  themeColor: string;
}> = ({ score, previousScore = 0, themeColor }) => {
  const allEarned = getEarnedBadges(score);
  const newlyUnlocked = allEarned.filter(b => previousScore < b.minScore && score >= b.minScore);
  const nextBadge = getNextBadge(score);

  if (allEarned.length === 0 && !nextBadge) return null;

  return (
    <div className="space-y-3">
      {/* شارات جديدة مفتوحة */}
      <AnimatePresence>
        {newlyUnlocked.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="space-y-2"
          >
            <p className="text-xs font-bold text-center" style={{ color: themeColor }}>
              🎊 شارة جديدة!
            </p>
            <div className="flex justify-center gap-2 flex-wrap">
              {newlyUnlocked.map((badge, i) => (
                <motion.div
                  key={badge.id}
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: i * 0.2 + 0.3, type: "spring", stiffness: 200 }}
                  className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl border-2"
                  style={{
                    borderColor: `${badge.color}60`,
                    background: `linear-gradient(135deg, ${badge.color}15, ${badge.color}05)`,
                  }}
                >
                  <motion.span
                    animate={{ scale: [1, 1.3, 1], rotate: [0, 10, -10, 0] }}
                    transition={{ repeat: 2, duration: 0.6, delay: i * 0.2 + 0.5 }}
                    className="text-2xl"
                  >
                    {badge.emoji}
                  </motion.span>
                  <span className="text-[10px] font-black" style={{ color: badge.color }}>
                    {badge.label}
                  </span>
                  <span className="text-[9px] text-muted-foreground">{badge.description}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* شريط الشارات الكامل */}
      <div className="flex justify-center gap-1.5 flex-wrap">
        {GAME_BADGES.map((badge) => {
          const isEarned = score >= badge.minScore;
          return (
            <motion.div
              key={badge.id}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className={`relative flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold border transition-all ${
                isEarned
                  ? "opacity-100"
                  : "opacity-30 grayscale"
              }`}
              style={{
                borderColor: isEarned ? `${badge.color}40` : undefined,
                background: isEarned ? `${badge.color}10` : undefined,
                color: isEarned ? badge.color : undefined,
              }}
              title={`${badge.label}: ${badge.description} (${badge.minScore}+ نقطة)`}
            >
              <span>{badge.emoji}</span>
              <span>{badge.label}</span>
              {!isEarned && (
                <span className="text-[8px] text-muted-foreground">🔒</span>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* الشارة التالية */}
      {nextBadge && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center"
        >
          <p className="text-[10px] text-muted-foreground">
            الشارة التالية: {nextBadge.emoji} <span className="font-bold">{nextBadge.label}</span> — تحتاج{" "}
            <span className="font-bold" style={{ color: nextBadge.color }}>
              {nextBadge.minScore - score}
            </span>{" "}
            نقطة إضافية
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default UnlockedBadgesDisplay;
