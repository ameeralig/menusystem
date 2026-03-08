import React, { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Trash2, Users, CreditCard, Sparkles, Crown, Mic, MicOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface BillPayerGameProps {
  isOpen: boolean;
  onClose: () => void;
  colorTheme?: string;
}

type GamePhase = "setup" | "spinning" | "result";

const EMOJIS = ["😄", "😎", "🤩", "😂", "🥳", "😜", "🤗", "😇", "🤠", "😏", "🧐", "🤓"];
const AVATAR_COLORS = ["#f87171", "#fb923c", "#fbbf24", "#34d399", "#60a5fa", "#a78bfa", "#f472b6", "#38bdf8", "#4ade80", "#e879f9", "#facc15", "#2dd4bf"];

// Sound effects using Web Audio API
const useGameSounds = () => {
  const audioCtxRef = useRef<AudioContext | null>(null);
  const getCtx = () => {
    if (!audioCtxRef.current) audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    return audioCtxRef.current;
  };

  const playTick = useCallback(() => {
    try {
      const ctx = getCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.frequency.value = 800 + Math.random() * 400;
      osc.type = "sine";
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);
      osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.06);
    } catch {}
  }, []);

  const playDrumroll = useCallback(() => {
    try {
      const ctx = getCtx();
      for (let i = 0; i < 30; i++) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        osc.frequency.value = 100 + Math.random() * 100;
        osc.type = "triangle";
        const t = ctx.currentTime + i * 0.05;
        gain.gain.setValueAtTime(0.05 + (i / 30) * 0.1, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
        osc.start(t); osc.stop(t + 0.04);
      }
    } catch {}
  }, []);

  const playWinner = useCallback(() => {
    try {
      const ctx = getCtx();
      [523, 659, 784, 1047].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        osc.frequency.value = freq;
        osc.type = "sine";
        const t = ctx.currentTime + i * 0.15;
        gain.gain.setValueAtTime(0.2, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
        osc.start(t); osc.stop(t + 0.3);
      });
    } catch {}
  }, []);

  return { playTick, playDrumroll, playWinner };
};

// Voice recognition hook
const useVoiceInput = (onNamesDetected: (names: string[]) => void) => {
  const [isListening, setIsListening] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState<string>("");
  const recognitionRef = useRef<any>(null);

  const startListening = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) { setVoiceStatus("المتصفح لا يدعم التعرف الصوتي"); return; }
    const recognition = new SpeechRecognition();
    recognition.lang = "ar-SA"; recognition.continuous = false; recognition.interimResults = false;
    recognition.onstart = () => { setIsListening(true); setVoiceStatus("🎙️ تكلّم الآن..."); };
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript as string;
      const rawNames = transcript.replace(/\bو\b/g, ",").replace(/\bمع\b/g, ",").replace(/\bثم\b/g, ",")
        .split(/[,،\s]+/).map((n: string) => n.trim()).filter((n: string) => n.length >= 2);
      if (rawNames.length > 0) { setVoiceStatus(`✅ تم التعرف على: ${rawNames.join("، ")}`); onNamesDetected(rawNames); }
      else setVoiceStatus("❌ لم أتمكن من التعرف على أسماء");
    };
    recognition.onerror = () => { setIsListening(false); setVoiceStatus("❌ حدث خطأ"); };
    recognition.onend = () => setIsListening(false);
    recognitionRef.current = recognition;
    recognition.start();
  }, [onNamesDetected]);

  const stopListening = useCallback(() => { recognitionRef.current?.stop(); setIsListening(false); }, []);
  return { isListening, voiceStatus, startListening, stopListening };
};

