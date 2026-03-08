import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Timer, RotateCcw, Trophy, X, Smartphone, ArrowRight, Star, Zap } from "lucide-react";
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
}

const DIFFICULTIES: Record<Difficulty, DifficultyConfig> = {
  easy: { label: "سهل", pairs: 4, time: 60, emoji: "😊", cols: 4 },
  medium: { label: "متوسط", pairs: 6, time: 45, emoji: "🤔", cols: 4 },
  hard: { label: "صعب", pairs: 8, time: 30, emoji: "🔥", cols: 4 },
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
  isOpen,
  onClose,
  products,
  colorTheme,
  storeOwnerId,
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
  const { scores: lbScores, loading: lbLoading, saveScore } = useGameLeaderboard(storeOwnerId, "memory");

  const themeColor = useMemo(() => {
    if (colorTheme?.startsWith("#")) return colorTheme;
    const colors: Record<string, string> = {
      coral: "#fb923c", purple: "#a855f7", blue: "#3b82f6",
      green: "#22c55e", red: "#ef4444",
    };
    return colors[colorTheme || ""] || "#3b82f6";
  }, [colorTheme]);

  // بناء أزواج البطاقات من صور المنتجات الحقيقية
  const buildCardPairs = useCallback((diff: Difficulty) => {
    const config = DIFFICULTIES[diff];
    const productsWithImages = products.filter(p => p.image_url && p.image_url.trim() !== "");
    const pairs: { imageUrl: string; name: string }[] = [];

    for (let i = 0; i < config.pairs; i++) {
      if (i < productsWithImages.length) {
        pairs.push({
          imageUrl: productsWithImages[i].image_url!,
          name: productsWithImages[i].name,
        });
      } else {
        // fallback to emoji
        pairs.push({
          imageUrl: "",
          name: PLACEHOLDER_EMOJIS[i % PLACEHOLDER_EMOJIS.length],
        });
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

    // Fisher-Yates shuffle
    for (let i = allCards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allCards[i], allCards[j]] = [allCards[j], allCards[i]];
    }

    setCards(allCards);
    setFlippedCards([]);
    setMoves(0);
    setTimeLeft(config.time);
    setMatchedPairs(0);
    setShakeCards([]);
    setComboCount(0);
    setShowCombo(false);
    setGameState("playing");
    setDifficulty(diff);
  }, [buildCardPairs]);

  // Timer
  useEffect(() => {
    if (gameState !== "playing") return;
    if (timeLeft <= 0) { setGameState("lost"); return; }
    const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
    return () => clearInterval(timer);
  }, [gameState, timeLeft]);

  // Check win
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

    const newCards = cards.map(c =>
      c.id === cardId ? { ...c, isFlipped: true } : c
    );
    setCards(newCards);
    const newFlipped = [...flippedCards, cardId];
    setFlippedCards(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(m => m + 1);
      const [first, second] = newFlipped.map(id => newCards.find(c => c.id === id)!);

      if (first.pairId === second.pairId) {
        const now = Date.now();
        const isCombo = now - lastMatchTime < 3000 && lastMatchTime > 0;
        if (isCombo) {
          setComboCount(c => c + 1);
          setShowCombo(true);
          setTimeout(() => setShowCombo(false), 1000);
        } else {
          setComboCount(0);
        }
        setLastMatchTime(now);

        setTimeout(() => {
          setCards(prev => prev.map(c =>
            c.pairId === first.pairId ? { ...c, isMatched: true } : c
          ));
          setMatchedPairs(p => p + 1);
          setFlippedCards([]);
        }, 400);
      } else {
        setShakeCards([first.id, second.id]);
        setTimeout(() => {
          setCards(prev => prev.map(c =>
            newFlipped.includes(c.id) ? { ...c, isFlipped: false } : c
          ));
          setFlippedCards([]);
          setShakeCards([]);
          setComboCount(0);
        }, 700);
      }
    }
  }, [cards, flippedCards, lastMatchTime]);

  const saveProgress = () => {
    if (phoneNumber.length >= 10) {
      localStorage.setItem(`memory_${phoneNumber}`, JSON.stringify({ highScore, difficulty }));
    }
  };

  const loadProgress = () => {
    if (phoneNumber.length >= 10) {
      const saved = localStorage.getItem(`memory_${phoneNumber}`);
      if (saved) {
        const data = JSON.parse(saved);
        setHighScore(data.highScore);
      }
      setIsGuest(false);
      setGameState("menu");
    }
  };

  const score = useMemo(() => {
    return timeLeft * 10 + Math.max(0, 100 - moves * 5) + comboCount * 15;
  }, [timeLeft, moves, comboCount]);

  const getStars = (s: number) => {
    if (s >= 300) return 3;
    if (s >= 150) return 2;
    return 1;
  };

  if (!isOpen) return null;

  const totalPairs = DIFFICULTIES[difficulty].pairs;
  const progress = totalPairs > 0 ? (matchedPairs / totalPairs) * 100 : 0;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-3"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ scale: 0.85, y: 30 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.85, y: 30 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="w-full max-w-md max-h-[92vh] overflow-y-auto rounded-2xl bg-background shadow-2xl border border-border/50"
          style={{ direction: "rtl" }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between p-3.5 text-white"
            style={{ background: `linear-gradient(135deg, ${themeColor}, ${themeColor}bb)` }}
          >
            <div className="flex items-center gap-2">
              <span className="text-xl">🧠</span>
              <h2 className="text-base font-bold">طابق واربح</h2>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-full hover:bg-white/20 transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="p-3.5">
            {/* Login State */}
            {gameState === "login" && (
              <div className="space-y-4 text-center py-6">
                <Smartphone className="h-12 w-12 mx-auto text-muted-foreground" />
                <h3 className="text-lg font-bold">حفظ تقدمك</h3>
                <p className="text-sm text-muted-foreground">أدخل رقم هاتفك لحفظ نتائجك</p>
                <Input
                  type="tel"
                  placeholder="07xxxxxxxxx"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="text-center text-lg"
                  dir="ltr"
                />
                <div className="flex gap-2">
                  <Button onClick={loadProgress} className="flex-1 text-white" style={{ background: themeColor }}>
                    حفظ ومتابعة
                  </Button>
                  <Button variant="outline" onClick={() => { setIsGuest(true); setGameState("menu"); }} className="flex-1">
                    متابعة كضيف
                  </Button>
                </div>
              </div>
            )}

            {/* Menu State */}
            {gameState === "menu" && (
              <div className="space-y-3 py-2">
                <div className="text-center space-y-1.5">
                  <h3 className="text-lg font-bold">اختر مستوى الصعوبة</h3>
                  {highScore !== null && (
                    <p className="text-sm text-muted-foreground">
                      🏆 أعلى نتيجة: <span className="font-bold" style={{ color: themeColor }}>{highScore}</span>
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {products.filter(p => p.image_url).length > 0
                      ? `📸 ${Math.min(products.filter(p => p.image_url).length, 8)} صور منتجات متاحة`
                      : "سيتم استخدام رموز تعبيرية"}
                  </p>
                </div>
                <div className="grid gap-2.5">
                  {(Object.entries(DIFFICULTIES) as [Difficulty, DifficultyConfig][]).map(([key, config]) => (
                    <motion.button
                      key={key}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => initializeGame(key)}
                      className="flex items-center justify-between p-3.5 rounded-xl border-2 transition-all hover:shadow-md"
                      style={{ borderColor: `${themeColor}30`, background: `${themeColor}05` }}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{config.emoji}</span>
                        <div className="text-right">
                          <p className="font-bold text-sm">{config.label}</p>
                          <p className="text-xs text-muted-foreground">
                            {config.pairs} أزواج • {config.time} ثانية
                          </p>
                        </div>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </motion.button>
                  ))}
                </div>
                {isGuest && (
                  <Button variant="ghost" className="w-full text-xs" onClick={() => setGameState("login")}>
                    <Smartphone className="h-3.5 w-3.5 ml-1.5" />
                    حفظ تقدمي
                  </Button>
                )}
              </div>
            )}

            {/* Playing State */}
            {gameState === "playing" && (
              <div className="space-y-2.5">
                {/* Stats */}
                <div className="flex items-center justify-between text-xs font-medium">
                  <div className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg ${timeLeft <= 10 ? "bg-destructive/10 text-destructive" : "bg-muted"}`}>
                    <Timer className="h-3.5 w-3.5" />
                    <span className={timeLeft <= 10 ? "animate-pulse font-bold" : ""}>{timeLeft}s</span>
                  </div>
                  <div className="px-2.5 py-1.5 rounded-lg bg-muted flex items-center gap-1">
                    {DIFFICULTIES[difficulty].emoji}
                    <span>{matchedPairs}/{totalPairs}</span>
                  </div>
                  <div className="px-2.5 py-1.5 rounded-lg bg-muted">
                    المحاولات: {moves}
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: `linear-gradient(90deg, ${themeColor}, ${themeColor}cc)` }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>

                {/* Combo indicator */}
                <AnimatePresence>
                  {showCombo && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      className="text-center"
                    >
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold text-white" style={{ background: themeColor }}>
                        <Zap className="h-3 w-3" /> كومبو x{comboCount + 1}! 🔥
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Cards Grid */}
                <div className="grid grid-cols-4 gap-1.5">
                  {cards.map((card) => (
                    <motion.div
                      key={card.id}
                      animate={
                        shakeCards.includes(card.id)
                          ? { x: [0, -4, 4, -4, 4, 0], transition: { duration: 0.4 } }
                          : card.isMatched
                          ? { scale: [1, 1.08, 1], transition: { duration: 0.3 } }
                          : {}
                      }
                      onClick={() => handleCardClick(card.id)}
                      className="aspect-square cursor-pointer"
                    >
                      <div
                        className={`relative w-full h-full transition-transform duration-300 ${
                          card.isFlipped || card.isMatched ? "[transform:rotateY(180deg)]" : ""
                        }`}
                        style={{ transformStyle: "preserve-3d" }}
                      >
                        {/* Back */}
                        <div
                          className="absolute inset-0 rounded-lg flex items-center justify-center text-lg font-bold text-white shadow-sm"
                          style={{
                            background: `linear-gradient(145deg, ${themeColor}, ${themeColor}99)`,
                            backfaceVisibility: "hidden",
                          }}
                        >
                          ❓
                        </div>
                        {/* Front */}
                        <div
                          className={`absolute inset-0 rounded-lg flex items-center justify-center overflow-hidden shadow-sm ${
                            card.isMatched ? "ring-2 ring-green-500 shadow-green-500/20" : ""
                          }`}
                          style={{
                            transform: "rotateY(180deg)",
                            backfaceVisibility: "hidden",
                            background: card.isMatched ? "#ecfdf5" : "#f8fafc",
                          }}
                        >
                          {card.imageUrl ? (
                            <img
                              src={card.imageUrl}
                              alt={card.name}
                              className="w-full h-full object-cover"
                              loading="eager"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                                (e.target as HTMLImageElement).parentElement!.innerHTML = `<span class="text-2xl">🖼️</span>`;
                              }}
                            />
                          ) : (
                            <span className="text-2xl">{card.name}</span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Reset */}
                <Button variant="outline" size="sm" className="w-full text-xs" onClick={() => initializeGame(difficulty)}>
                  <RotateCcw className="h-3.5 w-3.5 ml-1.5" />
                  إعادة البدء
                </Button>
              </div>
            )}

            {/* Won State */}
            {gameState === "won" && (
              <div className="text-center py-5 space-y-3">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200 }}>
                  <Trophy className="h-14 w-14 mx-auto" style={{ color: themeColor }} />
                </motion.div>
                <h3 className="text-xl font-bold">🎉 أحسنت!</h3>
                <div className="flex justify-center gap-1">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ scale: 0, rotate: -30 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: 0.2 + i * 0.15, type: "spring" }}
                    >
                      <Star
                        className="h-7 w-7"
                        fill={i < getStars(score) ? themeColor : "transparent"}
                        stroke={themeColor}
                      />
                    </motion.div>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">
                  {moves} محاولة • {timeLeft} ثانية متبقية
                </p>
                <div className="text-2xl font-bold" style={{ color: themeColor }}>
                  {score} نقطة
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => initializeGame(difficulty)} className="flex-1 text-white" style={{ background: themeColor }}>
                    العب مرة أخرى
                  </Button>
                  <Button variant="outline" onClick={() => setGameState("menu")} className="flex-1">
                    القائمة
                  </Button>
                </div>
                {isGuest && (
                  <Button variant="ghost" size="sm" className="text-xs" onClick={() => { saveProgress(); setGameState("login"); }}>
                    💾 حفظ النتيجة
                  </Button>
                )}
              </div>
            )}

            {/* Lost State */}
            {gameState === "lost" && (
              <div className="text-center py-5 space-y-3">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }} className="text-5xl">
                  ⏰
                </motion.div>
                <h3 className="text-xl font-bold">انتهى الوقت!</h3>
                <p className="text-sm text-muted-foreground">
                  وجدت {matchedPairs} من {totalPairs} أزواج
                </p>
                <div className="flex gap-2">
                  <Button onClick={() => initializeGame(difficulty)} className="flex-1 text-white" style={{ background: themeColor }}>
                    حاول ثانية
                  </Button>
                  <Button variant="outline" onClick={() => setGameState("menu")} className="flex-1">
                    تغيير المستوى
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

export default MemoryMatchGame;
