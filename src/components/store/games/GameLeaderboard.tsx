import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Medal, Crown, User, X, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GameScore } from "@/hooks/store/useGameLeaderboard";

interface GameLeaderboardProps {
  scores: GameScore[];
  loading: boolean;
  currentScore?: number;
  onSaveScore?: (name: string) => void;
  themeColor: string;
  gameTitle: string;
  onClose?: () => void;
  showSaveForm?: boolean;
}

const RANK_ICONS = [
  <Crown className="h-5 w-5 text-yellow-500" />,
  <Medal className="h-5 w-5 text-gray-400" />,
  <Medal className="h-5 w-5 text-amber-700" />,
];

const GameLeaderboard: React.FC<GameLeaderboardProps> = ({
  scores,
  loading,
  currentScore,
  onSaveScore,
  themeColor,
  gameTitle,
  onClose,
  showSaveForm = false,
}) => {
  const [playerName, setPlayerName] = useState("");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    if (playerName.trim() && onSaveScore) {
      onSaveScore(playerName.trim());
      setSaved(true);
    }
  };

  const isNewHighScore = currentScore !== undefined && scores.length > 0
    ? currentScore > scores[scores.length - 1]?.score || scores.length < 10
    : currentScore !== undefined && currentScore > 0;

  return (
    <div className="space-y-3">
      {/* Save Score Form */}
      {showSaveForm && !saved && currentScore !== undefined && currentScore > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 rounded-2xl border-2 space-y-2"
          style={{ borderColor: `${themeColor}40`, background: `${themeColor}08` }}
        >
          <div className="flex items-center gap-2 text-sm font-bold text-foreground">
            <Save className="h-4 w-4" style={{ color: themeColor }} />
            <span>سجّل نتيجتك في لوحة المتصدرين!</span>
          </div>
          <div className="flex gap-2">
            <Input
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
              placeholder="اكتب اسمك..."
              className="flex-1 rounded-xl text-sm"
              maxLength={20}
            />
            <Button
              onClick={handleSave}
              disabled={!playerName.trim()}
              className="rounded-xl text-white px-4"
              style={{ background: themeColor }}
            >
              حفظ
            </Button>
          </div>
          {isNewHighScore && (
            <p className="text-xs text-center font-medium" style={{ color: themeColor }}>
              🎉 رقم قياسي جديد!
            </p>
          )}
        </motion.div>
      )}

      {saved && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-2 rounded-xl text-sm font-bold bg-green-50 text-green-600 dark:bg-green-950 dark:text-green-400"
        >
          ✅ تم حفظ نتيجتك بنجاح!
        </motion.div>
      )}

      {/* Leaderboard Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy className="h-4 w-4" style={{ color: themeColor }} />
          <span className="text-sm font-bold text-foreground">🏆 لوحة المتصدرين</span>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Scores List */}
      {loading ? (
        <div className="text-center py-6 text-sm text-muted-foreground">جاري التحميل...</div>
      ) : scores.length === 0 ? (
        <div className="text-center py-6 space-y-2">
          <span className="text-3xl block">🏆</span>
          <p className="text-sm text-muted-foreground">لا توجد نتائج بعد</p>
          <p className="text-xs text-muted-foreground">كن أول من يسجل نتيجة!</p>
        </div>
      ) : (
        <div className="space-y-1.5">
          {scores.map((entry, idx) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                idx === 0
                  ? "border-2 shadow-sm"
                  : "bg-muted/50"
              }`}
              style={idx === 0 ? {
                borderColor: `${themeColor}40`,
                background: `${themeColor}08`,
              } : {}}
            >
              {/* Rank */}
              <div className="w-7 flex justify-center shrink-0">
                {idx < 3 ? (
                  RANK_ICONS[idx]
                ) : (
                  <span className="text-xs font-bold text-muted-foreground">{idx + 1}</span>
                )}
              </div>

              {/* Name */}
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-bold truncate ${idx === 0 ? "" : "text-foreground"}`}
                  style={idx === 0 ? { color: themeColor } : {}}>
                  {entry.player_name}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {new Date(entry.created_at).toLocaleDateString("ar-SA")}
                </p>
              </div>

              {/* Score */}
              <div className={`text-sm font-black px-2.5 py-1 rounded-lg ${
                idx === 0 ? "text-white" : "bg-muted text-foreground"
              }`}
                style={idx === 0 ? { background: themeColor } : {}}>
                {entry.score}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GameLeaderboard;