const BillPayerGame: React.FC<BillPayerGameProps> = ({ isOpen, onClose, colorTheme }) => {
  const [players, setPlayers] = useState<string[]>([]);
  const [newName, setNewName] = useState("");
  const [payersCount, setPayersCount] = useState(1);
  const [phase, setPhase] = useState<GamePhase>("setup");
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const [winners, setWinners] = useState<number[]>([]);
  const spinIntervalRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { playTick, playDrumroll, playWinner } = useGameSounds();

  const handleVoiceNames = useCallback((names: string[]) => {
    setPlayers((prev) => [...prev, ...names].slice(0, 12));
  }, []);

  const { isListening, voiceStatus, startListening, stopListening } = useVoiceInput(handleVoiceNames);

  const getThemeColor = () => {
    if (colorTheme?.startsWith("#")) return colorTheme;
    const colors: Record<string, string> = { coral: "#fb923c", purple: "#a855f7", blue: "#3b82f6", green: "#22c55e", red: "#ef4444" };
    return colors[colorTheme || ""] || "#3b82f6";
  };
  const themeColor = getThemeColor();

  const addPlayer = () => {
    const name = newName.trim();
    if (name && players.length < 12) { setPlayers((p) => [...p, name]); setNewName(""); }
  };

  const removePlayer = (idx: number) => setPlayers((p) => p.filter((_, i) => i !== idx));

  const resetGame = () => {
    setPhase("setup"); setHighlightIndex(-1); setWinners([]);
    if (spinIntervalRef.current) clearTimeout(spinIntervalRef.current);
  };

  const startSelection = () => {
    if (players.length < 2) return;
    setPhase("spinning"); setWinners([]); playDrumroll();
    let speed = 80; let count = 0;
    const totalTicks = 35 + Math.floor(Math.random() * 15);
    let currentIdx = 0;

    const tick = () => {
      currentIdx = (currentIdx + 1) % players.length;
      setHighlightIndex(currentIdx); playTick(); count++;
      if (count >= totalTicks) {
        if (spinIntervalRef.current) clearTimeout(spinIntervalRef.current);
        const indices = Array.from({ length: players.length }, (_, i) => i);
        const shuffled = indices.sort(() => Math.random() - 0.5);
        const selected = shuffled.slice(0, Math.min(payersCount, players.length));
        setTimeout(() => { setWinners(selected); setHighlightIndex(-1); setPhase("result"); playWinner(); }, 300);
        return;
      }
      speed = 80 + (count / totalTicks) * 300;
      spinIntervalRef.current = setTimeout(tick, speed);
    };
    spinIntervalRef.current = setTimeout(tick, speed);
  };

  useEffect(() => { return () => { if (spinIntervalRef.current) clearTimeout(spinIntervalRef.current); }; }, []);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
        onClick={(e) => e.target === e.currentTarget && phase !== "spinning" && onClose()}
      >
        <motion.div className="absolute inset-0 bg-black/70 backdrop-blur-md" />
        <motion.div
          initial={{ y: 100, opacity: 0, scale: 0.9 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 100, opacity: 0, scale: 0.9 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative w-full max-w-md max-h-[90vh] rounded-t-3xl sm:rounded-3xl bg-background shadow-2xl overflow-hidden flex flex-col border border-border/30"
          style={{ direction: "rtl" }}
        >
          {/* Header */}
          <div className="relative flex items-center justify-between p-4 text-white shrink-0 overflow-hidden"
            style={{ background: `linear-gradient(135deg, ${themeColor}, ${themeColor}99)` }}>
            <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-white/10 blur-xl" />
            <div className="absolute -bottom-6 -left-6 w-20 h-20 rounded-full bg-white/10 blur-lg" />
            <div className="relative flex items-center gap-3">
              <motion.div
                animate={{ rotate: [0, -5, 5, 0] }}
                transition={{ repeat: Infinity, duration: 3 }}
                className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm"
              >
                <CreditCard className="h-5 w-5" />
              </motion.div>
              <div>
                <h2 className="text-base font-black">من يدفع الحساب؟ 💸</h2>
                <p className="text-[10px] text-white/60">خلّ الحظ يقرر!</p>
              </div>
            </div>
            {phase !== "spinning" && (
              <button onClick={onClose} className="relative p-2 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-all">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Setup Phase */}
            {phase === "setup" && (
              <>
                {/* Add Player Input */}
                <div className="flex gap-2">
                  <Input
                    value={newName} onChange={(e) => setNewName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addPlayer()}
                    placeholder="أضف اسم شخص..."
                    className="flex-1 rounded-xl h-11 border-2" style={{ borderColor: `${themeColor}30` }}
                    maxLength={20}
                  />
                  <Button onClick={addPlayer} disabled={!newName.trim() || players.length >= 12}
                    className="rounded-xl px-3 h-11 text-white shadow-lg"
                    style={{ background: `linear-gradient(135deg, ${themeColor}, ${themeColor}cc)` }}>
                    <Plus className="h-5 w-5" />
                  </Button>
                  <Button
                    onClick={isListening ? stopListening : startListening}
                    disabled={players.length >= 12}
                    variant={isListening ? "destructive" : "outline"}
                    className={`rounded-xl px-3 h-11 ${isListening ? "animate-pulse" : ""}`}
                    style={!isListening ? { borderColor: `${themeColor}50`, color: themeColor } : {}}
                  >
                    {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                  </Button>
                </div>

                {voiceStatus && (
                  <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
                    className="text-xs text-center px-3 py-2 rounded-xl bg-muted text-muted-foreground border border-border/30">
                    {voiceStatus}
                  </motion.p>
                )}

                {/* Players Grid */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                    <Users className="h-3.5 w-3.5" />
                    <span>الأشخاص ({players.length}/12)</span>
                  </div>
                  <AnimatePresence>
                    {players.length === 0 ? (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="text-center py-10 space-y-3">
                        <motion.div animate={{ y: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 2.5 }}>
                          <span className="text-5xl block">👥</span>
                        </motion.div>
                        <p className="text-sm text-muted-foreground font-medium">أضف أسماء الأشخاص المشاركين</p>
                        <p className="text-[10px] text-muted-foreground">يمكنك استخدام الميكروفون 🎙️</p>
                      </motion.div>
                    ) : (
                      <div className="grid grid-cols-2 gap-2">
                        {players.map((name, idx) => (
                          <motion.div
                            key={`${name}-${idx}`}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ type: "spring", stiffness: 300 }}
                            className="flex items-center gap-2 p-2.5 rounded-xl border bg-card hover:shadow-md transition-all group"
                            style={{ borderColor: `${AVATAR_COLORS[idx % AVATAR_COLORS.length]}30` }}
                          >
                            <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-lg font-bold shrink-0 shadow-sm"
                              style={{ background: `linear-gradient(135deg, ${AVATAR_COLORS[idx % AVATAR_COLORS.length]}, ${AVATAR_COLORS[idx % AVATAR_COLORS.length]}bb)` }}>
                              {EMOJIS[idx % EMOJIS.length]}
                            </div>
                            <span className="flex-1 font-bold text-sm text-foreground truncate">{name}</span>
                            <button onClick={() => removePlayer(idx)}
                              className="p-1 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all">
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Payers Count */}
                {players.length >= 2 && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
                    <p className="text-xs font-bold text-foreground">كم شخص يدفع؟</p>
                    <div className="flex gap-2">
                      {[1, 2, 3].filter(n => n < players.length).map((n) => (
                        <motion.button key={n} whileTap={{ scale: 0.9 }}
                          onClick={() => setPayersCount(n)}
                          className={`flex-1 py-3 rounded-xl text-sm font-black border-2 transition-all ${
                            payersCount === n ? "text-white shadow-lg scale-105" : "bg-card text-foreground border-border hover:border-primary/30"
                          }`}
                          style={payersCount === n ? { background: `linear-gradient(135deg, ${themeColor}, ${themeColor}cc)`, borderColor: themeColor, boxShadow: `0 6px 20px ${themeColor}40` } : {}}
                        >
                          {n === 1 ? "شخص واحد" : `${n} أشخاص`}
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Start Button */}
                {players.length >= 2 && (
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button onClick={startSelection}
                      className="w-full h-14 rounded-2xl text-base font-black text-white shadow-xl"
                      style={{ background: `linear-gradient(135deg, ${themeColor}, ${themeColor}cc)`, boxShadow: `0 8px 30px ${themeColor}40` }}>
                      <Sparkles className="h-5 w-5 ml-2" />
                      يلا نشوف مين يدفع! 🎲
                    </Button>
                  </motion.div>
                )}
              </>
            )}

            {/* Spinning Phase */}
            {phase === "spinning" && (
              <div className="space-y-6 py-6">
                <motion.p animate={{ scale: [1, 1.05, 1] }} transition={{ repeat: Infinity, duration: 0.8 }}
                  className="text-center text-lg font-black text-foreground">
                  🥁 جاري الاختيار...
                </motion.p>

                {/* Circular layout for spinning */}
                <div className="relative w-64 h-64 mx-auto">
                  {/* Center glow */}
                  <motion.div
                    animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }}
                    transition={{ repeat: Infinity, duration: 1 }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full"
                    style={{ background: `radial-gradient(circle, ${themeColor}40, transparent)` }}
                  />

                  {players.map((name, idx) => {
                    const angle = (idx / players.length) * 2 * Math.PI - Math.PI / 2;
                    const radius = 95;
                    const x = Math.cos(angle) * radius + 128;
                    const y = Math.sin(angle) * radius + 128;
                    const isHighlighted = highlightIndex === idx;

                    return (
                      <motion.div
                        key={idx}
                        animate={{
                          scale: isHighlighted ? 1.3 : 0.8,
                          opacity: isHighlighted ? 1 : 0.35,
                        }}
                        transition={{ duration: 0.08 }}
                        className="absolute flex flex-col items-center gap-1"
                        style={{ left: x - 28, top: y - 28, width: 56 }}
                      >
                        <div className="w-12 h-12 rounded-full flex items-center justify-center text-white text-xl shadow-lg transition-all"
                          style={{
                            background: isHighlighted
                              ? `linear-gradient(135deg, ${themeColor}, ${themeColor}cc)`
                              : `linear-gradient(135deg, ${AVATAR_COLORS[idx % AVATAR_COLORS.length]}80, ${AVATAR_COLORS[idx % AVATAR_COLORS.length]}50)`,
                            boxShadow: isHighlighted ? `0 0 25px ${themeColor}60, 0 0 50px ${themeColor}30` : "none",
                          }}>
                          {EMOJIS[idx % EMOJIS.length]}
                        </div>
                        <span className={`text-[10px] font-bold truncate w-full text-center ${isHighlighted ? "text-foreground" : "text-muted-foreground"}`}>
                          {name}
                        </span>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Result Phase */}
            {phase === "result" && (
              <div className="space-y-6 py-4">
                {/* Confetti particles */}
                <div className="relative h-0">
                  {Array.from({ length: 20 }).map((_, i) => (
                    <motion.div key={i}
                      initial={{ opacity: 0, y: 0, x: 0 }}
                      animate={{
                        opacity: [0, 1, 0],
                        y: [-30, -120 - Math.random() * 80],
                        x: (Math.random() - 0.5) * 250,
                        rotate: Math.random() * 720,
                        scale: [0, 1, 0],
                      }}
                      transition={{ duration: 2, delay: i * 0.05 }}
                      className="absolute top-0 left-1/2 text-xl pointer-events-none"
                    >
                      {["🎉", "✨", "💰", "🎊", "⭐", "💸", "🎯", "💎", "🏆", "🔥"][i % 10]}
                    </motion.div>
                  ))}
                </div>

                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                  transition={{ type: "spring", damping: 10, stiffness: 200 }}
                  className="text-center">
                  <p className="text-base text-muted-foreground font-medium">
                    {winners.length === 1 ? "🎉 الشخص اللي يدفع هو:" : "🎉 الأشخاص اللي يدفعون:"}
                  </p>
                </motion.div>

                <div className="flex flex-col items-center gap-4">
                  {winners.map((winnerIdx, i) => (
                    <motion.div key={winnerIdx}
                      initial={{ scale: 0, rotate: -15, y: 30 }}
                      animate={{ scale: 1, rotate: 0, y: 0 }}
                      transition={{ type: "spring", delay: i * 0.3, damping: 12 }}
                      className="relative flex flex-col items-center gap-3 p-6 rounded-3xl border-2 w-full max-w-xs overflow-hidden"
                      style={{
                        borderColor: `${themeColor}50`,
                        background: `linear-gradient(145deg, ${themeColor}12, ${themeColor}05)`,
                        boxShadow: `0 10px 40px ${themeColor}25, 0 0 60px ${themeColor}10`,
                      }}>
                      {/* Background pattern */}
                      <div className="absolute inset-0 opacity-5"
                        style={{ backgroundImage: `radial-gradient(circle at 20% 50%, ${themeColor} 1px, transparent 1px)`, backgroundSize: "20px 20px" }} />

                      <div className="relative">
                        <motion.div animate={{ rotate: [0, -5, 5, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
                          <Crown className="h-8 w-8 absolute -top-7 left-1/2 -translate-x-1/2 text-amber-400 drop-shadow-lg" />
                        </motion.div>
                        <motion.div
                          animate={{ scale: [1, 1.05, 1] }}
                          transition={{ repeat: Infinity, duration: 1.5 }}
                          className="w-20 h-20 rounded-full flex items-center justify-center text-4xl shadow-xl"
                          style={{ background: `linear-gradient(135deg, ${AVATAR_COLORS[winnerIdx % AVATAR_COLORS.length]}, ${AVATAR_COLORS[winnerIdx % AVATAR_COLORS.length]}cc)` }}>
                          {EMOJIS[winnerIdx % EMOJIS.length]}
                        </motion.div>
                      </div>
                      <span className="relative text-2xl font-black text-foreground">{players[winnerIdx]}</span>
                      <span className="relative text-sm font-bold px-5 py-2 rounded-full text-white shadow-lg"
                        style={{ background: `linear-gradient(135deg, ${themeColor}, ${themeColor}cc)`, boxShadow: `0 4px 15px ${themeColor}40` }}>
                        💰 يدفع الحساب!
                      </span>
                    </motion.div>
                  ))}
                </div>

                <div className="flex gap-3 pt-2">
                  <Button onClick={startSelection} variant="outline" className="flex-1 h-12 rounded-xl font-bold">
                    🔄 إعادة
                  </Button>
                  <Button onClick={resetGame} className="flex-1 h-12 rounded-xl font-bold text-white shadow-lg"
                    style={{ background: `linear-gradient(135deg, ${themeColor}, ${themeColor}cc)` }}>
                    ✏️ تعديل
                  </Button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default BillPayerGame;
