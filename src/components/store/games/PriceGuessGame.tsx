import React, { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowUp, ArrowDown, Check, Trophy, RotateCcw, Target, Flame, Zap, Sparkles, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Product } from "@/types/product";
import { useGameLeaderboard } from "@/hooks/store/useGameLeaderboard";
import GameLeaderboard from "./GameLeaderboard";
import { UnlockedBadgesDisplay } from "./GameBadges";

interface PriceGuessGameProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  colorTheme?: string;
  storeOwnerId?: string;
}

const useGameSounds = () => {
  const ctxRef = useRef<AudioContext | null>(null);
  const getCtx = () => {
    if (!ctxRef.current) ctxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    return ctxRef.current;
  };
  const playClick = useCallback(() => { try { const ctx = getCtx(); const o = ctx.createOscillator(); const g = ctx.createGain(); o.connect(g); g.connect(ctx.destination); o.frequency.value = 600; o.type = "sine"; g.gain.setValueAtTime(0.1, ctx.currentTime); g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06); o.start(ctx.currentTime); o.stop(ctx.currentTime + 0.06); } catch {} }, []);
  const playCorrect = useCallback(() => { try { const ctx = getCtx(); [523, 659, 784, 1047].forEach((f, i) => { const o = ctx.createOscillator(); const g = ctx.createGain(); o.connect(g); g.connect(ctx.destination); o.frequency.value = f; o.type = "sine"; const t = ctx.currentTime + i * 0.12; g.gain.setValueAtTime(0.15, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.25); o.start(t); o.stop(t + 0.25); }); } catch {} }, []);
  const playWrong = useCallback(() => { try { const ctx = getCtx(); const o = ctx.createOscillator(); const g = ctx.createGain(); o.connect(g); g.connect(ctx.destination); o.frequency.value = 200; o.type = "sawtooth"; g.gain.setValueAtTime(0.08, ctx.currentTime); g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3); o.start(ctx.currentTime); o.stop(ctx.currentTime + 0.3); } catch {} }, []);
  const playTick = useCallback(() => { try { const ctx = getCtx(); const o = ctx.createOscillator(); const g = ctx.createGain(); o.connect(g); g.connect(ctx.destination); o.frequency.value = 1000; o.type = "sine"; g.gain.setValueAtTime(0.05, ctx.currentTime); g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03); o.start(ctx.currentTime); o.stop(ctx.currentTime + 0.03); } catch {} }, []);
  return { playClick, playCorrect, playWrong, playTick };
};

const STEP_VALUES = [250, 500, 1000];

