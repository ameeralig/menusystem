import React, { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowUp, ArrowDown, Check, Trophy, RotateCcw, Target, Flame, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Product } from "@/types/product";
import { useGameLeaderboard } from "@/hooks/store/useGameLeaderboard";
import GameLeaderboard from "./GameLeaderboard";

interface PriceGuessGameProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  colorTheme?: string;
  storeOwnerId?: string;
}

// Sound effects
const useGameSounds = () => {
  const ctxRef = useRef<AudioContext | null>(null);
  const getCtx = () => {
    if (!ctxRef.current) ctxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    return ctxRef.current;
  };

  const playClick = useCallback(() => {
    try {
      const ctx = getCtx();
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination);
      o.frequency.value = 600;
      o.type = "sine";
      g.gain.setValueAtTime(0.1, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);
      o.start(ctx.currentTime); o.stop(ctx.currentTime + 0.06);
    } catch {}
  }, []);

  const playCorrect = useCallback(() => {
    try {
      const ctx = getCtx();
      [523, 659, 784, 1047].forEach((f, i) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.connect(g); g.connect(ctx.destination);
        o.frequency.value = f;
        o.type = "sine";
        const t = ctx.currentTime + i * 0.12;
        g.gain.setValueAtTime(0.15, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
        o.start(t); o.stop(t + 0.25);
      });
    } catch {}
  }, []);

  const playWrong = useCallback(() => {
    try {
      const ctx = getCtx();
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination);
      o.frequency.value = 200;
      o.type = "sawtooth";
      g.gain.setValueAtTime(0.08, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      o.start(ctx.currentTime); o.stop(ctx.currentTime + 0.3);
    } catch {}
  }, []);

  const playTick = useCallback(() => {
    try {
      const ctx = getCtx();
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination);
      o.frequency.value = 1000;
      o.type = "sine";
      g.gain.setValueAtTime(0.05, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03);
      o.start(ctx.currentTime); o.stop(ctx.currentTime + 0.03);
    } catch {}
  }, []);

  return { playClick, playCorrect, playWrong, playTick };
};

const STEP_VALUES = [250, 500, 1000];

