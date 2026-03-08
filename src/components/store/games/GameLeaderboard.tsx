import React, { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, X, Sparkles, Phone, User, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GameScore } from "@/hooks/store/useGameLeaderboard";
import { supabase } from "@/integrations/supabase/client";

interface GameLeaderboardProps {
  scores: GameScore[];
  loading: boolean;
  currentScore?: number;
  onSaveScore?: (name: string, phone: string) => void;
  themeColor: string;
  gameTitle: string;
  onClose?: () => void;
  showSaveForm?: boolean;
  storeOwnerId?: string;
}

const RANK_STYLES = [
  { bg: "from-yellow-400/20 to-amber-500/10", border: "border-yellow-400/50", icon: "🥇", glow: "shadow-yellow-500/20" },
  { bg: "from-gray-300/20 to-slate-400/10", border: "border-gray-400/40", icon: "🥈", glow: "shadow-gray-400/10" },
  { bg: "from-amber-600/15 to-orange-700/10", border: "border-amber-600/30", icon: "🥉", glow: "shadow-amber-600/10" },
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
  storeOwnerId,
}) => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [lookupState, setLookupState] = useState<"idle" | "loading" | "found" | "not_found">("idle");
  const [phoneLocked, setPhoneLocked] = useState(false);

  // البحث عن الاسم بناءً على رقم الهاتف
  const lookupPhone = useCallback(async (phone: string) => {
    const trimmed = phone.trim();
    if (trimmed.length < 7) {
      setLookupState("idle");
      setPlayerName("");
      setPhoneLocked(false);
      return;
    }

    setLookupState("loading");
    try {
      const { data } = await supabase
        .from("game_scores")
        .select("player_name")
        .eq("phone_number", trimmed)
        .order("created_at", { ascending: false })
        .limit(1);

      const found = (data as any[])?.[0];
      if (found?.player_name) {
        setPlayerName(found.player_name);
        setLookupState("found");
        setPhoneLocked(true);
      } else {
        setPlayerName("");
        setLookupState("not_found");
        setPhoneLocked(false);
      }
    } catch {
      setLookupState("not_found");
      setPhoneLocked(false);
    }
  }, []);

  // debounce للبحث عند تغيير الرقم
  useEffect(() => {
    if (!phoneNumber.trim() || phoneNumber.trim().length < 7) {
      setLookupState("idle");
      setPlayerName("");
      setPhoneLocked(false);
      return;
    }
    const timer = setTimeout(() => lookupPhone(phoneNumber), 400);
    return () => clearTimeout(timer);
  }, [phoneNumber, lookupPhone]);

  const handleSave = async () => {
    if (playerName.trim() && phoneNumber.trim() && onSaveScore) {
      setSaving(true);
      onSaveScore(playerName.trim(), phoneNumber.trim());
      setTimeout(() => {
        setSaved(true);
        setSaving(false);
      }, 500);
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
          initial={{ opacity: 0, y: -15, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: "spring", stiffness: 300 }}
          className="relative p-4 rounded-2xl border-2 space-y-3 overflow-hidden"
          style={{ borderColor: `${themeColor}50`, background: `linear-gradient(135deg, ${themeColor}12, ${themeColor}05)` }}
        >
          {isNewHighScore && (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
              className="absolute -top-6 -right-6 w-16 h-16 opacity-20"
              style={{ background: `conic-gradient(from 0deg, transparent, ${themeColor}, transparent)`, borderRadius: "50%" }}
            />
          )}

          <div className="relative flex items-center gap-2">
            <motion.div
              animate={isNewHighScore ? { rotate: [0, -10, 10, 0], scale: [1, 1.1, 1] } : {}}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <Sparkles className="h-5 w-5" style={{ color: themeColor }} />
            </motion.div>
            <div>
              <span className="text-sm font-bold text-foreground block">سجّل نتيجتك! 🏆</span>
              {isNewHighScore && (
                <span className="text-[10px] font-bold" style={{ color: themeColor }}>
                  🎉 رقم قياسي جديد!
                </span>
              )}
            </div>
          </div>

          <div className="relative space-y-2">
            {/* رقم الهاتف أولاً */}
            <div className="relative">
              <Input
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="أدخل رقم الموبايل أولاً..."
                type="tel"
                dir="ltr"
                className="rounded-xl text-sm h-11 border-2 focus-visible:ring-0 pl-10 pr-10"
                style={{ borderColor: lookupState === "found" ? "#22c55e80" : `${themeColor}30` }}
                maxLength={15}
              />
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              {lookupState === "loading" && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground animate-spin" />
              )}
              {lookupState === "found" && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Check className="h-4 w-4 text-green-500" />
                </motion.div>
              )}
            </div>

            {/* حالة العثور على الاسم */}
            <AnimatePresence mode="wait">
              {lookupState === "found" && (
                <motion.div
                  key="found"
                  initial={{ opacity: 0, y: -8, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: "auto" }}
                  exit={{ opacity: 0, y: -8, height: 0 }}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-800"
                >
                  <User className="h-4 w-4 text-green-500 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-green-600 dark:text-green-400">مرحباً بعودتك! 👋</p>
                    <p className="text-sm font-bold text-green-700 dark:text-green-300 truncate">{playerName}</p>
                  </div>
                </motion.div>
              )}

              {lookupState === "not_found" && (
                <motion.div
                  key="not_found"
                  initial={{ opacity: 0, y: -8, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: "auto" }}
                  exit={{ opacity: 0, y: -8, height: 0 }}
                  className="space-y-1"
                >
                  <p className="text-[10px] text-muted-foreground">🆕 لاعب جديد! اختر اسماً لك:</p>
                  <Input
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSave()}
                    placeholder="اكتب اسمك..."
                    className="rounded-xl text-sm h-11 border-2 focus-visible:ring-0"
                    style={{ borderColor: `${themeColor}30` }}
                    maxLength={20}
                    autoFocus
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <p className="text-[10px] text-muted-foreground">
              📱 رقمك يُستخدم لتحديث نتيجتك تلقائياً إذا حققت رقم أعلى
            </p>

            <Button
              onClick={handleSave}
              disabled={!playerName.trim() || !phoneNumber.trim() || saving || lookupState === "loading" || lookupState === "idle"}
              className="w-full rounded-xl text-white h-11 font-bold shadow-lg"
              style={{ background: `linear-gradient(135deg, ${themeColor}, ${themeColor}cc)`, boxShadow: `0 4px 15px ${themeColor}40` }}
            >
              {saving ? "..." : lookupState === "found" ? "تحديث النتيجة" : "حفظ النتيجة"}
            </Button>
          </div>
        </motion.div>
      )}

      {saved && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-bold bg-green-50 text-green-600 dark:bg-green-950/50 dark:text-green-400 border border-green-200 dark:border-green-800"
        >
          <motion.span animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: 2, duration: 0.3 }}>✅</motion.span>
          تم حفظ نتيجتك بنجاح!
        </motion.div>
      )}

      {/* Leaderboard */}
      <div className="rounded-2xl border border-border/40 overflow-hidden bg-card/50">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/30"
          style={{ background: `linear-gradient(135deg, ${themeColor}10, ${themeColor}05)` }}>
          <div className="flex items-center gap-2">
            <motion.div animate={{ y: [0, -2, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
              <Trophy className="h-4 w-4" style={{ color: themeColor }} />
            </motion.div>
            <span className="text-sm font-black text-foreground">لوحة المتصدرين</span>
          </div>
          {onClose && (
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted/50">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="p-3">
          {loading ? (
            <div className="text-center py-8 space-y-2">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                className="w-6 h-6 border-2 border-muted-foreground/30 border-t-foreground rounded-full mx-auto"
              />
              <p className="text-xs text-muted-foreground">جاري التحميل...</p>
            </div>
          ) : scores.length === 0 ? (
            <div className="text-center py-8 space-y-2">
              <motion.span animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 2 }} className="text-4xl block">🏆</motion.span>
              <p className="text-sm text-muted-foreground font-medium">لا توجد نتائج بعد</p>
              <p className="text-xs text-muted-foreground">كن أول من يسجل نتيجة! 🚀</p>
            </div>
          ) : (
            <div className="space-y-2">
              {scores.map((entry, idx) => {
                const rankStyle = idx < 3 ? RANK_STYLES[idx] : null;
                return (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, x: -20, scale: 0.95 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    transition={{ delay: idx * 0.06, type: "spring", stiffness: 300 }}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                      rankStyle
                        ? `bg-gradient-to-l ${rankStyle.bg} border ${rankStyle.border} shadow-sm ${rankStyle.glow}`
                        : "bg-muted/30 hover:bg-muted/50"
                    }`}
                  >
                    <div className="w-7 flex justify-center shrink-0">
                      {rankStyle ? (
                        <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2 + idx * 0.1, type: "spring" }} className="text-lg">
                          {rankStyle.icon}
                        </motion.span>
                      ) : (
                        <span className="text-xs font-black text-muted-foreground w-5 h-5 rounded-full bg-muted flex items-center justify-center">
                          {idx + 1}
                        </span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-bold truncate ${idx === 0 ? "" : "text-foreground"}`}
                        style={idx === 0 ? { color: themeColor } : {}}>
                        {entry.player_name}
                      </p>
                      <p className="text-[9px] text-muted-foreground">
                        {new Date(entry.created_at).toLocaleDateString("ar-SA")}
                      </p>
                    </div>

                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.3 + idx * 0.05, type: "spring" }}
                      className={`text-sm font-black px-3 py-1.5 rounded-xl ${
                        idx === 0 ? "text-white shadow-md" : "bg-muted text-foreground"
                      }`}
                      style={idx === 0 ? { background: `linear-gradient(135deg, ${themeColor}, ${themeColor}cc)`, boxShadow: `0 4px 12px ${themeColor}30` } : {}}
                    >
                      {entry.score}
                    </motion.div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GameLeaderboard;