const PriceGuessGame: React.FC<PriceGuessGameProps> = ({
  isOpen, onClose, products, colorTheme, storeOwnerId,
}) => {
  const [gameState, setGameState] = useState<"menu" | "playing" | "result" | "final">("menu");
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [guess, setGuess] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [hint, setHint] = useState<"higher" | "lower" | "correct" | null>(null);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);
  const [totalRounds] = useState(5);
  const [usedProducts, setUsedProducts] = useState<string[]>([]);
  const [roundScores, setRoundScores] = useState<number[]>([]);
  const [streak, setStreak] = useState(0);
  const [selectedStep, setSelectedStep] = useState(500);
  const [shakeGuess, setShakeGuess] = useState(false);
  const [pulseCorrect, setPulseCorrect] = useState(false);
  const [showParticles, setShowParticles] = useState(false);
  const [proximityPercent, setProximityPercent] = useState(0);
  const { playClick, playCorrect, playWrong, playTick } = useGameSounds();
  const { scores, loading: lbLoading, saveScore } = useGameLeaderboard(storeOwnerId, "price_guess");

  const themeColor = useMemo(() => {
    if (colorTheme?.startsWith("#")) return colorTheme;
    const colors: Record<string, string> = { coral: "#fb923c", purple: "#a855f7", blue: "#3b82f6", green: "#22c55e", red: "#ef4444" };
    return colors[colorTheme || ""] || "#3b82f6";
  }, [colorTheme]);

  const validProducts = useMemo(() => products.filter(p => p.price > 0 && p.image_url && p.image_url.trim() !== ""), [products]);
  const pickRandomProduct = useCallback(() => {
    const available = validProducts.filter(p => !usedProducts.includes(p.id));
    return available.length === 0 ? null : available[Math.floor(Math.random() * available.length)];
  }, [validProducts, usedProducts]);

  useEffect(() => {
    if (!currentProduct || gameState !== "playing") return;
    const diff = Math.abs(guess - currentProduct.price);
    const maxDiff = currentProduct.price * 2;
    setProximityPercent(Math.max(0, Math.min(100, ((maxDiff - diff) / maxDiff) * 100)));
  }, [guess, currentProduct, gameState]);

  const getProximityColor = () => {
    if (proximityPercent > 90) return "#22c55e";
    if (proximityPercent > 70) return "#84cc16";
    if (proximityPercent > 50) return "#eab308";
    if (proximityPercent > 30) return "#f97316";
    return "#ef4444";
  };

  const getProximityLabel = () => {
    if (proximityPercent > 90) return "🔥 قريب جداً!";
    if (proximityPercent > 70) return "🌡️ حار!";
    if (proximityPercent > 50) return "😐 دافئ";
    if (proximityPercent > 30) return "❄️ بارد";
    return "🥶 بعيد جداً";
  };

  const startGame = useCallback(() => {
    setScore(0); setRound(1); setUsedProducts([]); setRoundScores([]); setStreak(0);
    const product = pickRandomProduct();
    if (product) { setCurrentProduct(product); setGuess(Math.round(product.price * 0.5)); setAttempts(0); setHint(null); setGameState("playing"); }
  }, [pickRandomProduct]);

  const startNextRound = useCallback(() => {
    if (round >= totalRounds) { setGameState("final"); return; }
    const product = pickRandomProduct();
    if (product) { setCurrentProduct(product); setGuess(Math.round(product.price * 0.5)); setAttempts(0); setHint(null); setRound(r => r + 1); setGameState("playing"); }
    else setGameState("final");
  }, [round, totalRounds, pickRandomProduct]);

  const handleGuess = useCallback(() => {
    if (!currentProduct) return;
    const price = currentProduct.price;
    const tolerance = price * 0.1;
    setAttempts(a => a + 1);
    if (Math.abs(guess - price) <= tolerance) {
      setHint("correct"); setPulseCorrect(true); setShowParticles(true); playCorrect();
      const streakBonus = streak * 15;
      const roundScore = Math.max(10, 100 - (attempts * 15)) + streakBonus;
      setScore(s => s + roundScore); setRoundScores(prev => [...prev, roundScore]);
      setUsedProducts(prev => [...prev, currentProduct.id]); setStreak(s => s + 1);
      setTimeout(() => { setPulseCorrect(false); setShowParticles(false); setGameState("result"); }, 1200);
    } else if (guess < price) {
      setHint("higher"); setShakeGuess(true); playWrong(); setTimeout(() => setShakeGuess(false), 500);
    } else {
      setHint("lower"); setShakeGuess(true); playWrong(); setTimeout(() => setShakeGuess(false), 500);
    }
  }, [guess, currentProduct, attempts, streak, playCorrect, playWrong]);

  useEffect(() => {
    if (attempts >= 6 && hint !== "correct") {
      setRoundScores(prev => [...prev, 0]); setUsedProducts(prev => [...prev, currentProduct?.id || ""]); setStreak(0);
      setTimeout(() => setGameState("result"), 500);
    }
  }, [attempts, hint, currentProduct]);

  const adjustGuess = (amount: number) => { playTick(); setGuess(prev => Math.max(0, prev + amount)); };
  const getStarRating = () => { const pct = score / (totalRounds * 100); if (pct >= 0.8) return 3; if (pct >= 0.5) return 2; if (pct >= 0.2) return 1; return 0; };

  if (!isOpen) return null;

  if (validProducts.length < 3) {
    return (
      <AnimatePresence>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-3"
          onClick={(e) => e.target === e.currentTarget && onClose()}>
          <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }}
            className="w-full max-w-sm rounded-3xl bg-background shadow-2xl p-8 text-center border border-border/30" style={{ direction: "rtl" }}>
            <motion.span animate={{ y: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 2 }} className="text-6xl block mb-4">🏷️</motion.span>
            <h3 className="text-lg font-black text-foreground mb-2">تحتاج منتجات أكثر!</h3>
            <p className="text-sm text-muted-foreground mb-5">أضف على الأقل 3 منتجات بصور وأسعار</p>
            <Button onClick={onClose} variant="outline" className="w-full rounded-xl h-11 font-bold">حسناً</Button>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
        onClick={(e) => e.target === e.currentTarget && onClose()}>
        <motion.div className="absolute inset-0 bg-black/70 backdrop-blur-md" />
        <motion.div
          initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="relative w-full max-w-md max-h-[92vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl bg-background shadow-2xl border border-border/30"
          style={{ direction: "rtl" }}>
          {/* Header */}
          <div className="relative flex items-center justify-between p-4 text-white overflow-hidden"
            style={{ background: `linear-gradient(135deg, ${themeColor}, ${themeColor}bb)` }}>
            <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-white/10 blur-xl" />
            <div className="absolute -bottom-6 -left-6 w-20 h-20 rounded-full bg-white/10 blur-lg" />
            <div className="relative flex items-center gap-3">
              <motion.div animate={{ rotate: [0, -5, 5, 0] }} transition={{ repeat: Infinity, duration: 3 }}
                className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm text-xl">🏷️</motion.div>
              <div>
                <h2 className="text-base font-black">خمّن السعر</h2>
                <p className="text-[10px] text-white/60 flex items-center gap-1">
                  {streak > 1 && gameState === "playing" && (
                    <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }}
                      className="flex items-center gap-0.5 bg-white/20 px-1.5 py-0.5 rounded-full text-[9px]">
                      <Flame className="h-2.5 w-2.5" /> {streak}x
                    </motion.span>
                  )}
                  اختبر معرفتك بالأسعار!
                </p>
              </div>
            </div>
            <button onClick={onClose} className="relative p-2 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-all">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="p-4">
            {/* Menu */}
            {gameState === "menu" && (
              <div className="text-center space-y-5 py-6">
                <motion.div animate={{ y: [0, -10, 0], rotate: [0, 3, -3, 0] }}
                  transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}>
                  <span className="text-7xl block drop-shadow-lg">🏷️</span>
                </motion.div>
                <h3 className="text-2xl font-black text-foreground">خمّن السعر!</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  سنعرض لك منتجات من المتجر<br/>حاول تخمين سعرها الصحيح!
                </p>
                <div className="flex justify-center gap-2 flex-wrap">
                  {[{ icon: "🎯", label: `${totalRounds} جولات` }, { icon: "⚡", label: "6 محاولات" }, { icon: "🔥", label: "مضاعف" }].map((item, i) => (
                    <motion.span key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.1 }}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-muted text-xs font-bold text-foreground border border-border/30">
                      {item.icon} {item.label}
                    </motion.span>
                  ))}
                </div>
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <Button onClick={startGame}
                    className="w-full text-white font-black text-base py-6 rounded-2xl shadow-xl"
                    style={{ background: `linear-gradient(135deg, ${themeColor}, ${themeColor}cc)`, boxShadow: `0 8px 30px ${themeColor}40` }}>
                    <Target className="h-5 w-5 ml-2" /> ابدأ اللعب
                  </Button>
                </motion.div>
              </div>
            )}

            {/* Playing */}
            {gameState === "playing" && currentProduct && (
              <div className="space-y-3">
                {/* Round info */}
                <div className="flex items-center justify-between gap-2">
                  <span className="px-3 py-2 rounded-xl bg-muted text-xs font-black text-foreground">ج {round}/{totalRounds}</span>
                  <motion.span key={score} initial={{ scale: 1.2 }} animate={{ scale: 1 }}
                    className="px-3 py-2 rounded-xl text-xs font-black text-white shadow-md"
                    style={{ background: `linear-gradient(135deg, ${themeColor}, ${themeColor}cc)` }}>⭐ {score}</motion.span>
                  <span className="px-3 py-2 rounded-xl bg-muted text-xs font-black text-foreground">
                    {attempts}/6 {attempts >= 4 && "⚠️"}
                  </span>
                </div>

                {/* Attempt dots */}
                <div className="flex justify-center gap-1.5">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <motion.div key={i} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.05 }}
                      className={`w-2.5 h-2.5 rounded-full transition-all ${
                        i < attempts ? (hint === "correct" && i === attempts - 1 ? "bg-green-500 shadow-green-500/50 shadow-md" : "bg-red-400") : "bg-muted-foreground/20"
                      }`} />
                  ))}
                </div>

                {/* Product Image */}
                <div className="relative">
                  <motion.div animate={pulseCorrect ? { scale: [1, 1.03, 1] } : {}}
                    transition={{ repeat: pulseCorrect ? Infinity : 0, duration: 0.5 }}
                    className="rounded-2xl overflow-hidden aspect-[4/3] max-h-48 mx-auto bg-muted shadow-lg relative border border-border/30"
                    style={{ boxShadow: pulseCorrect ? `0 0 40px ${themeColor}50` : `0 8px 25px rgba(0,0,0,0.12)` }}>
                    <img src={currentProduct.image_url!} alt="خمن سعر هذا المنتج" className="w-full h-full object-cover" />
                    <div className="absolute bottom-0 inset-x-0 h-20 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
                      <span className="text-white text-xs bg-black/40 px-2.5 py-1.5 rounded-lg backdrop-blur-sm font-bold">{currentProduct.name}</span>
                    </div>
                  </motion.div>

                  {/* Particles on correct */}
                  {showParticles && Array.from({ length: 16 }).map((_, i) => (
                    <motion.div key={i}
                      initial={{ opacity: 1, scale: 1, x: 0, y: 0 }}
                      animate={{ opacity: 0, scale: 0, x: (Math.random() - 0.5) * 250, y: (Math.random() - 0.5) * 250, rotate: Math.random() * 720 }}
                      transition={{ duration: 1, delay: i * 0.03 }}
                      className="absolute top-1/2 left-1/2 text-lg pointer-events-none">
                      {["✨", "🎉", "💰", "⭐", "🔥", "💎", "🏆", "🎯"][i % 8]}
                    </motion.div>
                  ))}
                </div>

                {/* Proximity meter */}
                {attempts > 0 && hint !== "correct" && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground font-medium">مقياس القرب</span>
                      <motion.span key={proximityPercent} initial={{ scale: 1.3 }} animate={{ scale: 1 }}
                        className="font-black" style={{ color: getProximityColor() }}>{getProximityLabel()}</motion.span>
                    </div>
                    <div className="h-3 rounded-full bg-muted overflow-hidden relative">
                      <motion.div className="h-full rounded-full relative"
                        style={{ background: `linear-gradient(90deg, ${getProximityColor()}, ${getProximityColor()}cc)` }}
                        animate={{ width: `${proximityPercent}%` }} transition={{ duration: 0.5, ease: "easeOut" }}>
                        {proximityPercent > 15 && (
                          <motion.div className="absolute inset-0 bg-white/20" animate={{ x: ["-100%", "200%"] }}
                            transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }} style={{ width: "30%" }} />
                        )}
                      </motion.div>
                    </div>
                  </motion.div>
                )}

                {/* Hint */}
                <AnimatePresence mode="wait">
                  {hint && hint !== "correct" && (
                    <motion.div key={`${hint}-${attempts}`} initial={{ opacity: 0, y: -15, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                      className={`text-center py-3 rounded-xl text-sm font-black border ${
                        hint === "higher" ? "bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-950/50 dark:text-blue-400 dark:border-blue-800"
                        : "bg-orange-50 text-orange-600 border-orange-200 dark:bg-orange-950/50 dark:text-orange-400 dark:border-orange-800"
                      }`}>
                      {hint === "higher" ? (
                        <span className="flex items-center justify-center gap-2"><ArrowUp className="h-5 w-5" /> السعر أعلى! ⬆️</span>
                      ) : (
                        <span className="flex items-center justify-center gap-2"><ArrowDown className="h-5 w-5" /> السعر أقل! ⬇️</span>
                      )}
                    </motion.div>
                  )}
                  {hint === "correct" && (
                    <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }}
                      className="text-center py-3 rounded-xl text-base font-black bg-green-50 text-green-600 border border-green-200 dark:bg-green-950/50 dark:text-green-400 dark:border-green-800">
                      🎯 إجابة صحيحة! 🎉
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Guess Display */}
                <motion.div animate={shakeGuess ? { x: [-8, 8, -6, 6, -3, 3, 0] } : {}} transition={{ duration: 0.4 }}
                  className="flex items-center justify-center gap-4">
                  <motion.button whileTap={{ scale: 0.85 }}
                    className="h-14 w-14 rounded-2xl text-xl font-black border-2 flex items-center justify-center bg-card hover:shadow-lg transition-all"
                    onClick={() => adjustGuess(-selectedStep)} style={{ borderColor: `${themeColor}40` }}>
                    <ArrowDown className="h-5 w-5" style={{ color: themeColor }} />
                  </motion.button>
                  <motion.div key={guess} initial={{ scale: 1.1 }} animate={{ scale: 1 }}
                    className="text-4xl font-black min-w-[140px] text-center py-3 px-5 rounded-2xl border-2"
                    style={{ color: themeColor, background: `${themeColor}08`, borderColor: `${themeColor}30`, boxShadow: `0 4px 15px ${themeColor}15` }}>
                    {guess.toLocaleString()}
                  </motion.div>
                  <motion.button whileTap={{ scale: 0.85 }}
                    className="h-14 w-14 rounded-2xl text-xl font-black border-2 flex items-center justify-center bg-card hover:shadow-lg transition-all"
                    onClick={() => adjustGuess(selectedStep)} style={{ borderColor: `${themeColor}40` }}>
                    <ArrowUp className="h-5 w-5" style={{ color: themeColor }} />
                  </motion.button>
                </motion.div>

                {/* Step selector */}
                <div className="space-y-1.5">
                  <p className="text-[10px] text-muted-foreground text-center font-medium">مقدار التعديل</p>
                  <div className="flex justify-center gap-2">
                    {STEP_VALUES.map((step) => (
                      <motion.button key={step} whileTap={{ scale: 0.9 }}
                        onClick={() => { setSelectedStep(step); playClick(); }}
                        className={`px-4 py-2.5 rounded-xl text-sm font-black transition-all border-2 ${
                          selectedStep === step ? "text-white shadow-lg scale-105" : "bg-card text-foreground border-border/50 hover:border-primary/30"
                        }`}
                        style={selectedStep === step ? {
                          background: `linear-gradient(135deg, ${themeColor}, ${themeColor}cc)`,
                          borderColor: themeColor, boxShadow: `0 4px 15px ${themeColor}40`,
                        } : {}}>
                        {step >= 1000 ? `${step / 1000}K` : step}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Quick jump */}
                <div className="flex justify-center gap-1.5 flex-wrap">
                  {[-selectedStep * 5, -selectedStep * 2, selectedStep * 2, selectedStep * 5].map((amt, i) => (
                    <motion.button key={i} whileTap={{ scale: 0.9 }} onClick={() => adjustGuess(amt)}
                      className="px-3 py-2 rounded-xl text-xs font-bold bg-muted hover:bg-muted/70 transition-all text-foreground border border-border/30">
                      {amt > 0 ? `+${amt.toLocaleString()}` : amt.toLocaleString()}
                    </motion.button>
                  ))}
                </div>

                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button onClick={handleGuess}
                    className="w-full text-white font-black text-base py-5 rounded-2xl shadow-xl"
                    style={{ background: `linear-gradient(135deg, ${themeColor}, ${themeColor}cc)`, boxShadow: `0 8px 25px ${themeColor}35` }}
                    disabled={attempts >= 6 || hint === "correct"}>
                    <Zap className="h-5 w-5 ml-2" /> تخمين!
                  </Button>
                </motion.div>
              </div>
            )}

            {/* Round Result */}
            {gameState === "result" && currentProduct && (
              <div className="text-center space-y-4 py-6">
                <motion.div initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 200, damping: 12 }}>
                  {roundScores[roundScores.length - 1] > 0 ? (
                    <span className="text-6xl block">🎯</span>
                  ) : (
                    <motion.span animate={{ rotate: [0, 5, -5, 0] }} transition={{ repeat: Infinity, duration: 2 }} className="text-6xl block">😅</motion.span>
                  )}
                </motion.div>
                <h3 className="text-xl font-black text-foreground">{roundScores[roundScores.length - 1] > 0 ? "أحسنت! 🎉" : "لا بأس! 💪"}</h3>
                <p className="text-sm text-muted-foreground">سعر <span className="font-bold text-foreground">{currentProduct.name}</span> هو</p>
                <motion.div initial={{ scale: 0.5 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.2 }}
                  className="text-4xl font-black py-3 px-6 rounded-2xl inline-block border"
                  style={{ color: themeColor, background: `${themeColor}08`, borderColor: `${themeColor}20` }}>
                  {currentProduct.price.toLocaleString()}
                </motion.div>
                {roundScores[roundScores.length - 1] > 0 && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="space-y-1">
                    <p className="text-base font-black" style={{ color: themeColor }}>+{roundScores[roundScores.length - 1]} نقطة</p>
                    {streak > 1 && (
                      <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                        <Flame className="h-3 w-3 text-orange-500" /> سلسلة {streak}! 🔥
                      </p>
                    )}
                  </motion.div>
                )}
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button onClick={startNextRound}
                    className="w-full text-white font-black py-5 rounded-2xl shadow-lg"
                    style={{ background: `linear-gradient(135deg, ${themeColor}, ${themeColor}cc)` }}>
                    {round >= totalRounds ? "🏆 النتيجة النهائية" : `⚡ الجولة التالية (${round + 1}/${totalRounds})`}
                  </Button>
                </motion.div>
              </div>
            )}

            {/* Final Score */}
            {gameState === "final" && (
              <div className="text-center space-y-4 py-6 relative">
                {Array.from({ length: 12 }).map((_, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 0 }}
                    animate={{ opacity: [0, 1, 0], y: -100 - Math.random() * 100, x: (Math.random() - 0.5) * 200 }}
                    transition={{ duration: 2, delay: i * 0.15, repeat: Infinity, repeatDelay: 3 }}
                    className="absolute top-1/2 left-1/2 text-xl pointer-events-none">
                    {["⭐", "🏆", "💎", "🎯", "✨"][i % 5]}
                  </motion.div>
                ))}

                <motion.div initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 200 }}>
                  <div className="relative inline-block">
                    <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
                      <Trophy className="h-16 w-16 mx-auto drop-shadow-lg" style={{ color: themeColor }} />
                    </motion.div>
                    <motion.div animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0, 0.3] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                      className="absolute inset-0" style={{ background: `radial-gradient(circle, ${themeColor}30, transparent)` }} />
                  </div>
                </motion.div>

                <div className="flex justify-center gap-2">
                  {[1, 2, 3].map((star) => (
                    <motion.div key={star} initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: getStarRating() >= star ? 1 : 0.5, rotate: 0 }}
                      transition={{ delay: star * 0.2, type: "spring" }}>
                      <Star className={`h-9 w-9 drop-shadow-md ${getStarRating() >= star ? "" : "opacity-20 grayscale"}`}
                        fill={getStarRating() >= star ? "#fbbf24" : "transparent"}
                        stroke={getStarRating() >= star ? "#f59e0b" : "currentColor"} />
                    </motion.div>
                  ))}
                </div>

                <h3 className="text-xl font-black text-foreground">النتيجة النهائية</h3>
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.3 }}
                  className="text-5xl font-black py-2" style={{ color: themeColor }}>{score}</motion.div>
                <p className="text-sm text-muted-foreground">
                  أصبت في <span className="font-bold text-foreground">{roundScores.filter(s => s > 0).length}</span> من {totalRounds} جولات
                </p>

                <div className="flex justify-center gap-2 flex-wrap">
                  {roundScores.map((s, i) => (
                    <motion.span key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 + i * 0.1 }}
                      className={`text-xs px-3 py-1.5 rounded-full font-bold border ${
                        s > 0 ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-400 dark:border-green-800"
                        : "bg-red-50 text-red-600 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-800"}`}>
                      ج{i + 1}: {s > 0 ? `+${s}` : "✗"}
                    </motion.span>
                  ))}
                </div>

                <GameLeaderboard scores={scores} loading={lbLoading} currentScore={score}
                  onSaveScore={(name, phone) => saveScore(name, score, phone, { rounds: totalRounds, correct: roundScores.filter(s => s > 0).length })}
                  themeColor={themeColor} gameTitle="خمّن السعر" showSaveForm={score > 0} />

                <div className="flex gap-3 pt-2">
                  <motion.div className="flex-1" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                    <Button onClick={startGame} className="w-full text-white font-black py-5 rounded-2xl shadow-lg"
                      style={{ background: `linear-gradient(135deg, ${themeColor}, ${themeColor}cc)` }}>
                      <RotateCcw className="h-4 w-4 ml-2" /> العب مجدداً
                    </Button>
                  </motion.div>
                  <Button variant="outline" onClick={onClose} className="py-5 rounded-2xl px-6 font-bold">خروج</Button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PriceGuessGame;
