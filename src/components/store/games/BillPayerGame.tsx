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

// Sound effects using Web Audio API
const useGameSounds = () => {
  const audioCtxRef = useRef<AudioContext | null>(null);

  const getCtx = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioCtxRef.current;
  };

  const playTick = useCallback(() => {
    try {
      const ctx = getCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 800 + Math.random() * 400;
      osc.type = "sine";
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.08);
    } catch {}
  }, []);

  const playDrumroll = useCallback(() => {
    try {
      const ctx = getCtx();
      for (let i = 0; i < 30; i++) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = 100 + Math.random() * 100;
        osc.type = "triangle";
        const t = ctx.currentTime + i * 0.05;
        gain.gain.setValueAtTime(0.05 + (i / 30) * 0.1, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
        osc.start(t);
        osc.stop(t + 0.04);
      }
    } catch {}
  }, []);

  const playWinner = useCallback(() => {
    try {
      const ctx = getCtx();
      const notes = [523, 659, 784, 1047];
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = freq;
        osc.type = "sine";
        const t = ctx.currentTime + i * 0.15;
        gain.gain.setValueAtTime(0.2, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
        osc.start(t);
        osc.stop(t + 0.3);
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
    if (!SpeechRecognition) {
      setVoiceStatus("المتصفح لا يدعم التعرف الصوتي");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "ar-SA";
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      setVoiceStatus("🎙️ تكلّم الآن... قل الأسماء");
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript as string;
      // Parse names from speech - split by common Arabic conjunctions
      const rawNames = transcript
        .replace(/\bو\b/g, ",")
        .replace(/\bمع\b/g, ",")
        .replace(/\bثم\b/g, ",")
        .split(/[,،\s]+/)
        .map((n: string) => n.trim())
        .filter((n: string) => n.length >= 2);

      if (rawNames.length > 0) {
        setVoiceStatus(`✅ تم التعرف على: ${rawNames.join("، ")}`);
        onNamesDetected(rawNames);
      } else {
        setVoiceStatus("❌ لم أتمكن من التعرف على أسماء، حاول مرة أخرى");
      }
    };

    recognition.onerror = (event: any) => {
      setIsListening(false);
      if (event.error === "not-allowed") {
        setVoiceStatus("❌ يرجى السماح بالوصول للميكروفون");
      } else {
        setVoiceStatus("❌ حدث خطأ، حاول مرة أخرى");
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [onNamesDetected]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  return { isListening, voiceStatus, startListening, stopListening };
};

const BillPayerGame: React.FC<BillPayerGameProps> = ({
  isOpen,
  onClose,
  colorTheme,
}) => {
  const [players, setPlayers] = useState<string[]>([]);
  const [newName, setNewName] = useState("");
  const [payersCount, setPayersCount] = useState(1);
  const [phase, setPhase] = useState<GamePhase>("setup");
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const [winners, setWinners] = useState<number[]>([]);
  const spinIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { playTick, playDrumroll, playWinner } = useGameSounds();

  const getThemeColor = () => {
    if (colorTheme?.startsWith("#")) return colorTheme;
    const colors: Record<string, string> = {
      coral: "#fb923c", purple: "#a855f7", blue: "#3b82f6",
      green: "#22c55e", red: "#ef4444",
    };
    return colors[colorTheme || ""] || "#3b82f6";
  };
  const themeColor = getThemeColor();

  const addPlayer = () => {
    const name = newName.trim();
    if (name && players.length < 12) {
      setPlayers((p) => [...p, name]);
      setNewName("");
    }
  };

  const removePlayer = (idx: number) => {
    setPlayers((p) => p.filter((_, i) => i !== idx));
  };

  const resetGame = () => {
    setPhase("setup");
    setHighlightIndex(-1);
    setWinners([]);
    if (spinIntervalRef.current) clearInterval(spinIntervalRef.current);
  };

  const startSelection = () => {
    if (players.length < 2) return;
    setPhase("spinning");
    setWinners([]);
    playDrumroll();

    let speed = 80;
    let count = 0;
    const totalTicks = 35 + Math.floor(Math.random() * 15);
    let currentIdx = 0;

    const tick = () => {
      currentIdx = (currentIdx + 1) % players.length;
      setHighlightIndex(currentIdx);
      playTick();
      count++;

      if (count >= totalTicks) {
        // Final selection
        if (spinIntervalRef.current) clearInterval(spinIntervalRef.current);

        // Pick random winners
        const indices = Array.from({ length: players.length }, (_, i) => i);
        const shuffled = indices.sort(() => Math.random() - 0.5);
        const selected = shuffled.slice(0, Math.min(payersCount, players.length));

        setTimeout(() => {
          setWinners(selected);
          setHighlightIndex(-1);
          setPhase("result");
          playWinner();
        }, 300);
        return;
      }

      // Slow down gradually
      speed = 80 + (count / totalTicks) * 300;
      spinIntervalRef.current = setTimeout(tick, speed) as any;
    };

    spinIntervalRef.current = setTimeout(tick, speed) as any;
  };

  useEffect(() => {
    return () => {
      if (spinIntervalRef.current) clearTimeout(spinIntervalRef.current as any);
    };
  }, []);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm"
        onClick={(e) => e.target === e.currentTarget && phase !== "spinning" && onClose()}
      >
        <motion.div
          initial={{ y: 100, opacity: 0, scale: 0.9 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 100, opacity: 0, scale: 0.9 }}
          transition={{ type: "spring", damping: 25 }}
          className="w-full max-w-md max-h-[90vh] rounded-t-3xl sm:rounded-3xl bg-background shadow-2xl overflow-hidden flex flex-col"
          style={{ direction: "rtl" }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between p-4 text-white shrink-0"
            style={{ background: `linear-gradient(135deg, ${themeColor}, ${themeColor}aa)` }}
          >
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              <h2 className="text-lg font-bold">من سيدفع الحساب؟ 💸</h2>
            </div>
            {phase !== "spinning" && (
              <button onClick={onClose} className="p-1 rounded-full hover:bg-white/20">
                <X className="h-5 w-5" />
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Setup Phase */}
            {phase === "setup" && (
              <>
                {/* Add Player */}
                <div className="flex gap-2">
                  <Input
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addPlayer()}
                    placeholder="أضف اسم شخص..."
                    className="flex-1 rounded-xl"
                    maxLength={20}
                  />
                  <Button
                    onClick={addPlayer}
                    disabled={!newName.trim() || players.length >= 12}
                    className="rounded-xl px-3"
                    style={{ background: themeColor }}
                  >
                    <Plus className="h-5 w-5" />
                  </Button>
                </div>

                {/* Players List */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>الأشخاص ({players.length}/12)</span>
                  </div>
                  <AnimatePresence>
                    {players.map((name, idx) => (
                      <motion.div
                        key={`${name}-${idx}`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="flex items-center gap-3 p-3 rounded-xl border bg-card"
                      >
                        <span className="text-xl">{EMOJIS[idx % EMOJIS.length]}</span>
                        <span className="flex-1 font-medium text-foreground">{name}</span>
                        <button
                          onClick={() => removePlayer(idx)}
                          className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  {players.length === 0 && (
                    <p className="text-center text-sm text-muted-foreground py-8">
                      أضف أسماء الأشخاص المشاركين 👥
                    </p>
                  )}
                </div>

                {/* Payers Count */}
                {players.length >= 2 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-foreground">كم شخص يدفع؟</p>
                    <div className="flex gap-2">
                      {[1, 2, 3].filter(n => n < players.length).map((n) => (
                        <button
                          key={n}
                          onClick={() => setPayersCount(n)}
                          className={`flex-1 py-2.5 rounded-xl text-sm font-bold border-2 transition-all ${
                            payersCount === n
                              ? "text-white shadow-lg scale-105"
                              : "bg-card text-foreground border-border hover:border-primary/50"
                          }`}
                          style={payersCount === n ? { background: themeColor, borderColor: themeColor } : {}}
                        >
                          {n === 1 ? "شخص واحد" : `${n} أشخاص`}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Start Button */}
                {players.length >= 2 && (
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      onClick={startSelection}
                      className="w-full h-14 rounded-2xl text-lg font-bold text-white shadow-xl"
                      style={{ background: `linear-gradient(135deg, ${themeColor}, ${themeColor}cc)` }}
                    >
                      <Sparkles className="h-5 w-5 ml-2" />
                      يلا نشوف مين يدفع! 🎲
                    </Button>
                  </motion.div>
                )}
              </>
            )}

            {/* Spinning Phase */}
            {phase === "spinning" && (
              <div className="space-y-4 py-4">
                <motion.p
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ repeat: Infinity, duration: 0.8 }}
                  className="text-center text-lg font-bold text-foreground"
                >
                  🥁 جاري الاختيار...
                </motion.p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {players.map((name, idx) => (
                    <motion.div
                      key={idx}
                      animate={{
                        scale: highlightIndex === idx ? 1.15 : 0.95,
                        opacity: highlightIndex === idx ? 1 : 0.4,
                      }}
                      transition={{ duration: 0.1 }}
                      className="flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all"
                      style={{
                        borderColor: highlightIndex === idx ? themeColor : "transparent",
                        background: highlightIndex === idx ? `${themeColor}20` : undefined,
                        boxShadow: highlightIndex === idx ? `0 0 20px ${themeColor}40` : "none",
                      }}
                    >
                      <span className="text-3xl">{EMOJIS[idx % EMOJIS.length]}</span>
                      <span className="text-sm font-bold text-foreground truncate w-full text-center">{name}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Result Phase */}
            {phase === "result" && (
              <div className="space-y-6 py-4">
                {/* Confetti-like particles */}
                <div className="relative">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 0, x: 0 }}
                      animate={{
                        opacity: [0, 1, 0],
                        y: [-20, -80 - Math.random() * 60],
                        x: (Math.random() - 0.5) * 200,
                        rotate: Math.random() * 360,
                      }}
                      transition={{ duration: 1.5, delay: i * 0.05 }}
                      className="absolute top-1/2 left-1/2 text-xl pointer-events-none"
                    >
                      {["🎉", "✨", "💰", "🎊", "⭐", "💸"][i % 6]}
                    </motion.div>
                  ))}
                </div>

                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", damping: 10, stiffness: 200 }}
                  className="text-center"
                >
                  <p className="text-lg text-muted-foreground mb-4">
                    {winners.length === 1 ? "🎉 الشخص اللي يدفع هو:" : "🎉 الأشخاص اللي يدفعون هم:"}
                  </p>
                </motion.div>

                <div className="flex flex-col items-center gap-4">
                  {winners.map((winnerIdx, i) => (
                    <motion.div
                      key={winnerIdx}
                      initial={{ scale: 0, rotate: -10 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: "spring", delay: i * 0.3, damping: 12 }}
                      className="flex flex-col items-center gap-3 p-6 rounded-3xl border-2 w-full max-w-xs shadow-2xl"
                      style={{
                        borderColor: themeColor,
                        background: `linear-gradient(135deg, ${themeColor}15, ${themeColor}05)`,
                        boxShadow: `0 10px 40px ${themeColor}30`,
                      }}
                    >
                      <div className="relative">
                        <motion.div
                          animate={{ rotate: [0, -5, 5, 0] }}
                          transition={{ repeat: Infinity, duration: 2 }}
                        >
                          <Crown className="h-8 w-8 absolute -top-6 left-1/2 -translate-x-1/2" style={{ color: "#f59e0b" }} />
                        </motion.div>
                        <span className="text-5xl">{EMOJIS[winnerIdx % EMOJIS.length]}</span>
                      </div>
                      <span className="text-2xl font-black text-foreground">{players[winnerIdx]}</span>
                      <span className="text-sm font-medium px-4 py-1.5 rounded-full text-white" style={{ background: themeColor }}>
                        💰 يدفع الحساب!
                      </span>
                    </motion.div>
                  ))}
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={startSelection}
                    variant="outline"
                    className="flex-1 h-12 rounded-xl font-bold"
                  >
                    🔄 إعادة الاختيار
                  </Button>
                  <Button
                    onClick={resetGame}
                    className="flex-1 h-12 rounded-xl font-bold text-white"
                    style={{ background: themeColor }}
                  >
                    ✏️ تعديل الأسماء
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
