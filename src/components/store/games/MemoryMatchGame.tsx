import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Timer, RotateCcw, Trophy, X, Smartphone, ArrowRight, Star, Zap, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Product } from "@/types/product";
import { useGameLeaderboard } from "@/hooks/store/useGameLeaderboard";
import GameLeaderboard from "./GameLeaderboard";

interface MemoryCard {
  id: number;
  imageUrl: string;
  name: string;
  pairId: number;
  isFlipped: boolean;
  isMatched: boolean;
}

type Difficulty = "easy" | "medium" | "hard";

interface DifficultyConfig {
  label: string;
  pairs: number;
  time: number;
  emoji: string;
  cols: number;
  color: string;
}

const DIFFICULTIES: Record<Difficulty, DifficultyConfig> = {
  easy: { label: "سهل", pairs: 4, time: 60, emoji: "😊", cols: 4, color: "#22c55e" },
  medium: { label: "متوسط", pairs: 6, time: 45, emoji: "🤔", cols: 4, color: "#f59e0b" },
  hard: { label: "صعب", pairs: 8, time: 30, emoji: "🔥", cols: 4, color: "#ef4444" },
};

const PLACEHOLDER_EMOJIS = ["🍕", "🍔", "🌮", "🍣", "🎂", "🍩", "☕", "🥤", "🍗", "🥗", "🍜", "🧁", "🍦", "🥐", "🫐", "🍇"];

interface MemoryMatchGameProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  colorTheme?: string;
  storeOwnerId?: string;
}

