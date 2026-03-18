import React, { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Trash2, Users, Eye, EyeOff, Search, AlertTriangle, Trophy, RotateCcw, ChevronLeft, Loader2, HelpCircle, Wifi, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import GameInstructions from "./detective/GameInstructions";
import OnlineDetectiveGame from "./detective/OnlineDetectiveGame";

interface DetectiveGameProps {
  isOpen: boolean;
  onClose: () => void;
  colorTheme?: string;
  storeOwnerId?: string;
}

type GamePhase = "mode_select" | "setup" | "loading" | "story" | "clues" | "reveal_roles" | "discussion" | "voting" | "result";
type GameMode = "local" | "online";
type Difficulty = "easy" | "medium" | "hard";
type Theme = "modern" | "historical" | "horror" | "funny" | "random";

interface PlayerData {
  name: string; role: string; private_story: string; secret: string; clues: string[];
}

interface GameData {
  story: { title: string; setting: string; background: string; crime: string };
  players: PlayerData[];
  shared_clues: string[];
  solution: { criminal: string; explanation: string };
}

const THEMES: { id: Theme; label: string; emoji: string }[] = [
  { id: "modern", label: "عصري", emoji: "🏙️" },
  { id: "historical", label: "تاريخي", emoji: "🏛️" },
  { id: "horror", label: "رعب", emoji: "👻" },
  { id: "funny", label: "كوميدي", emoji: "😂" },
  { id: "random", label: "عشوائي", emoji: "🎲" },
];

const DIFFICULTIES: { id: Difficulty; label: string; emoji: string }[] = [
  { id: "easy", label: "سهل", emoji: "🟢" },
  { id: "medium", label: "متوسط", emoji: "🟡" },
  { id: "hard", label: "صعب", emoji: "🔴" },
];

const useDetectiveSounds = () => {
  const audioCtxRef = useRef<AudioContext | null>(null);
  const getCtx = () => {
    if (!audioCtxRef.current) audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    return audioCtxRef.current;
  };
  const playReveal = useCallback(() => {
    try {
      const ctx = getCtx();
      [400, 500, 600, 800].forEach((freq, i) => {
        const osc = ctx.createOscillator(); const gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        osc.frequency.value = freq; osc.type = "sine";
        gain.gain.setValueAtTime(0.1, ctx.currentTime + i * 0.15);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.15 + 0.3);
        osc.start(ctx.currentTime + i * 0.15); osc.stop(ctx.currentTime + i * 0.15 + 0.3);
      });
    } catch {}
  }, []);
  const playSuspense = useCallback(() => {
    try {
      const ctx = getCtx();
      const osc = ctx.createOscillator(); const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.frequency.value = 200; osc.type = "sawtooth";
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.5);
      osc.frequency.linearRampToValueAtTime(100, ctx.currentTime + 1.5);
      osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 1.5);
    } catch {}
  }, []);
  return { playReveal, playSuspense };
};

