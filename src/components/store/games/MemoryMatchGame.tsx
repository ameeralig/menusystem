import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Timer, RotateCcw, Trophy, X, Smartphone, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Product } from "@/types/product";

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
}

const DIFFICULTIES: Record<Difficulty, DifficultyConfig> = {
  easy: { label: "سهل", pairs: 4, time: 60, emoji: "😊" },
  medium: { label: "متوسط", pairs: 6, time: 45, emoji: "🤔" },
  hard: { label: "صعب", pairs: 8, time: 30, emoji: "🔥" },
};

interface MemoryMatchGameProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  colorTheme?: string;
}

const MemoryMatchGame: React.FC<MemoryMatchGameProps> = ({
  isOpen,
  onClose,
  products,
  colorTheme,
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

  const getThemeColor = useCallback(() => {
    if (colorTheme?.startsWith("#")) return colorTheme;
    const colors: Record<string, string> = {
      coral: "#fb923c", purple: "#a855f7", blue: "#3b82f6",
      green: "#22c55e", red: "#ef4444",
    };
    return colors[colorTheme || ""] || "#3b82f6";
  }, [colorTheme]);

  const themeColor = getThemeColor();

  // Placeholder images if not enough products
  const placeholderImages = useMemo(() => [
    "🍕", "🍔", "🌮", "🍣", "🎂", "🍩", "☕", "🥤",
    "🍗", "🥗", "🍜", "🧁", "🍦", "🥐", "🫐", "🍇"
  ], []);

  const initializeGame = useCallback((diff: Difficulty) => {
    const config = DIFFICULTIES[diff];
    const availableProducts = products.filter(p => p.image_url);
    
    const cardPairs: { imageUrl: string; name: string }[] = [];
    
    for (let i = 0; i < config.pairs; i++) {
      if (i < availableProducts.length) {
        cardPairs.push({
          imageUrl: availableProducts[i].image_url!,
          name: availableProducts[i].name,
        });
      } else {
        cardPairs.push({
          imageUrl: "",
          name: placeholderImages[i % placeholderImages.length],
        });
      }
    }

    const allCards: MemoryCard[] = [];
    cardPairs.forEach((pair, index) => {
      allCards.push(
        { id: index * 2, ...pair, pairId: index, isFlipped: false, isMatched: false },
        { id: index * 2 + 1, ...pair, pairId: index, isFlipped: false, isMatched: false }
      );
    });

    // Shuffle
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
    setGameState("playing");
    setDifficulty(diff);
  }, [products, placeholderImages]);

  // Timer
  useEffect(() => {
    if (gameState !== "playing") return;
    if (timeLeft <= 0) {
      setGameState("lost");
      return;
    }
    const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
    return () => clearInterval(timer);
  }, [gameState, timeLeft]);

  // Check win
  useEffect(() => {
    if (gameState === "playing" && matchedPairs === DIFFICULTIES[difficulty].pairs) {
      setGameState("won");
      const score = timeLeft * 10 + Math.max(0, 100 - moves * 5);
      if (!highScore || score > highScore) setHighScore(score);
    }
  }, [matchedPairs, difficulty, gameState, timeLeft, moves, highScore]);

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
        // Match!
        setTimeout(() => {
          setCards(prev => prev.map(c =>
            c.pairId === first.pairId ? { ...c, isMatched: true } : c
          ));
          setMatchedPairs(p => p + 1);
          setFlippedCards([]);
        }, 500);
      } else {
        // No match
        setShakeCards([first.id, second.id]);
        setTimeout(() => {
          setCards(prev => prev.map(c =>
            newFlipped.includes(c.id) ? { ...c, isFlipped: false } : c
          ));
          setFlippedCards([]);
          setShakeCards([]);
        }, 800);
      }
    }
  }, [cards, flippedCards]);

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

  const getGridCols = () => {
    const total = cards.length;
    if (total <= 8) return "grid-cols-4";
    if (total <= 12) return "grid-cols-4";
    return "grid-cols-4";
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl bg-background shadow-2xl"
          style={{ direction: "rtl" }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between p-4 rounded-t-2xl text-white"
            style={{ background: `linear-gradient(135deg, ${themeColor}, ${themeColor}cc)` }}
          >
            <h2 className="text-lg font-bold">🧠 طابق واربح</h2>
            <button onClick={onClose} className="p-1 rounded-full hover:bg-white/20">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="p-4">
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
                  <Button onClick={loadProgress} className="flex-1" style={{ background: themeColor }}>
                    حفظ ومتابعة
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => { setIsGuest(true); setGameState("menu"); }}
                    className="flex-1"
                  >
                    متابعة كضيف
                  </Button>
                </div>
              </div>
            )}

            {/* Menu State */}
            {gameState === "menu" && (
              <div className="space-y-4 py-4">
                <div className="text-center space-y-2">
                  <h3 className="text-xl font-bold">اختر مستوى الصعوبة</h3>
                  {highScore !== null && (
                    <p className="text-sm text-muted-foreground">
                      🏆 أعلى نتيجة: <span className="font-bold" style={{ color: themeColor }}>{highScore}</span>
                    </p>
                  )}
                </div>
                <div className="grid gap-3">
                  {(Object.entries(DIFFICULTIES) as [Difficulty, DifficultyConfig][]).map(([key, config]) => (
                    <motion.button
                      key={key}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => initializeGame(key)}
                      className="flex items-center justify-between p-4 rounded-xl border-2 transition-colors hover:border-primary"
                      style={{ borderColor: `${themeColor}30` }}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{config.emoji}</span>
                        <div className="text-right">
                          <p className="font-bold">{config.label}</p>
                          <p className="text-xs text-muted-foreground">
                            {config.pairs} أزواج • {config.time} ثانية
                          </p>
                        </div>
                      </div>
                      <ArrowRight className="h-5 w-5 text-muted-foreground" />
                    </motion.button>
                  ))}
                </div>
                {isGuest && (
                  <Button
                    variant="ghost"
                    className="w-full text-sm"
                    onClick={() => setGameState("login")}
                  >
                    <Smartphone className="h-4 w-4 ml-2" />
                    حفظ تقدمي
                  </Button>
                )}
              </div>
            )}

            {/* Playing State */}
            {gameState === "playing" && (
              <div className="space-y-3">
                {/* Stats Bar */}
                <div className="flex items-center justify-between text-sm font-medium">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted">
                    <Timer className="h-4 w-4" />
                    <span className={timeLeft <= 10 ? "text-destructive animate-pulse" : ""}>
                      {timeLeft}s
                    </span>
                  </div>
                  <div className="px-3 py-1.5 rounded-lg bg-muted">
                    {DIFFICULTIES[difficulty].emoji} {DIFFICULTIES[difficulty].label}
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted">
                    <span>المحاولات: {moves}</span>
                  </div>
                </div>

                {/* Progress */}
                <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: themeColor }}
                    animate={{ width: `${(matchedPairs / DIFFICULTIES[difficulty].pairs) * 100}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>

                {/* Cards Grid */}
                <div className={`grid ${getGridCols()} gap-2`}>
                  {cards.map((card) => (
                    <motion.div
                      key={card.id}
                      animate={
                        shakeCards.includes(card.id)
                          ? { x: [0, -5, 5, -5, 5, 0] }
                          : card.isMatched
                          ? { scale: [1, 1.1, 1] }
                          : {}
                      }
                      transition={{ duration: 0.4 }}
                      onClick={() => handleCardClick(card.id)}
                      className="aspect-square cursor-pointer perspective-500"
                    >
                      <div
                        className={`relative w-full h-full transition-transform duration-300 preserve-3d ${
                          card.isFlipped || card.isMatched ? "rotate-y-180" : ""
                        }`}
                        style={{ transformStyle: "preserve-3d" }}
                      >
                        {/* Card Back */}
                        <div
                          className="absolute inset-0 rounded-xl flex items-center justify-center text-2xl font-bold text-white backface-hidden"
                          style={{
                            background: `linear-gradient(135deg, ${themeColor}, ${themeColor}aa)`,
                            backfaceVisibility: "hidden",
                          }}
                        >
                          ❓
                        </div>
                        {/* Card Front */}
                        <div
                          className={`absolute inset-0 rounded-xl flex items-center justify-center overflow-hidden backface-hidden ${
                            card.isMatched ? "ring-2 ring-green-500 shadow-lg shadow-green-500/30" : ""
                          }`}
                          style={{
                            transform: "rotateY(180deg)",
                            backfaceVisibility: "hidden",
                            background: card.isMatched ? "#f0fdf4" : "#f8fafc",
                          }}
                        >
                          {card.imageUrl ? (
                            <img
                              src={card.imageUrl}
                              alt={card.name}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          ) : (
                            <span className="text-3xl">{card.name}</span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Reset Button */}
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => initializeGame(difficulty)}
                >
                  <RotateCcw className="h-4 w-4 ml-2" />
                  إعادة البدء
                </Button>
              </div>
            )}

            {/* Won State */}
            {gameState === "won" && (
              <div className="text-center py-6 space-y-4">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200 }}
                >
                  <Trophy className="h-16 w-16 mx-auto" style={{ color: themeColor }} />
                </motion.div>
                <h3 className="text-2xl font-bold">🎉 أحسنت!</h3>
                <p className="text-muted-foreground">
                  أكملت اللعبة بـ {moves} محاولة وتبقى {timeLeft} ثانية
                </p>
                <div
                  className="text-3xl font-bold py-2"
                  style={{ color: themeColor }}
                >
                  {timeLeft * 10 + Math.max(0, 100 - moves * 5)} نقطة
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => initializeGame(difficulty)} className="flex-1" style={{ background: themeColor }}>
                    العب مرة أخرى
                  </Button>
                  <Button variant="outline" onClick={() => setGameState("menu")} className="flex-1">
                    القائمة الرئيسية
                  </Button>
                </div>
                {isGuest && (
                  <Button variant="ghost" size="sm" onClick={() => setGameState("login")}>
                    💾 حفظ النتيجة
                  </Button>
                )}
              </div>
            )}

            {/* Lost State */}
            {gameState === "lost" && (
              <div className="text-center py-6 space-y-4">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring" }}
                  className="text-6xl"
                >
                  ⏰
                </motion.div>
                <h3 className="text-2xl font-bold">انتهى الوقت!</h3>
                <p className="text-muted-foreground">
                  وجدت {matchedPairs} من {DIFFICULTIES[difficulty].pairs} أزواج
                </p>
                <div className="flex gap-2">
                  <Button onClick={() => initializeGame(difficulty)} className="flex-1" style={{ background: themeColor }}>
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