const MemoryMatchGame: React.FC<MemoryMatchGameProps> = ({
  isOpen, onClose, products, colorTheme, storeOwnerId,
}) => {
  const [gameState, setGameState] = useState<"menu" | "playing" | "won" | "lost" | "login">("menu");
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [cards, setCards] = useState<MemoryCard[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [matchedPairs, setMatchedPairs] = useState(0);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isGuest, setIsGuest] = useState(true);
  const [highScore, setHighScore] = useState<number | null>(null);
  const [shakeCards, setShakeCards] = useState<number[]>([]);
  const [comboCount, setComboCount] = useState(0);
  const [showCombo, setShowCombo] = useState(false);
  const [lastMatchTime, setLastMatchTime] = useState(0);
  const [recentMatch, setRecentMatch] = useState<number | null>(null);
  const { scores: lbScores, loading: lbLoading, saveScore } = useGameLeaderboard(storeOwnerId, "memory");

  const themeColor = useMemo(() => {
    if (colorTheme?.startsWith("#")) return colorTheme;
    const colors: Record<string, string> = { coral: "#fb923c", purple: "#a855f7", blue: "#3b82f6", green: "#22c55e", red: "#ef4444" };
    return colors[colorTheme || ""] || "#3b82f6";
  }, [colorTheme]);

  const buildCardPairs = useCallback((diff: Difficulty) => {
    const config = DIFFICULTIES[diff];
    const productsWithImages = products.filter(p => p.image_url && p.image_url.trim() !== "");
    const pairs: { imageUrl: string; name: string }[] = [];
    for (let i = 0; i < config.pairs; i++) {
      if (i < productsWithImages.length) {
        pairs.push({ imageUrl: productsWithImages[i].image_url!, name: productsWithImages[i].name });
      } else {
        pairs.push({ imageUrl: "", name: PLACEHOLDER_EMOJIS[i % PLACEHOLDER_EMOJIS.length] });
      }
    }
    return pairs;
  }, [products]);

  const initializeGame = useCallback((diff: Difficulty) => {
    const config = DIFFICULTIES[diff];
    const cardPairs = buildCardPairs(diff);
    const allCards: MemoryCard[] = [];
    cardPairs.forEach((pair, index) => {
      allCards.push(
        { id: index * 2, ...pair, pairId: index, isFlipped: false, isMatched: false },
        { id: index * 2 + 1, ...pair, pairId: index, isFlipped: false, isMatched: false }
      );
    });
    for (let i = allCards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allCards[i], allCards[j]] = [allCards[j], allCards[i]];
    }
    setCards(allCards); setFlippedCards([]); setMoves(0); setTimeLeft(config.time);
    setMatchedPairs(0); setShakeCards([]); setComboCount(0); setShowCombo(false);
    setGameState("playing"); setDifficulty(diff); setRecentMatch(null);
  }, [buildCardPairs]);

  useEffect(() => {
    if (gameState !== "playing") return;
    if (timeLeft <= 0) { setGameState("lost"); return; }
    const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
    return () => clearInterval(timer);
  }, [gameState, timeLeft]);

  useEffect(() => {
    if (gameState === "playing" && matchedPairs === DIFFICULTIES[difficulty].pairs) {
      setGameState("won");
      const score = timeLeft * 10 + Math.max(0, 100 - moves * 5) + comboCount * 15;
      if (!highScore || score > highScore) setHighScore(score);
    }
  }, [matchedPairs, difficulty, gameState, timeLeft, moves, highScore, comboCount]);

  const handleCardClick = useCallback((cardId: number) => {
    if (flippedCards.length >= 2) return;
    const card = cards.find(c => c.id === cardId);
    if (!card || card.isFlipped || card.isMatched) return;
    const newCards = cards.map(c => c.id === cardId ? { ...c, isFlipped: true } : c);
    setCards(newCards);
    const newFlipped = [...flippedCards, cardId];
    setFlippedCards(newFlipped);
    if (newFlipped.length === 2) {
      setMoves(m => m + 1);
      const [first, second] = newFlipped.map(id => newCards.find(c => c.id === id)!);
      if (first.pairId === second.pairId) {
        const now = Date.now();
        const isCombo = now - lastMatchTime < 3000 && lastMatchTime > 0;
        if (isCombo) { setComboCount(c => c + 1); setShowCombo(true); setTimeout(() => setShowCombo(false), 1000); }
        else setComboCount(0);
        setLastMatchTime(now);
        setRecentMatch(first.pairId);
        setTimeout(() => {
          setCards(prev => prev.map(c => c.pairId === first.pairId ? { ...c, isMatched: true } : c));
          setMatchedPairs(p => p + 1); setFlippedCards([]); setRecentMatch(null);
        }, 500);
      } else {
        setShakeCards([first.id, second.id]);
        setTimeout(() => {
          setCards(prev => prev.map(c => newFlipped.includes(c.id) ? { ...c, isFlipped: false } : c));
          setFlippedCards([]); setShakeCards([]); setComboCount(0);
        }, 700);
      }
    }
  }, [cards, flippedCards, lastMatchTime]);

  const loadProgress = () => {
    if (phoneNumber.length >= 10) {
      const saved = localStorage.getItem(`memory_${phoneNumber}`);
      if (saved) { const data = JSON.parse(saved); setHighScore(data.highScore); }
      setIsGuest(false); setGameState("menu");
    }
  };

  const score = useMemo(() => timeLeft * 10 + Math.max(0, 100 - moves * 5) + comboCount * 15, [timeLeft, moves, comboCount]);
  const getStars = (s: number) => { if (s >= 300) return 3; if (s >= 150) return 2; return 1; };

  if (!isOpen) return null;
  const totalPairs = DIFFICULTIES[difficulty].pairs;
  const progress = totalPairs > 0 ? (matchedPairs / totalPairs) * 100 : 0;
  const timePercent = (timeLeft / DIFFICULTIES[difficulty].time) * 100;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div className="absolute inset-0 bg-black/70 backdrop-blur-md" />
        <motion.div
          initial={{ scale: 0.85, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.85, y: 30 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="relative w-full max-w-md max-h-[92vh] overflow-y-auto rounded-3xl bg-background shadow-2xl border border-border/30"
          style={{ direction: "rtl" }}
        >
          {/* Header */}
          <div className="relative flex items-center justify-between p-4 text-white overflow-hidden"
            style={{ background: `linear-gradient(135deg, ${themeColor}, ${themeColor}bb)` }}>
            <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-white/10 blur-xl" />
            <div className="relative flex items-center gap-3">
              <motion.div animate={{ rotate: [0, -5, 5, 0] }} transition={{ repeat: Infinity, duration: 3 }}
                className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm text-xl">
                🧠
              </motion.div>
              <div>
                <h2 className="text-base font-black">طابق واربح</h2>
                <p className="text-[10px] text-white/60">اعثر على الأزواج!</p>
              </div>
            </div>
            <button onClick={onClose} className="relative p-2 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-all">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="p-4">
            {/* Login State */}
            {gameState === "login" && (
              <div className="space-y-4 text-center py-8">
                <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
                  <Smartphone className="h-14 w-14 mx-auto text-muted-foreground/50" />
                </motion.div>
                <h3 className="text-lg font-black text-foreground">حفظ تقدمك</h3>
                <p className="text-sm text-muted-foreground">أدخل رقم هاتفك لحفظ نتائجك</p>
                <Input type="tel" placeholder="07xxxxxxxxx" value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)} className="text-center text-lg h-12 rounded-xl" dir="ltr" />
                <div className="flex gap-2">
                  <Button onClick={loadProgress} className="flex-1 text-white h-11 rounded-xl font-bold"
                    style={{ background: `linear-gradient(135deg, ${themeColor}, ${themeColor}cc)` }}>
                    حفظ ومتابعة
                  </Button>
                  <Button variant="outline" onClick={() => { setIsGuest(true); setGameState("menu"); }} className="flex-1 h-11 rounded-xl">
                    كضيف
                  </Button>
                </div>
              </div>
            )}

            {/* Menu State */}
            {gameState === "menu" && (
              <div className="space-y-4 py-3">
                <div className="text-center space-y-2">
                  <motion.span animate={{ y: [0, -8, 0], rotate: [0, 5, -5, 0] }}
                    transition={{ repeat: Infinity, duration: 3 }} className="text-6xl block">🧠</motion.span>
                  <h3 className="text-xl font-black text-foreground">اختر مستوى الصعوبة</h3>
                  {highScore !== null && (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted text-sm">
                      <Trophy className="h-3.5 w-3.5" style={{ color: themeColor }} />
                      <span className="text-muted-foreground">أعلى نتيجة:</span>
                      <span className="font-black" style={{ color: themeColor }}>{highScore}</span>
                    </div>
                  )}
                </div>
                <div className="grid gap-3">
                  {(Object.entries(DIFFICULTIES) as [Difficulty, DifficultyConfig][]).map(([key, config]) => (
                    <motion.button key={key} whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.97 }}
                      onClick={() => initializeGame(key)}
                      className="flex items-center justify-between p-4 rounded-2xl border-2 transition-all hover:shadow-lg group overflow-hidden relative"
                      style={{ borderColor: `${config.color}30`, background: `${config.color}05` }}>
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        style={{ background: `linear-gradient(135deg, ${config.color}10, transparent)` }} />
                      <div className="relative flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl text-white shadow-md"
                          style={{ background: `linear-gradient(135deg, ${config.color}, ${config.color}cc)` }}>
                          {config.emoji}
                        </div>
                        <div className="text-right">
                          <p className="font-black text-sm text-foreground">{config.label}</p>
                          <p className="text-[11px] text-muted-foreground">{config.pairs} أزواج • {config.time} ثانية</p>
                        </div>
                      </div>
                      <div className="relative w-8 h-8 rounded-full flex items-center justify-center"
                        style={{ background: `${config.color}15` }}>
                        <ArrowRight className="h-4 w-4" style={{ color: config.color }} />
                      </div>
                    </motion.button>
                  ))}
                </div>
                {isGuest && (
                  <Button variant="ghost" className="w-full text-xs" onClick={() => setGameState("login")}>
                    <Smartphone className="h-3.5 w-3.5 ml-1.5" /> حفظ تقدمي
                  </Button>
                )}
              </div>
            )}

            {/* Playing State */}
            {gameState === "playing" && (
              <div className="space-y-3">
                {/* Stats */}
                <div className="flex items-center justify-between gap-2">
                  {/* Timer */}
                  <div className={`relative flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold ${
                    timeLeft <= 10 ? "text-red-500" : "text-foreground"}`}
                    style={{ background: timeLeft <= 10 ? "rgba(239,68,68,0.1)" : "hsl(var(--muted))" }}>
                    <Timer className="h-3.5 w-3.5" />
                    <span className={timeLeft <= 10 ? "animate-pulse" : ""}>{timeLeft}s</span>
                    {/* Timer ring */}
                    <svg className="absolute -top-0.5 -right-0.5 w-3 h-3" viewBox="0 0 20 20">
                      <circle cx="10" cy="10" r="8" fill="none" stroke={timeLeft <= 10 ? "#ef4444" : themeColor}
                        strokeWidth="3" strokeDasharray={`${timePercent * 0.5} 100`} strokeLinecap="round"
                        transform="rotate(-90 10 10)" opacity="0.5" />
                    </svg>
                  </div>

                  <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-muted text-xs font-bold text-foreground">
                    {DIFFICULTIES[difficulty].emoji} {matchedPairs}/{totalPairs}
                  </div>

                  <div className="px-3 py-2 rounded-xl bg-muted text-xs font-bold text-foreground">
                    {moves} محاولة
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                  <motion.div className="h-full rounded-full relative"
                    style={{ background: `linear-gradient(90deg, ${themeColor}, ${themeColor}cc)` }}
                    animate={{ width: `${progress}%` }} transition={{ duration: 0.4, ease: "easeOut" }}>
                    {progress > 20 && (
                      <motion.div className="absolute inset-0 bg-white/30" animate={{ x: ["-100%", "200%"] }}
                        transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                        style={{ width: "30%" }} />
                    )}
                  </motion.div>
                </div>

                {/* Combo indicator */}
                <AnimatePresence>
                  {showCombo && (
                    <motion.div initial={{ scale: 0, opacity: 0, y: 10 }} animate={{ scale: 1, opacity: 1, y: 0 }}
                      exit={{ scale: 0, opacity: 0, y: -10 }} className="text-center">
                      <motion.span animate={{ scale: [1, 1.15, 1] }} transition={{ repeat: 3, duration: 0.3 }}
                        className="inline-flex items-center gap-1 px-4 py-1.5 rounded-full text-xs font-black text-white shadow-lg"
                        style={{ background: `linear-gradient(135deg, ${themeColor}, ${themeColor}cc)`, boxShadow: `0 4px 20px ${themeColor}50` }}>
                        <Zap className="h-3.5 w-3.5" /> كومبو x{comboCount + 1}! 🔥
                      </motion.span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Cards Grid */}
                <div className="grid grid-cols-4 gap-2">
                  {cards.map((card) => {
                    const isActive = card.isFlipped || card.isMatched;
                    const isNewlyMatched = recentMatch === card.pairId;
                    return (
                      <motion.div key={card.id}
                        animate={
                          shakeCards.includes(card.id) ? { x: [0, -5, 5, -5, 5, 0], transition: { duration: 0.4 } }
                          : isNewlyMatched ? { scale: [1, 1.1, 1], transition: { duration: 0.4 } }
                          : {}
                        }
                        onClick={() => handleCardClick(card.id)} className="aspect-square cursor-pointer perspective-500">
                        <motion.div
                          animate={{ rotateY: isActive ? 180 : 0 }}
                          transition={{ duration: 0.4, type: "spring", stiffness: 300 }}
                          className="relative w-full h-full" style={{ transformStyle: "preserve-3d" }}>
                          {/* Back */}
                          <div className="absolute inset-0 rounded-xl flex items-center justify-center text-lg text-white shadow-md"
                            style={{
                              background: `linear-gradient(145deg, ${themeColor}, ${themeColor}88)`,
                              backfaceVisibility: "hidden",
                              boxShadow: `0 4px 12px ${themeColor}30`,
                            }}>
                            <motion.span animate={{ rotate: [0, 5, -5, 0] }} transition={{ repeat: Infinity, duration: 4, delay: card.id * 0.1 }}>
                              ❓
                            </motion.span>
                          </div>
                          {/* Front */}
                          <div className={`absolute inset-0 rounded-xl flex items-center justify-center overflow-hidden shadow-md ${
                            card.isMatched ? "ring-2 ring-green-400" : ""}`}
                            style={{
                              transform: "rotateY(180deg)", backfaceVisibility: "hidden",
                              background: card.isMatched ? "hsl(var(--muted))" : "hsl(var(--card))",
                              boxShadow: card.isMatched ? `0 0 15px rgba(34,197,94,0.3)` : `0 2px 8px rgba(0,0,0,0.08)`,
                            }}>
                            {card.imageUrl ? (
                              <img src={card.imageUrl} alt={card.name} className="w-full h-full object-cover" loading="eager"
                                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; (e.target as HTMLImageElement).parentElement!.innerHTML = `<span class="text-2xl">🖼️</span>`; }} />
                            ) : (
                              <span className="text-2xl">{card.name}</span>
                            )}
                            {card.isMatched && (
                              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                                className="absolute inset-0 bg-green-500/10 flex items-center justify-center">
                                <motion.span initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }}
                                  transition={{ type: "spring" }} className="text-xl">✅</motion.span>
                              </motion.div>
                            )}
                          </div>
                        </motion.div>
                      </motion.div>
                    );
                  })}
                </div>

                <Button variant="outline" size="sm" className="w-full text-xs rounded-xl h-9" onClick={() => initializeGame(difficulty)}>
                  <RotateCcw className="h-3.5 w-3.5 ml-1.5" /> إعادة البدء
                </Button>
              </div>
            )}

            {/* Won State */}
            {gameState === "won" && (
              <div className="text-center py-5 space-y-4 relative">
                {/* Victory particles */}
                {Array.from({ length: 12 }).map((_, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 0 }}
                    animate={{ opacity: [0, 1, 0], y: -80 - Math.random() * 60, x: (Math.random() - 0.5) * 200, rotate: Math.random() * 360 }}
                    transition={{ duration: 1.5, delay: i * 0.08, repeat: 1 }}
                    className="absolute top-1/4 left-1/2 text-lg pointer-events-none">
                    {["🎉", "✨", "⭐", "💎", "🏆", "🔥"][i % 6]}
                  </motion.div>
                ))}

                <motion.div initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 200 }}>
                  <div className="relative inline-block">
                    <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
                      <Trophy className="h-16 w-16 mx-auto drop-shadow-lg" style={{ color: themeColor }} />
                    </motion.div>
                    <motion.div animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                      className="absolute inset-0 rounded-full"
                      style={{ background: `radial-gradient(circle, ${themeColor}30, transparent)` }} />
                  </div>
                </motion.div>

                <h3 className="text-2xl font-black text-foreground">🎉 أحسنت!</h3>

                <div className="flex justify-center gap-1">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <motion.div key={i} initial={{ scale: 0, rotate: -30, y: 20 }}
                      animate={{ scale: 1, rotate: 0, y: 0 }}
                      transition={{ delay: 0.3 + i * 0.15, type: "spring" }}>
                      <Star className="h-8 w-8 drop-shadow-md"
                        fill={i < getStars(score) ? "#fbbf24" : "transparent"}
                        stroke={i < getStars(score) ? "#f59e0b" : "hsl(var(--muted-foreground))"} />
                    </motion.div>
                  ))}
                </div>

                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-muted text-sm text-muted-foreground">
                  <span>{moves} محاولة</span>
                  <span>•</span>
                  <span>{timeLeft}s متبقية</span>
                </div>

                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.5 }}
                  className="text-3xl font-black" style={{ color: themeColor }}>{score} نقطة</motion.div>

                <GameLeaderboard scores={lbScores} loading={lbLoading} currentScore={score}
                  onSaveScore={(name) => saveScore(name, score, { difficulty, moves, timeLeft })}
                  themeColor={themeColor} gameTitle="طابق واربح" showSaveForm={score > 0} />

                <div className="flex gap-2 pt-2">
                  <Button onClick={() => initializeGame(difficulty)} className="flex-1 text-white font-bold rounded-xl h-11 shadow-lg"
                    style={{ background: `linear-gradient(135deg, ${themeColor}, ${themeColor}cc)` }}>العب مرة أخرى</Button>
                  <Button variant="outline" onClick={() => setGameState("menu")} className="flex-1 rounded-xl h-11 font-bold">القائمة</Button>
                </div>
              </div>
            )}

            {/* Lost State */}
            {gameState === "lost" && (
              <div className="text-center py-6 space-y-4">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }}>
                  <motion.span animate={{ rotate: [0, 10, -10, 0] }} transition={{ repeat: Infinity, duration: 2 }} className="text-6xl block">⏰</motion.span>
                </motion.div>
                <h3 className="text-2xl font-black text-foreground">انتهى الوقت!</h3>
                <p className="text-sm text-muted-foreground">
                  وجدت <span className="font-bold text-foreground">{matchedPairs}</span> من <span className="font-bold text-foreground">{totalPairs}</span> أزواج
                </p>
                <div className="flex gap-2">
                  <Button onClick={() => initializeGame(difficulty)} className="flex-1 text-white font-bold rounded-xl h-11 shadow-lg"
                    style={{ background: `linear-gradient(135deg, ${themeColor}, ${themeColor}cc)` }}>حاول ثانية</Button>
                  <Button variant="outline" onClick={() => setGameState("menu")} className="flex-1 rounded-xl h-11 font-bold">تغيير المستوى</Button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default MemoryMatchGame;