const DetectiveGame: React.FC<DetectiveGameProps> = ({ isOpen, onClose, colorTheme, storeOwnerId }) => {
  const [phase, setPhase] = useState<GamePhase>("mode_select");
  const [gameMode, setGameMode] = useState<GameMode>("local");
  const [playerNames, setPlayerNames] = useState<string[]>(["", "", ""]);
  const [newName, setNewName] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [theme, setTheme] = useState<Theme>("random");
  const [gameData, setGameData] = useState<GameData | null>(null);
  const [revealedPlayer, setRevealedPlayer] = useState<number | null>(null);
  const [votes, setVotes] = useState<Record<number, string>>({});
  const [currentVoterIndex, setCurrentVoterIndex] = useState(0);
  const [showSolution, setShowSolution] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [showCluesReview, setShowCluesReview] = useState(false);
  const { playReveal, playSuspense } = useDetectiveSounds();

  const getThemeColor = () => {
    if (colorTheme?.startsWith("#")) return colorTheme;
    const colors: Record<string, string> = {
      coral: "#fb923c", purple: "#a855f7", blue: "#3b82f6", green: "#22c55e", red: "#ef4444",
    };
    return colors[colorTheme || ""] || "#3b82f6";
  };
  const tc = getThemeColor();

  const addPlayer = () => {
    const name = newName.trim();
    if (!name) return;
    if (playerNames.filter(n => n).length >= 8) { toast.error("الحد الأقصى 8 لاعبين"); return; }
    const emptyIndex = playerNames.findIndex(n => !n);
    if (emptyIndex !== -1) {
      const updated = [...playerNames]; updated[emptyIndex] = name; setPlayerNames(updated);
    } else { setPlayerNames([...playerNames, name]); }
    setNewName("");
  };

  const removePlayer = (index: number) => {
    const updated = playerNames.filter((_, i) => i !== index);
    if (updated.length < 3) updated.push("");
    setPlayerNames(updated);
  };

  const filledNames = playerNames.filter(n => n.trim());

  const startGame = async () => {
    if (filledNames.length < 3) { toast.error("أدخل 3 أسماء على الأقل"); return; }
    setPhase("loading");
    try {
      const { data, error } = await supabase.functions.invoke("generate-detective-story", {
        body: { playerNames: filledNames, difficulty, theme },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setGameData(data); playSuspense(); setPhase("story");
    } catch (e: any) {
      toast.error(e.message || "فشل في إنشاء القصة"); setPhase("setup");
    }
  };

  const resetGame = () => {
    setPhase("mode_select"); setGameMode("local"); setGameData(null);
    setRevealedPlayer(null); setVotes({}); setCurrentVoterIndex(0);
    setShowSolution(false); setShowCluesReview(false);
  };

  const handleVote = (voterName: string, suspectName: string) => {
    setVotes(prev => ({ ...prev, [currentVoterIndex]: suspectName }));
    if (currentVoterIndex < filledNames.length - 1) {
      setCurrentVoterIndex(prev => prev + 1);
    } else { playReveal(); setPhase("result"); }
  };

  const getVoteResult = () => {
    const voteCounts: Record<string, number> = {};
    Object.values(votes).forEach(name => { voteCounts[name] = (voteCounts[name] || 0) + 1; });
    const sorted = Object.entries(voteCounts).sort((a, b) => b[1] - a[1]);
    return sorted[0]?.[0] || "";
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
        onClick={e => e.target === e.currentTarget && onClose()}
      >
        <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />
        <motion.div
          initial={{ y: 120, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 120, opacity: 0 }}
          transition={{ type: "spring", damping: 28 }}
          className="relative w-full max-w-md rounded-t-3xl sm:rounded-3xl bg-background shadow-2xl overflow-hidden border border-border/30"
          style={{ direction: "rtl" }}
        >
          {/* Header */}
          <div className="relative p-4 text-white overflow-hidden" style={{ background: `linear-gradient(135deg, ${tc}, ${tc}bb)` }}>
            <motion.div animate={{ y: [-3, 3, -3] }} transition={{ repeat: Infinity, duration: 3 }} className="absolute top-2 left-8 text-xl opacity-20">🔍</motion.div>
            <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-white/10 blur-2xl" />
            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                  <span className="text-xl">🕵️</span>
                </div>
                <div>
                  <h2 className="text-lg font-black">من هو المجرم؟</h2>
                  <p className="text-[10px] text-white/60">حل اللغز واكشف المجرم! 🔎</p>
                </div>
              </div>
              <div className="flex gap-1.5">
                <button onClick={() => setShowInstructions(true)} className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all">
                  <HelpCircle className="h-4 w-4" />
                </button>
                {phase !== "mode_select" && (
                  <button onClick={resetGame} className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all">
                    <RotateCcw className="h-4 w-4" />
                  </button>
                )}
                <button onClick={onClose} className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 max-h-[65vh] overflow-y-auto space-y-4">
            <AnimatePresence mode="wait">
              {/* MODE SELECT */}
              {phase === "mode_select" && (
                <motion.div key="mode" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                  <p className="text-sm font-bold text-foreground text-center">اختر طريقة اللعب</p>
                  <div className="grid grid-cols-2 gap-3">
                    <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                      onClick={() => { setGameMode("local"); setPhase("setup"); }}
                      className="flex flex-col items-center gap-3 p-5 rounded-2xl border-2 border-border/30 bg-card hover:shadow-lg transition-all">
                      <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white"
                        style={{ background: `linear-gradient(135deg, ${tc}, ${tc}bb)` }}>
                        <Monitor className="h-7 w-7" />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-black text-foreground">محلي</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">جهاز واحد لكل اللاعبين</p>
                      </div>
                    </motion.button>
                    <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                      onClick={() => { setGameMode("online"); }}
                      className="flex flex-col items-center gap-3 p-5 rounded-2xl border-2 border-border/30 bg-card hover:shadow-lg transition-all">
                      <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white"
                        style={{ background: `linear-gradient(135deg, #8b5cf6, #7c3aed)` }}>
                        <Wifi className="h-7 w-7" />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-black text-foreground">عبر الإنترنت</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">كل لاعب من جهازه</p>
                      </div>
                    </motion.button>
                  </div>
                </motion.div>
              )}

              {/* ONLINE MODE */}
              {gameMode === "online" && phase === "mode_select" && (
                <OnlineDetectiveGame
                  onBack={() => setGameMode("local")}
                  themeColor={tc}
                  storeOwnerId={storeOwnerId}
                />
              )}

              {/* LOCAL: SETUP PHASE */}
              {phase === "setup" && gameMode === "local" && (
                <motion.div key="setup" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-foreground flex items-center gap-2">
                      <Users className="h-4 w-4" /> اللاعبين ({filledNames.length}/8)
                    </label>
                    <div className="flex gap-2">
                      <Input value={newName} onChange={e => setNewName(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && addPlayer()} placeholder="اسم اللاعب..." className="flex-1 text-sm" />
                      <Button size="sm" onClick={addPlayer} style={{ background: tc }} className="text-white">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {playerNames.filter(n => n).map((name, i) => (
                        <motion.div key={i} initial={{ scale: 0 }} animate={{ scale: 1 }}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-white"
                          style={{ background: `${tc}cc` }}>
                          {name}
                          <button onClick={() => removePlayer(playerNames.indexOf(name))} className="hover:bg-white/20 rounded-full p-0.5">
                            <X className="h-3 w-3" />
                          </button>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-foreground">🎭 الثيم</label>
                    <div className="grid grid-cols-5 gap-2">
                      {THEMES.map(t => (
                        <button key={t.id} onClick={() => setTheme(t.id)}
                          className={`flex flex-col items-center gap-1 p-2 rounded-xl border transition-all text-xs ${theme === t.id ? "border-2 shadow-lg" : "border-border/30"}`}
                          style={theme === t.id ? { borderColor: tc, background: `${tc}15` } : {}}>
                          <span className="text-lg">{t.emoji}</span>
                          <span className="font-medium text-foreground">{t.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-foreground">⚡ الصعوبة</label>
                    <div className="grid grid-cols-3 gap-2">
                      {DIFFICULTIES.map(d => (
                        <button key={d.id} onClick={() => setDifficulty(d.id)}
                          className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border transition-all text-sm font-bold ${difficulty === d.id ? "border-2 shadow-lg" : "border-border/30"}`}
                          style={difficulty === d.id ? { borderColor: tc, background: `${tc}15` } : {}}>
                          <span>{d.emoji}</span><span className="text-foreground">{d.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <Button onClick={startGame} disabled={filledNames.length < 3}
                    className="w-full h-12 text-white font-black text-base rounded-2xl"
                    style={{ background: `linear-gradient(135deg, ${tc}, ${tc}bb)` }}>
                    🕵️ ابدأ التحقيق!
                  </Button>
                </motion.div>
              )}

              {/* LOADING */}
              {phase === "loading" && (
                <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-4 py-12">
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }}>
                    <Loader2 className="h-12 w-12 text-muted-foreground" />
                  </motion.div>
                  <p className="text-sm font-bold text-foreground">🔍 جاري إنشاء القصة الغامضة...</p>
                  <p className="text-xs text-muted-foreground">الذكاء الاصطناعي يكتب لغزاً مشوقاً</p>
                </motion.div>
              )}

              {/* STORY */}
              {phase === "story" && gameData && (
                <motion.div key="story" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                  <div className="rounded-2xl p-4 border border-border/30" style={{ background: `${tc}08` }}>
                    <h3 className="text-lg font-black text-foreground mb-2">📖 {gameData.story.title}</h3>
                    <p className="text-xs text-muted-foreground mb-2">📍 {gameData.story.setting}</p>
                    <p className="text-sm text-foreground leading-relaxed mb-3">{gameData.story.background}</p>
                    <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20">
                      <p className="text-sm font-bold text-destructive flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4" /> الجريمة
                      </p>
                      <p className="text-sm text-foreground mt-1">{gameData.story.crime}</p>
                    </div>
                  </div>
                  <Button onClick={() => setPhase("clues")} className="w-full h-11 text-white font-bold rounded-2xl"
                    style={{ background: `linear-gradient(135deg, ${tc}, ${tc}bb)` }}>
                    🔍 عرض الأدلة المشتركة
                  </Button>
                </motion.div>
              )}

              {/* CLUES */}
              {phase === "clues" && gameData && (
                <motion.div key="clues" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                  <h3 className="text-base font-black text-foreground flex items-center gap-2">
                    <Search className="h-5 w-5" /> الأدلة المشتركة
                  </h3>
                  <div className="space-y-2">
                    {gameData.shared_clues.map((clue, i) => (
                      <motion.div key={i} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.15 }} className="p-3 rounded-xl border border-border/30 bg-card">
                        <p className="text-sm text-foreground">
                          <span className="font-bold" style={{ color: tc }}>دليل {i + 1}: </span>{clue}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                  <Button onClick={() => setPhase("reveal_roles")} className="w-full h-11 text-white font-bold rounded-2xl"
                    style={{ background: `linear-gradient(135deg, ${tc}, ${tc}bb)` }}>
                    🎭 كشف الأدوار السرية
                  </Button>
                </motion.div>
              )}

              {/* REVEAL ROLES */}
              {phase === "reveal_roles" && gameData && (
                <motion.div key="roles" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30">
                    <p className="text-xs font-bold text-amber-600 text-center">
                      ⚠️ كل لاعب يضغط على اسمه لرؤية دوره السري — لا تُري أحداً!
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {gameData.players.map((player, i) => (
                      <motion.button key={i} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.1 }}
                        onClick={() => { playReveal(); setRevealedPlayer(revealedPlayer === i ? null : i); }}
                        className="relative p-3 rounded-2xl border border-border/30 bg-card text-center transition-all"
                        style={revealedPlayer === i ? { borderColor: tc, background: `${tc}10` } : {}}>
                        <div className="text-2xl mb-1">{revealedPlayer === i ? (player.role === "criminal" ? "😈" : "😇") : "❓"}</div>
                        <p className="text-sm font-bold text-foreground">{player.name}</p>
                        <div className="flex items-center justify-center gap-1 mt-1 text-[10px] text-muted-foreground">
                          {revealedPlayer === i ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                          {revealedPlayer === i ? "اضغط للإخفاء" : "اضغط للكشف"}
                        </div>
                      </motion.button>
                    ))}
                  </div>
                  <AnimatePresence>
                    {revealedPlayer !== null && gameData.players[revealedPlayer] && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="rounded-2xl p-4 border border-border/30 space-y-2 overflow-hidden"
                        style={{ background: `${tc}08` }}>
                        <p className="text-xs font-bold" style={{ color: tc }}>
                          {gameData.players[revealedPlayer].role === "criminal" ? "😈 أنت المجرم!" : "😇 أنت بريء"}
                        </p>
                        <p className="text-sm text-foreground">{gameData.players[revealedPlayer].private_story}</p>
                        <div className="p-2 rounded-lg bg-muted/50">
                          <p className="text-xs text-muted-foreground">🤫 سرك: {gameData.players[revealedPlayer].secret}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs font-bold text-foreground">أدلتك الخاصة:</p>
                          {gameData.players[revealedPlayer].clues.map((clue, ci) => (
                            <p key={ci} className="text-xs text-muted-foreground">• {clue}</p>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <Button onClick={() => { setRevealedPlayer(null); setPhase("discussion"); }}
                    className="w-full h-11 text-white font-bold rounded-2xl"
                    style={{ background: `linear-gradient(135deg, ${tc}, ${tc}bb)` }}>
                    💬 ابدأ النقاش
                  </Button>
                </motion.div>
              )}

              {/* DISCUSSION */}
              {phase === "discussion" && gameData && (
                <motion.div key="discussion" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 text-center">
                  <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ repeat: Infinity, duration: 2 }} className="text-5xl">💬</motion.div>
                  <h3 className="text-lg font-black text-foreground">وقت النقاش!</h3>
                  <p className="text-sm text-muted-foreground">
                    ناقشوا مع بعض، اسألوا أسئلة، حاولوا اكتشاف المجرم!<br />المجرم يحاول يكذب ويدافع عن نفسه 😈
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2 rounded-xl bg-muted/50">💡 راجعوا الأدلة المشتركة</div>
                    <div className="p-2 rounded-xl bg-muted/50">🤔 اسألوا عن الأسرار</div>
                    <div className="p-2 rounded-xl bg-muted/50">🎭 راقبوا ردود الفعل</div>
                    <div className="p-2 rounded-xl bg-muted/50">🕵️ ابحثوا عن التناقضات</div>
                  </div>

                  {/* Clues Review Toggle */}
                  <button onClick={() => setShowCluesReview(!showCluesReview)}
                    className="mx-auto flex items-center gap-1 px-4 py-2 rounded-full text-xs font-bold border border-border/30 bg-card hover:bg-muted/50 text-foreground transition-all">
                    <Search className="h-3 w-3" />
                    {showCluesReview ? "إخفاء الأدلة" : "مراجعة الأدلة"}
                  </button>
                  <AnimatePresence>
                    {showCluesReview && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }} className="overflow-hidden text-right">
                        <div className="p-3 rounded-xl border border-border/30 bg-card space-y-2">
                          <p className="text-xs font-bold text-foreground">🔍 الأدلة المشتركة:</p>
                          {gameData.shared_clues.map((c, i) => (
                            <p key={i} className="text-xs text-muted-foreground">• {c}</p>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <Button onClick={() => { setCurrentVoterIndex(0); setVotes({}); setShowCluesReview(false); setPhase("voting"); }}
                    className="w-full h-11 text-white font-bold rounded-2xl"
                    style={{ background: `linear-gradient(135deg, ${tc}, ${tc}bb)` }}>
                    🗳️ بدء التصويت
                  </Button>
                </motion.div>
              )}

              {/* VOTING */}
              {phase === "voting" && gameData && (
                <motion.div key="voting" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                  <div className="text-center">
                    <p className="text-sm font-bold text-foreground">
                      🗳️ دور <span style={{ color: tc }}>{filledNames[currentVoterIndex]}</span> للتصويت
                    </p>
                    <p className="text-xs text-muted-foreground">من تعتقد أنه المجرم؟</p>
                  </div>

                  {/* Clues review in voting */}
                  <div className="flex justify-center">
                    <button onClick={() => setShowCluesReview(!showCluesReview)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold border border-border/30 bg-card hover:bg-muted/50 text-foreground">
                      <Search className="h-3 w-3" />
                      {showCluesReview ? "إخفاء الأدلة" : "مراجعة الأدلة"}
                    </button>
                  </div>
                  <AnimatePresence>
                    {showCluesReview && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                        <div className="p-3 rounded-xl border border-border/30 bg-card space-y-2">
                          {gameData.shared_clues.map((c, i) => (
                            <p key={i} className="text-xs text-muted-foreground">• {c}</p>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="grid grid-cols-2 gap-3">
                    {filledNames.filter((_, i) => i !== currentVoterIndex).map((name, i) => (
                      <motion.button key={i} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                        onClick={() => handleVote(filledNames[currentVoterIndex], name)}
                        className="p-4 rounded-2xl border border-border/30 bg-card hover:shadow-lg transition-all">
                        <span className="text-2xl block mb-1">🤔</span>
                        <span className="text-sm font-bold text-foreground">{name}</span>
                      </motion.button>
                    ))}
                  </div>
                  <div className="flex justify-center gap-1">
                    {filledNames.map((_, i) => (
                      <div key={i} className="w-2 h-2 rounded-full"
                        style={{ background: i <= currentVoterIndex ? tc : "hsl(var(--muted))" }} />
                    ))}
                  </div>
                </motion.div>
              )}

              {/* RESULT */}
              {phase === "result" && gameData && (
                <motion.div key="result" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4">
                  <div className="rounded-2xl p-4 border border-border/30 text-center" style={{ background: `${tc}08` }}>
                    <h3 className="text-base font-black text-foreground mb-3">🗳️ نتائج التصويت</h3>
                    {(() => {
                      const voteCounts: Record<string, number> = {};
                      Object.values(votes).forEach(name => { voteCounts[name] = (voteCounts[name] || 0) + 1; });
                      const sorted = Object.entries(voteCounts).sort((a, b) => b[1] - a[1]);
                      return (
                        <div className="space-y-2">
                          {sorted.map(([name, count], i) => (
                            <div key={name} className="flex items-center gap-2">
                              <span className="text-sm font-bold text-foreground w-20 text-right">{name}</span>
                              <div className="flex-1 h-6 rounded-full bg-muted/30 overflow-hidden">
                                <motion.div initial={{ width: 0 }} animate={{ width: `${(count / filledNames.length) * 100}%` }}
                                  className="h-full rounded-full" style={{ background: i === 0 ? tc : `${tc}60` }} />
                              </div>
                              <span className="text-xs font-bold" style={{ color: tc }}>{count}</span>
                            </div>
                          ))}
                        </div>
                      );
                    })()}
                    <p className="text-sm font-bold mt-3 text-foreground">
                      المتهم الأول: <span style={{ color: tc }}>{getVoteResult()}</span>
                    </p>
                  </div>
                  {!showSolution ? (
                    <Button onClick={() => { playSuspense(); setShowSolution(true); }}
                      className="w-full h-11 text-white font-bold rounded-2xl"
                      style={{ background: `linear-gradient(135deg, ${tc}, ${tc}bb)` }}>
                      🔓 اكشف الحقيقة!
                    </Button>
                  ) : (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                      <div className={`rounded-2xl p-4 border-2 text-center ${
                        getVoteResult() === gameData.solution.criminal ? "border-green-500/50 bg-green-500/10" : "border-red-500/50 bg-red-500/10"
                      }`}>
                        <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: 2, duration: 0.5 }} className="text-4xl mb-2">
                          {getVoteResult() === gameData.solution.criminal ? "🎉" : "😱"}
                        </motion.div>
                        <p className="text-base font-black text-foreground">
                          {getVoteResult() === gameData.solution.criminal ? "أحسنتم! كشفتم المجرم! 🕵️" : "المجرم أفلت! 😈"}
                        </p>
                        <p className="text-sm mt-2">
                          المجرم الحقيقي: <span className="font-black" style={{ color: tc }}>{gameData.solution.criminal}</span>
                        </p>
                      </div>
                      <div className="rounded-2xl p-4 border border-border/30 bg-card">
                        <h4 className="text-sm font-bold text-foreground mb-2">📋 التفسير الكامل</h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">{gameData.solution.explanation}</p>
                      </div>
                      <Button onClick={resetGame} variant="outline" className="w-full h-11 font-bold rounded-2xl">
                        <RotateCcw className="h-4 w-4 ml-2" /> لعبة جديدة
                      </Button>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>

      {/* Instructions Modal */}
      <GameInstructions isOpen={showInstructions} onClose={() => setShowInstructions(false)} themeColor={tc} />
    </AnimatePresence>
  );
};

export default DetectiveGame;
