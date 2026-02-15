import React, { useState, useCallback, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowUp, ArrowDown, Check, Trophy, RotateCcw, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Product } from "@/types/product";

interface PriceGuessGameProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  colorTheme?: string;
}

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

  const themeColor = useMemo(() => {
    if (colorTheme?.startsWith("#")) return colorTheme;
    const colors: Record<string, string> = {
      coral: "#fb923c", purple: "#a855f7", blue: "#3b82f6",
      green: "#22c55e", red: "#ef4444",
    };
    return colors[colorTheme || ""] || "#3b82f6";
  }, [colorTheme]);

  // منتجات لديها صور وأسعار
  const validProducts = useMemo(() => {
    return products.filter(p => p.price > 0 && p.image_url && p.image_url.trim() !== "");
  }, [products]);

  const pickRandomProduct = useCallback(() => {
    const available = validProducts.filter(p => !usedProducts.includes(p.id));
    if (available.length === 0) return null;
    return available[Math.floor(Math.random() * available.length)];
  }, [validProducts, usedProducts]);

  const startGame = useCallback(() => {
    setScore(0);
    setRound(1);
    setUsedProducts([]);
    setRoundScores([]);
    const product = pickRandomProduct();
    if (product) {
      setCurrentProduct(product);
      setGuess(Math.round(product.price * 0.5)); // start at 50%
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
    const tolerance = price * 0.1; // 10% tolerance

    setAttempts(a => a + 1);

    if (Math.abs(guess - price) <= tolerance) {
      // Correct!
      setHint("correct");
      const roundScore = Math.max(10, 100 - (attempts * 20));
      setScore(s => s + roundScore);
      setRoundScores(prev => [...prev, roundScore]);
      setUsedProducts(prev => [...prev, currentProduct.id]);
      setTimeout(() => setGameState("result"), 800);
    } else if (guess < price) {
      setHint("higher");
    } else {
      setHint("lower");
    }
  }, [guess, currentProduct, attempts]);

  // Give up after 5 attempts
  useEffect(() => {
    if (attempts >= 5 && hint !== "correct") {
      setRoundScores(prev => [...prev, 0]);
      setUsedProducts(prev => [...prev, currentProduct?.id || ""]);
      setTimeout(() => setGameState("result"), 500);
    }
  }, [attempts, hint, currentProduct]);

  const adjustGuess = (amount: number) => {
    setGuess(prev => Math.max(0, prev + amount));
  };

  const getStep = () => {
    if (!currentProduct) return 1;
    const price = currentProduct.price;
    if (price >= 100) return 10;
    if (price >= 50) return 5;
    if (price >= 10) return 2;
    return 1;
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
            <h3 className="text-lg font-bold mb-2">تحتاج منتجات أكثر!</h3>
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
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-3"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ scale: 0.85, y: 30 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.85, y: 30 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="w-full max-w-sm max-h-[90vh] overflow-y-auto rounded-2xl bg-background shadow-2xl border border-border/50"
          style={{ direction: "rtl" }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between p-3.5 text-white"
            style={{ background: `linear-gradient(135deg, ${themeColor}, ${themeColor}bb)` }}
          >
            <div className="flex items-center gap-2">
              <span className="text-xl">🏷️</span>
              <h2 className="text-base font-bold">خمّن السعر</h2>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-full hover:bg-white/20 transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="p-4">
            {/* Menu */}
            {gameState === "menu" && (
              <div className="text-center space-y-4 py-4">
                <span className="text-6xl block">🏷️</span>
                <h3 className="text-xl font-bold">خمّن السعر!</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  سنعرض لك منتجات من المتجر<br/>
                  حاول تخمين سعرها الصحيح!<br/>
                  <span className="text-xs">{totalRounds} جولات • كلما خمنت أسرع كسبت أكثر</span>
                </p>
                <Button
                  onClick={startGame}
                  className="w-full text-white font-bold text-base py-5"
                  style={{ background: `linear-gradient(135deg, ${themeColor}, ${themeColor}cc)` }}
                >
                  <Target className="h-5 w-5 ml-2" />
                  ابدأ اللعب
                </Button>
              </div>
            )}

            {/* Playing */}
            {gameState === "playing" && currentProduct && (
              <div className="space-y-3">
                {/* Round info */}
                <div className="flex items-center justify-between text-xs">
                  <span className="px-2.5 py-1 rounded-lg bg-muted font-medium">
                    الجولة {round}/{totalRounds}
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-muted font-medium">
                    النقاط: {score}
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-muted font-medium">
                    المحاولة: {attempts}/5
                  </span>
                </div>

                {/* Product Image */}
                <div className="rounded-xl overflow-hidden aspect-square max-h-48 mx-auto bg-muted">
                  <img
                    src={currentProduct.image_url!}
                    alt="خمن سعر هذا المنتج"
                    className="w-full h-full object-cover"
                  />
                </div>

                <h4 className="text-center font-bold text-base">{currentProduct.name}</h4>

                {/* Hint */}
                <AnimatePresence mode="wait">
                  {hint && hint !== "correct" && (
                    <motion.div
                      key={hint}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className={`text-center py-2 rounded-lg text-sm font-bold ${
                        hint === "higher"
                          ? "bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400"
                          : "bg-orange-50 text-orange-600 dark:bg-orange-950 dark:text-orange-400"
                      }`}
                    >
                      {hint === "higher" ? (
                        <span className="flex items-center justify-center gap-1.5">
                          <ArrowUp className="h-4 w-4" /> السعر أعلى! ⬆️
                        </span>
                      ) : (
                        <span className="flex items-center justify-center gap-1.5">
                          <ArrowDown className="h-4 w-4" /> السعر أقل! ⬇️
                        </span>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Guess Controls */}
                <div className="flex items-center justify-center gap-3">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-10 w-10 rounded-full text-lg font-bold"
                    onClick={() => adjustGuess(-getStep())}
                  >
                    -
                  </Button>
                  <div
                    className="text-3xl font-bold min-w-[100px] text-center py-2 px-4 rounded-xl"
                    style={{ color: themeColor, background: `${themeColor}10` }}
                  >
                    {guess}
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-10 w-10 rounded-full text-lg font-bold"
                    onClick={() => adjustGuess(getStep())}
                  >
                    +
                  </Button>
                </div>

                {/* Quick adjust buttons */}
                <div className="flex justify-center gap-2">
                  {[-getStep() * 5, -getStep(), getStep(), getStep() * 5].map((amt, i) => (
                    <button
                      key={i}
                      onClick={() => adjustGuess(amt)}
                      className="px-2.5 py-1 rounded-lg text-xs font-medium bg-muted hover:bg-muted/80 transition-colors"
                    >
                      {amt > 0 ? `+${amt}` : amt}
                    </button>
                  ))}
                </div>

                <Button
                  onClick={handleGuess}
                  className="w-full text-white font-bold"
                  style={{ background: themeColor }}
                  disabled={attempts >= 5}
                >
                  <Check className="h-4 w-4 ml-1.5" />
                  تخمين!
                </Button>
              </div>
            )}

            {/* Round Result */}
            {gameState === "result" && currentProduct && (
              <div className="text-center space-y-3 py-4">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }}>
                  {roundScores[roundScores.length - 1] > 0 ? (
                    <span className="text-5xl block">🎯</span>
                  ) : (
                    <span className="text-5xl block">😅</span>
                  )}
                </motion.div>
                <h3 className="text-lg font-bold">
                  {roundScores[roundScores.length - 1] > 0 ? "أحسنت! 🎉" : "لا بأس!"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  سعر <span className="font-bold">{currentProduct.name}</span> هو
                </p>
                <div className="text-3xl font-bold" style={{ color: themeColor }}>
                  {currentProduct.price} 
                </div>
                {roundScores[roundScores.length - 1] > 0 && (
                  <p className="text-sm font-medium" style={{ color: themeColor }}>
                    +{roundScores[roundScores.length - 1]} نقطة
                  </p>
                )}
                <Button
                  onClick={startNextRound}
                  className="w-full text-white font-bold"
                  style={{ background: themeColor }}
                >
                  {round >= totalRounds ? "عرض النتيجة النهائية" : `الجولة التالية (${round + 1}/${totalRounds})`}
                </Button>
              </div>
            )}

            {/* Final Score */}
            {gameState === "final" && (
              <div className="text-center space-y-3 py-4">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200 }}>
                  <Trophy className="h-14 w-14 mx-auto" style={{ color: themeColor }} />
                </motion.div>
                <h3 className="text-xl font-bold">النتيجة النهائية</h3>
                <div className="text-4xl font-bold" style={{ color: themeColor }}>
                  {score} نقطة
                </div>
                <p className="text-sm text-muted-foreground">
                  أصبت في {roundScores.filter(s => s > 0).length} من {totalRounds} جولات
                </p>
                <div className="flex gap-2">
                  <Button onClick={startGame} className="flex-1 text-white" style={{ background: themeColor }}>
                    <RotateCcw className="h-4 w-4 ml-1.5" />
                    العب مجدداً
                  </Button>
                  <Button variant="outline" onClick={onClose} className="flex-1">
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