const PriceGuessGame: React.FC<PriceGuessGameProps> = ({
  isOpen,
  onClose,
  products,
  colorTheme,
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

  const themeColor = useMemo(() => {
    if (colorTheme?.startsWith("#")) return colorTheme;
    const colors: Record<string, string> = {
      coral: "#fb923c", purple: "#a855f7", blue: "#3b82f6",
      green: "#22c55e", red: "#ef4444",
    };
    return colors[colorTheme || ""] || "#3b82f6";
  }, [colorTheme]);

  const validProducts = useMemo(() => {
    return products.filter(p => p.price > 0 && p.image_url && p.image_url.trim() !== "");
  }, [products]);

  const pickRandomProduct = useCallback(() => {
    const available = validProducts.filter(p => !usedProducts.includes(p.id));
    if (available.length === 0) return null;
    return available[Math.floor(Math.random() * available.length)];
  }, [validProducts, usedProducts]);

  // Calculate proximity to correct price (0-100%)
  useEffect(() => {
    if (!currentProduct || gameState !== "playing") return;
    const diff = Math.abs(guess - currentProduct.price);
    const maxDiff = currentProduct.price * 2;
    const pct = Math.max(0, Math.min(100, ((maxDiff - diff) / maxDiff) * 100));
    setProximityPercent(pct);
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
    setScore(0);
    setRound(1);
    setUsedProducts([]);
    setRoundScores([]);
    setStreak(0);
    const product = pickRandomProduct();
    if (product) {
      setCurrentProduct(product);
      setGuess(Math.round(product.price * 0.5));
      setAttempts(0);
      setHint(null);
      setGameState("playing");
    }
  }, [pickRandomProduct]);

  const startNextRound = useCallback(() => {
    if (round >= totalRounds) {
      setGameState("final");
      return;
    }
    const product = pickRandomProduct();
    if (product) {
      setCurrentProduct(product);
      setGuess(Math.round(product.price * 0.5));
      setAttempts(0);
      setHint(null);
      setRound(r => r + 1);
      setGameState("playing");
    } else {
      setGameState("final");
    }
  }, [round, totalRounds, pickRandomProduct]);

  const handleGuess = useCallback(() => {
    if (!currentProduct) return;
    const price = currentProduct.price;
    const tolerance = price * 0.1;

    setAttempts(a => a + 1);

    if (Math.abs(guess - price) <= tolerance) {
      setHint("correct");
      setPulseCorrect(true);
      setShowParticles(true);
      playCorrect();
      const streakBonus = streak * 15;
      const roundScore = Math.max(10, 100 - (attempts * 15)) + streakBonus;
      setScore(s => s + roundScore);
      setRoundScores(prev => [...prev, roundScore]);
      setUsedProducts(prev => [...prev, currentProduct.id]);
      setStreak(s => s + 1);
      setTimeout(() => {
        setPulseCorrect(false);
        setShowParticles(false);
        setGameState("result");
      }, 1200);
    } else if (guess < price) {
      setHint("higher");
      setShakeGuess(true);
      playWrong();
      setTimeout(() => setShakeGuess(false), 500);
    } else {
      setHint("lower");
      setShakeGuess(true);
      playWrong();
      setTimeout(() => setShakeGuess(false), 500);
    }
  }, [guess, currentProduct, attempts, streak, playCorrect, playWrong]);

  useEffect(() => {
    if (attempts >= 6 && hint !== "correct") {
      setRoundScores(prev => [...prev, 0]);
      setUsedProducts(prev => [...prev, currentProduct?.id || ""]);
      setStreak(0);
      setTimeout(() => setGameState("result"), 500);
    }
  }, [attempts, hint, currentProduct]);

  const adjustGuess = (amount: number) => {
    playTick();
    setGuess(prev => Math.max(0, prev + amount));
  };

  const getStarRating = () => {
    const maxScore = totalRounds * 100;
    const pct = score / maxScore;
    if (pct >= 0.8) return 3;
    if (pct >= 0.5) return 2;
    if (pct >= 0.2) return 1;
    return 0;
  };

  if (!isOpen) return null;

  if (validProducts.length < 3) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-3"
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            initial={{ scale: 0.9 }} animate={{ scale: 1 }}
            className="w-full max-w-sm rounded-2xl bg-background shadow-2xl p-6 text-center"
            style={{ direction: "rtl" }}
          >
            <span className="text-5xl block mb-3">🏷️</span>
            <h3 className="text-lg font-bold text-foreground mb-2">تحتاج منتجات أكثر!</h3>
            <p className="text-sm text-muted-foreground mb-4">
              أضف على الأقل 3 منتجات بصور وأسعار لتتمكن من لعب خمّن السعر
            </p>
            <Button onClick={onClose} variant="outline" className="w-full">حسناً</Button>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="w-full max-w-md max-h-[92vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl bg-background shadow-2xl border border-border/50"
          style={{ direction: "rtl" }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between p-4 text-white relative overflow-hidden"
            style={{ background: `linear-gradient(135deg, ${themeColor}, ${themeColor}bb)` }}
          >
            <div className="flex items-center gap-2 z-10">
              <span className="text-xl">🏷️</span>
              <h2 className="text-base font-bold">خمّن السعر</h2>
              {streak > 1 && gameState === "playing" && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="flex items-center gap-0.5 text-xs bg-white/20 px-2 py-0.5 rounded-full"
                >
                  <Flame className="h-3 w-3" /> {streak}x
                </motion.span>
              )}
            </div>
            <button onClick={onClose} className="p-1.5 rounded-full hover:bg-white/20 transition-colors z-10">
              <X className="h-4 w-4" />
            </button>
            {/* Decorative circles */}
            <div className="absolute -top-4 -left-4 w-20 h-20 rounded-full bg-white/5" />
            <div className="absolute -bottom-6 -right-6 w-28 h-28 rounded-full bg-white/5" />
          </div>

          <div className="p-4">
            {/* Menu */}
            {gameState === "menu" && (
              <div className="text-center space-y-5 py-6">
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
                >
                  <span className="text-7xl block">🏷️</span>
                </motion.div>
                <h3 className="text-2xl font-black text-foreground">خمّن السعر!</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  سنعرض لك منتجات من المتجر<br/>
                  حاول تخمين سعرها الصحيح!<br/>
                </p>
                <div className="flex justify-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-muted">
                    🎯 {totalRounds} جولات
                  </span>
                  <span className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-muted">
                    ⚡ 6 محاولات
                  </span>
                  <span className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-muted">
                    🔥 مضاعف السلسلة
                  </span>
                </div>
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <Button
                    onClick={startGame}
                    className="w-full text-white font-bold text-base py-6 rounded-2xl shadow-lg"
                    style={{ background: `linear-gradient(135deg, ${themeColor}, ${themeColor}cc)` }}
                  >
                    <Target className="h-5 w-5 ml-2" />
                    ابدأ اللعب
                  </Button>
                </motion.div>
              </div>
            )}

            {/* Playing */}
            {gameState === "playing" && currentProduct && (
              <div className="space-y-3">
                {/* Round info */}
                <div className="flex items-center justify-between text-xs">
                  <span className="px-2.5 py-1.5 rounded-lg bg-muted font-bold text-foreground">
                    الجولة {round}/{totalRounds}
                  </span>
                  <span className="px-2.5 py-1.5 rounded-lg font-bold text-white" style={{ background: themeColor }}>
                    ⭐ {score}
                  </span>
                  <span className="px-2.5 py-1.5 rounded-lg bg-muted font-bold text-foreground">
                    المحاولة {attempts}/6
                  </span>
                </div>

                {/* Product Image with glow */}
                <div className="relative">
                  <motion.div
                    animate={pulseCorrect ? { scale: [1, 1.05, 1] } : {}}
                    transition={{ repeat: pulseCorrect ? Infinity : 0, duration: 0.5 }}
                    className="rounded-2xl overflow-hidden aspect-square max-h-52 mx-auto bg-muted shadow-lg relative"
                    style={{
                      boxShadow: pulseCorrect ? `0 0 30px ${themeColor}60` : `0 4px 20px rgba(0,0,0,0.1)`,
                    }}
                  >
                    <img
                      src={currentProduct.image_url!}
                      alt="خمن سعر هذا المنتج"
                      className="w-full h-full object-cover"
                    />
                    {/* Overlay gradient */}
                    <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-black/40 to-transparent" />
                    <span className="absolute bottom-2 left-2 text-white text-xs bg-black/40 px-2 py-1 rounded-lg backdrop-blur-sm">
                      {currentProduct.name}
                    </span>
                  </motion.div>

                  {/* Particles on correct */}
                  {showParticles && (
                    <>
                      {Array.from({ length: 16 }).map((_, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 1, scale: 1, x: 0, y: 0 }}
                          animate={{
                            opacity: 0,
                            scale: 0,
                            x: (Math.random() - 0.5) * 250,
                            y: (Math.random() - 0.5) * 250,
                            rotate: Math.random() * 720,
                          }}
                          transition={{ duration: 1, delay: i * 0.03 }}
                          className="absolute top-1/2 left-1/2 text-lg pointer-events-none"
                        >
                          {["✨", "🎉", "💰", "⭐", "🔥", "💎", "🏆", "🎯"][i % 8]}
                        </motion.div>
                      ))}
                    </>
                  )}
                </div>

                {/* Proximity meter */}
                {attempts > 0 && hint !== "correct" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="space-y-1"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground font-medium">مقياس القرب</span>
                      <motion.span
                        key={proximityPercent}
                        initial={{ scale: 1.3 }}
                        animate={{ scale: 1 }}
                        className="font-bold"
                        style={{ color: getProximityColor() }}
                      >
                        {getProximityLabel()}
                      </motion.span>
                    </div>
                    <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                      <motion.div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ background: `linear-gradient(90deg, ${getProximityColor()}, ${getProximityColor()}cc)` }}
                        animate={{ width: `${proximityPercent}%` }}
                      />
                    </div>
                  </motion.div>
                )}

                {/* Hint */}
                <AnimatePresence mode="wait">
                  {hint && hint !== "correct" && (
                    <motion.div
                      key={`${hint}-${attempts}`}
                      initial={{ opacity: 0, y: -15, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className={`text-center py-2.5 rounded-xl text-sm font-bold ${
                        hint === "higher"
                          ? "bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400"
                          : "bg-orange-50 text-orange-600 dark:bg-orange-950 dark:text-orange-400"
                      }`}
                    >
                      {hint === "higher" ? (
                        <span className="flex items-center justify-center gap-2">
                          <ArrowUp className="h-5 w-5" /> السعر أعلى! ⬆️
                        </span>
                      ) : (
                        <span className="flex items-center justify-center gap-2">
                          <ArrowDown className="h-5 w-5" /> السعر أقل! ⬇️
                        </span>
                      )}
                    </motion.div>
                  )}
                  {hint === "correct" && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center py-3 rounded-xl text-base font-black bg-green-50 text-green-600 dark:bg-green-950 dark:text-green-400"
                    >
                      🎯 إجابة صحيحة! 🎉
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Guess Display */}
                <motion.div
                  animate={shakeGuess ? { x: [-8, 8, -6, 6, -3, 3, 0] } : {}}
                  transition={{ duration: 0.4 }}
                  className="flex items-center justify-center gap-4"
                >
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-12 w-12 rounded-full text-xl font-black border-2 hover:scale-110 transition-transform"
                    onClick={() => adjustGuess(-selectedStep)}
                    style={{ borderColor: `${themeColor}50` }}
                  >
                    -
                  </Button>
                  <motion.div
                    key={guess}
                    initial={{ scale: 1.1 }}
                    animate={{ scale: 1 }}
                    className="text-4xl font-black min-w-[130px] text-center py-3 px-5 rounded-2xl border-2"
                    style={{
                      color: themeColor,
                      background: `${themeColor}08`,
                      borderColor: `${themeColor}30`,
                    }}
                  >
                    {guess.toLocaleString()}
                  </motion.div>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-12 w-12 rounded-full text-xl font-black border-2 hover:scale-110 transition-transform"
                    onClick={() => adjustGuess(selectedStep)}
                    style={{ borderColor: `${themeColor}50` }}
                  >
                    +
                  </Button>
                </motion.div>

                {/* Step selector */}
                <div className="space-y-1.5">
                  <p className="text-xs text-muted-foreground text-center font-medium">مقدار الزيادة/النقصان</p>
                  <div className="flex justify-center gap-2">
                    {STEP_VALUES.map((step) => (
                      <motion.button
                        key={step}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => { setSelectedStep(step); playClick(); }}
                        className={`px-4 py-2 rounded-xl text-sm font-bold transition-all border-2 ${
                          selectedStep === step
                            ? "text-white shadow-md scale-105"
                            : "bg-muted text-foreground border-transparent hover:border-primary/30"
                        }`}
                        style={selectedStep === step ? {
                          background: `linear-gradient(135deg, ${themeColor}, ${themeColor}cc)`,
                          borderColor: themeColor,
                        } : {}}
                      >
                        {step >= 1000 ? `${step / 1000}K` : step}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Quick jump buttons */}
                <div className="flex justify-center gap-1.5 flex-wrap">
                  {[-selectedStep * 5, -selectedStep * 2, selectedStep * 2, selectedStep * 5].map((amt, i) => (
                    <motion.button
                      key={i}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => adjustGuess(amt)}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold bg-muted hover:bg-muted/70 transition-all text-foreground"
                    >
                      {amt > 0 ? `+${amt.toLocaleString()}` : amt.toLocaleString()}
                    </motion.button>
                  ))}
                </div>

                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    onClick={handleGuess}
                    className="w-full text-white font-bold text-base py-5 rounded-2xl shadow-lg"
                    style={{ background: `linear-gradient(135deg, ${themeColor}, ${themeColor}cc)` }}
                    disabled={attempts >= 6 || hint === "correct"}
                  >
                    <Zap className="h-5 w-5 ml-2" />
                    تخمين!
                  </Button>
                </motion.div>
              </div>
            )}

            {/* Round Result */}
            {gameState === "result" && currentProduct && (
              <div className="text-center space-y-4 py-6">
                <motion.div
                  initial={{ scale: 0, rotate: -20 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 200, damping: 12 }}
                >
                  {roundScores[roundScores.length - 1] > 0 ? (
                    <span className="text-6xl block">🎯</span>
                  ) : (
                    <span className="text-6xl block">😅</span>
                  )}
                </motion.div>
                <motion.h3
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xl font-black text-foreground"
                >
                  {roundScores[roundScores.length - 1] > 0 ? "أحسنت! 🎉" : "لا بأس! 💪"}
                </motion.h3>
                <p className="text-sm text-muted-foreground">
                  سعر <span className="font-bold text-foreground">{currentProduct.name}</span> هو
                </p>
                <motion.div
                  initial={{ scale: 0.5 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: 0.2 }}
                  className="text-4xl font-black py-3 px-6 rounded-2xl inline-block"
                  style={{ color: themeColor, background: `${themeColor}10` }}
                >
                  {currentProduct.price.toLocaleString()}
                </motion.div>
                {roundScores[roundScores.length - 1] > 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="space-y-1"
                  >
                    <p className="text-base font-bold" style={{ color: themeColor }}>
                      +{roundScores[roundScores.length - 1]} نقطة
                    </p>
                    {streak > 1 && (
                      <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                        <Flame className="h-3 w-3 text-orange-500" />
                        سلسلة {streak} إجابات صحيحة! 🔥
                      </p>
                    )}
                  </motion.div>
                )}
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    onClick={startNextRound}
                    className="w-full text-white font-bold py-5 rounded-2xl"
                    style={{ background: `linear-gradient(135deg, ${themeColor}, ${themeColor}cc)` }}
                  >
                    {round >= totalRounds ? "🏆 عرض النتيجة النهائية" : `⚡ الجولة التالية (${round + 1}/${totalRounds})`}
                  </Button>
                </motion.div>
              </div>
            )}

            {/* Final Score */}
            {gameState === "final" && (
              <div className="text-center space-y-4 py-6 relative">
                {/* Background particles */}
                {Array.from({ length: 10 }).map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 0 }}
                    animate={{
                      opacity: [0, 1, 0],
                      y: -100 - Math.random() * 100,
                      x: (Math.random() - 0.5) * 200,
                    }}
                    transition={{ duration: 2, delay: i * 0.15, repeat: Infinity, repeatDelay: 3 }}
                    className="absolute top-1/2 left-1/2 text-xl pointer-events-none"
                  >
                    {["⭐", "🏆", "💎", "🎯", "✨"][i % 5]}
                  </motion.div>
                ))}

                <motion.div
                  initial={{ scale: 0, rotate: -20 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 200 }}
                >
                  <Trophy className="h-16 w-16 mx-auto" style={{ color: themeColor }} />
                </motion.div>

                {/* Stars */}
                <div className="flex justify-center gap-2">
                  {[1, 2, 3].map((star) => (
                    <motion.span
                      key={star}
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: getStarRating() >= star ? 1 : 0.5, rotate: 0 }}
                      transition={{ delay: star * 0.2, type: "spring" }}
                      className={`text-3xl ${getStarRating() >= star ? "" : "opacity-20 grayscale"}`}
                    >
                      ⭐
                    </motion.span>
                  ))}
                </div>

                <h3 className="text-xl font-black text-foreground">النتيجة النهائية</h3>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: 0.3 }}
                  className="text-5xl font-black py-2"
                  style={{ color: themeColor }}
                >
                  {score}
                </motion.div>
                <p className="text-sm text-muted-foreground">
                  أصبت في <span className="font-bold text-foreground">{roundScores.filter(s => s > 0).length}</span> من {totalRounds} جولات
                </p>

                {/* Score breakdown */}
                <div className="flex justify-center gap-2 flex-wrap">
                  {roundScores.map((s, i) => (
                    <motion.span
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 + i * 0.1 }}
                      className={`text-xs px-3 py-1.5 rounded-full font-bold ${
                        s > 0
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                      }`}
                    >
                      ج{i + 1}: {s > 0 ? `+${s}` : "✗"}
                    </motion.span>
                  ))}
                </div>

                <div className="flex gap-3 pt-2">
                  <motion.div className="flex-1" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                    <Button onClick={startGame} className="w-full text-white font-bold py-5 rounded-2xl" style={{ background: themeColor }}>
                      <RotateCcw className="h-4 w-4 ml-2" />
                      العب مجدداً
                    </Button>
                  </motion.div>
                  <Button variant="outline" onClick={onClose} className="py-5 rounded-2xl px-6 font-bold">
                    خروج
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

export default PriceGuessGame;
