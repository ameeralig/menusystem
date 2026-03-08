import React, { useState, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Product } from '@/types/product';
import { toast } from 'sonner';

interface SpinWheelProps {
  products: Product[];
  onResult?: (product: Product) => void;
  colorTheme?: string;
  hideResult?: boolean;
}

// Procedural audio engine
const useWheelSounds = () => {
  const ctxRef = useRef<AudioContext | null>(null);
  const getCtx = () => {
    if (!ctxRef.current) ctxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    return ctxRef.current;
  };

  const playSpinSound = useCallback(() => {
    try {
      const ctx = getCtx();
      const totalTicks = 50;
      const duration = 4.2;

      for (let i = 0; i < totalTicks; i++) {
        const progress = i / totalTicks;
        const easeOut = 1 - Math.pow(1 - progress, 3.5);
        const time = ctx.currentTime + easeOut * duration;
        const intensity = 1 - (progress * 0.7);

        if (progress < 0.4 || Math.random() > progress * 0.8) {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const filter = ctx.createBiquadFilter();
          osc.connect(filter); filter.connect(gain); gain.connect(ctx.destination);
          osc.type = 'square';
          osc.frequency.setValueAtTime(300 + intensity * 100, time);
          osc.frequency.exponentialRampToValueAtTime(150, time + 0.05);
          filter.type = 'highpass'; filter.frequency.setValueAtTime(200, time);
          gain.gain.setValueAtTime(0, time);
          gain.gain.linearRampToValueAtTime(0.3 * intensity, time + 0.01);
          gain.gain.exponentialRampToValueAtTime(0.001, time + 0.08);
          osc.start(time); osc.stop(time + 0.08);
        }
      }

      // Final stop sound
      setTimeout(() => {
        try {
          const ctx2 = getCtx();
          const finalOsc = ctx2.createOscillator();
          const finalGain = ctx2.createGain();
          finalOsc.connect(finalGain); finalGain.connect(ctx2.destination);
          finalOsc.type = 'triangle';
          finalOsc.frequency.setValueAtTime(180, ctx2.currentTime);
          finalOsc.frequency.exponentialRampToValueAtTime(120, ctx2.currentTime + 0.2);
          finalGain.gain.setValueAtTime(0.3, ctx2.currentTime);
          finalGain.gain.exponentialRampToValueAtTime(0.001, ctx2.currentTime + 0.2);
          finalOsc.start(); finalOsc.stop(ctx2.currentTime + 0.2);
        } catch {}
      }, 4200);
    } catch {}
  }, []);

  const playWinSound = useCallback(() => {
    try {
      const ctx = getCtx();
      [523, 659, 784, 1047, 1319].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        osc.frequency.value = freq;
        osc.type = 'sine';
        const t = ctx.currentTime + i * 0.12;
        gain.gain.setValueAtTime(0.2, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
        osc.start(t); osc.stop(t + 0.3);
      });
    } catch {}
  }, []);

  return { playSpinSound, playWinSound };
};

const SpinWheel: React.FC<SpinWheelProps> = React.memo(({ products, onResult, colorTheme = "default", hideResult = false }) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState<Product | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showWinEffect, setShowWinEffect] = useState(false);
  const wheelRef = useRef<HTMLDivElement>(null);
  const { playSpinSound, playWinSound } = useWheelSounds();

  // Theme-aware wheel colors
  const wheelColors = useMemo(() => {
    const colorMap: Record<string, string> = {
      default: '#6E7681', coral: '#ff9178', purple: '#8B5CF6', blue: '#3B82F6',
      green: '#10B981', pink: '#EC4899', teal: '#14B8A6', amber: '#F59E0B',
      indigo: '#6366F1', rose: '#F43F5E',
    };
    const mainColor = colorTheme?.startsWith('#') ? colorTheme : (colorMap[colorTheme || ''] || colorMap.default);

    const hexToHsl = (hex: string): [number, number, number] => {
      const r = parseInt(hex.slice(1, 3), 16) / 255;
      const g = parseInt(hex.slice(3, 5), 16) / 255;
      const b = parseInt(hex.slice(5, 7), 16) / 255;
      const max = Math.max(r, g, b), min = Math.min(r, g, b);
      let h = 0, s = 0;
      const l = (max + min) / 2;
      if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) { case r: h = (g - b) / d + (g < b ? 6 : 0); break; case g: h = (b - r) / d + 2; break; case b: h = (r - g) / d + 4; break; }
        h /= 6;
      }
      return [h * 360, s * 100, l * 100];
    };

    const [hue, sat, light] = hexToHsl(mainColor);
    return products.map((_, i) => {
      const h = (hue + (i * (360 / products.length))) % 360;
      const s = Math.max(45, sat - (i % 3) * 8);
      const l = Math.max(40, Math.min(70, light + (i % 2 === 0 ? 8 : -5)));
      return `hsl(${h}, ${s}%, ${l}%)`;
    });
  }, [products.length, colorTheme]);

  const sectorAngle = useMemo(() => 360 / (products.length || 1), [products.length]);

  // Generate conic gradient
  const conicGradient = useMemo(() => {
    if (!products.length) return '';
    return products.map((_, index) => {
      const startAngle = index * sectorAngle;
      const endAngle = (index + 1) * sectorAngle;
      const color = wheelColors[index % wheelColors.length];
      const hslMatch = color.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
      if (hslMatch) {
        const [h, s, l] = hslMatch.slice(1, 4).map(Number);
        const lighter = `hsl(${h}, ${Math.min(100, s + 12)}%, ${Math.min(80, l + 12)}%)`;
        const darker = `hsl(${h}, ${Math.max(30, s - 8)}%, ${Math.max(30, l - 12)}%)`;
        return `${darker} ${startAngle}deg, ${color} ${startAngle + sectorAngle * 0.3}deg, ${lighter} ${startAngle + sectorAngle * 0.7}deg, ${color} ${endAngle}deg`;
      }
      return `${color} ${startAngle}deg, ${color} ${endAngle}deg`;
    }).join(', ');
  }, [products.length, sectorAngle, wheelColors]);

  const themeColor = useMemo(() => {
    return colorTheme?.startsWith('#') ? colorTheme : ({
      coral: '#ff9178', purple: '#8B5CF6', blue: '#3B82F6', green: '#10B981',
      pink: '#EC4899', teal: '#14B8A6', amber: '#F59E0B', indigo: '#6366F1', rose: '#F43F5E',
    }[colorTheme || ''] || '#3B82F6');
  }, [colorTheme]);

  const handleSpin = () => {
    if (isSpinning || !products.length) return;
    setIsSpinning(true);
    setResult(null);
    setShowWinEffect(false);
    if (soundEnabled) playSpinSound();

    const spins = Math.floor(Math.random() * 6) + 10;
    const finalAngle = Math.random() * 360;
    const totalRotation = rotation + (spins * 360) + finalAngle;
    setRotation(totalRotation);

    setTimeout(() => {
      const adjustedRotation = (360 - (totalRotation % 360)) % 360;
      const pointerOffsetDeg = 270;
      const adjustedWithOffset = (adjustedRotation + pointerOffsetDeg) % 360;
      const winnerIndex = Math.floor(adjustedWithOffset / sectorAngle) % products.length;
      const winner = products[winnerIndex];

      setResult(winner);
      setIsSpinning(false);
      setShowWinEffect(true);
      if (soundEnabled) playWinSound();
      onResult?.(winner);
      toast.success(`🎉 النتيجة: ${winner.name}!`);
      setTimeout(() => setShowWinEffect(false), 3000);
    }, 4500);
  };

  const resetWheel = () => {
    setRotation(0);
    setResult(null);
    setShowWinEffect(false);
  };

  if (!products || products.length === 0) {
    return (
      <div className="text-center py-12 space-y-3">
        <motion.span animate={{ y: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 2 }} className="text-5xl block">🎡</motion.span>
        <p className="text-sm text-muted-foreground font-medium">لا توجد منتجات متاحة للعجلة</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 w-full py-2">
      {/* Sound toggle */}
      <div className="flex justify-end w-full px-1">
        <button onClick={() => setSoundEnabled(!soundEnabled)}
          className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all">
          {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
        </button>
      </div>

      {/* Wheel container */}
      <div className="relative flex justify-center w-full">
        {/* Outer glow ring */}
        <motion.div
          animate={isSpinning ? { opacity: [0.3, 0.7, 0.3], scale: [1, 1.02, 1] } : { opacity: 0.15 }}
          transition={{ repeat: isSpinning ? Infinity : 0, duration: 1 }}
          className="absolute w-[calc(100%-8px)] aspect-square max-w-[22rem] rounded-full"
          style={{
            top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            boxShadow: `0 0 40px ${themeColor}40, 0 0 80px ${themeColor}20`,
          }}
        />

        {/* Pointer / Arrow */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2 z-20">
          <motion.div animate={showWinEffect ? { y: [0, -5, 0], scale: [1, 1.2, 1] } : {}}
            transition={{ repeat: showWinEffect ? 3 : 0, duration: 0.3 }}
            className="flex flex-col items-center">
            <div className="w-0 h-0"
              style={{
                borderLeft: '10px solid transparent', borderRight: '10px solid transparent',
                borderBottom: '22px solid #f59e0b',
                filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.4)) drop-shadow(0 0 8px rgba(245,158,11,0.6))',
              }} />
            <div className="w-5 h-5 rounded-b-md -mt-0.5"
              style={{
                background: 'linear-gradient(180deg, #f59e0b, #d97706)',
                boxShadow: '0 3px 8px rgba(0,0,0,0.3), 0 0 12px rgba(245,158,11,0.5)',
              }} />
          </motion.div>
        </div>

        {/* The Wheel */}
        <motion.div
          ref={wheelRef}
          className="relative w-72 h-72 sm:w-80 sm:h-80 rounded-full overflow-hidden"
          animate={{ rotate: rotation }}
          transition={{
            duration: isSpinning ? 4.5 : 0,
            ease: isSpinning ? [0.25, 0.46, 0.45, 0.94] : "linear",
            type: "tween",
          }}
          style={{
            background: `conic-gradient(${conicGradient})`,
            border: '5px solid hsl(var(--border))',
            boxShadow: `0 0 30px rgba(0,0,0,0.15), inset 0 0 20px rgba(255,255,255,0.1), 0 12px 30px rgba(0,0,0,0.2)`,
          }}
        >
          {/* Sector divider lines */}
          {products.map((_, index) => (
            <div key={`line-${index}`}
              className="absolute top-1/2 left-1/2 origin-left"
              style={{
                width: '50%', height: '1.5px',
                transform: `rotate(${index * sectorAngle}deg)`,
                background: 'linear-gradient(90deg, transparent 15%, rgba(255,255,255,0.5) 50%, rgba(255,255,255,0.2) 100%)',
              }}
            />
          ))}

          {/* Product names */}
          {products.map((product, index) => {
            const angle = (index * sectorAngle) + (sectorAngle / 2);
            return (
              <div key={product.id} className="absolute" style={{
                left: '50%', top: '50%',
                transform: `rotate(${angle}deg)`, transformOrigin: '0 0',
                width: '140px', height: '20px',
              }}>
                <div className="absolute flex items-center" style={{
                  left: '35px', top: '50%', transform: 'translateY(-50%)', width: '120px',
                }}>
                  <p className="text-[11px] sm:text-xs font-bold whitespace-nowrap overflow-hidden text-ellipsis text-white"
                    style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.8), 0 0 6px rgba(0,0,0,0.5)' }}>
                    {product.name.length > 14 ? product.name.substring(0, 14) + '…' : product.name}
                  </p>
                </div>
              </div>
            );
          })}

          {/* Center button */}
          <AnimatePresence>
            {!isSpinning && (
              <motion.div
                initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                className="absolute z-20 cursor-pointer"
                style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
                whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                onClick={handleSpin}
              >
                <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-full flex flex-col items-center justify-center shadow-xl border-3 border-white/50"
                  style={{
                    background: result
                      ? `linear-gradient(135deg, ${themeColor}, ${themeColor}cc)`
                      : 'radial-gradient(circle, rgba(255,255,255,0.95), rgba(255,255,255,0.7))',
                    boxShadow: `0 0 20px rgba(255,255,255,0.6), inset 0 0 15px rgba(255,255,255,0.3), 0 4px 12px rgba(0,0,0,0.3)`,
                  }}>
                  <motion.span
                    animate={!result ? { scale: [1, 1.15, 1] } : {}}
                    transition={{ repeat: !result ? Infinity : 0, duration: 1.5 }}
                    className="text-xl sm:text-2xl"
                  >
                    {result ? '🔄' : '🎯'}
                  </motion.span>
                  <span className={`text-[8px] sm:text-[9px] font-black ${result ? 'text-white' : 'text-foreground/70'}`}>
                    {result ? 'أعد' : 'أدر'}
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Spinning center */}
          {isSpinning && (
            <div className="absolute z-20" style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
              <motion.div
                animate={{ rotate: -rotation, scale: [1, 1.05, 1] }}
                transition={{ rotate: { duration: 4.5, ease: [0.25, 0.46, 0.45, 0.94] }, scale: { repeat: Infinity, duration: 0.5 } }}
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center"
                style={{
                  background: `linear-gradient(135deg, ${themeColor}, ${themeColor}cc)`,
                  boxShadow: `0 0 25px ${themeColor}60, 0 4px 12px rgba(0,0,0,0.3)`,
                }}
              >
                <motion.span animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 0.4 }}
                  className="text-xl text-white">🎲</motion.span>
              </motion.div>
            </div>
          )}
        </motion.div>

        {/* Win particles */}
        <AnimatePresence>
          {showWinEffect && (
            <>
              {Array.from({ length: 16 }).map((_, i) => (
                <motion.div key={i}
                  initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
                  animate={{
                    opacity: [0, 1, 0], scale: [0, 1, 0],
                    x: (Math.random() - 0.5) * 300,
                    y: (Math.random() - 0.5) * 300,
                    rotate: Math.random() * 720,
                  }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.5, delay: i * 0.05 }}
                  className="absolute top-1/2 left-1/2 text-xl pointer-events-none z-30"
                >
                  {['🎉', '✨', '🎊', '⭐', '💫', '🌟', '🎯', '🏆'][i % 8]}
                </motion.div>
              ))}
            </>
          )}
        </AnimatePresence>
      </div>

      {/* Buttons */}
      <div className="flex gap-2 w-full max-w-xs">
        <Button onClick={resetWheel} variant="outline" size="sm"
          className="flex-1 rounded-xl text-xs h-9 font-bold">
          <RotateCcw className="w-3.5 h-3.5 ml-1.5" /> إعادة تعيين
        </Button>
        {!isSpinning && !result && (
          <motion.div className="flex-1" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button onClick={handleSpin} size="sm"
              className="w-full rounded-xl text-xs h-9 font-bold text-white shadow-md"
              style={{ background: `linear-gradient(135deg, ${themeColor}, ${themeColor}cc)` }}>
              🎰 أدر العجلة
            </Button>
          </motion.div>
        )}
      </div>

      {/* Result */}
      {!hideResult && result && (
        <motion.div initial={{ opacity: 0, y: 15, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: "spring", stiffness: 300 }}
          className="w-full max-w-xs rounded-2xl border-2 p-4 overflow-hidden relative"
          style={{ borderColor: `${themeColor}40`, background: `${themeColor}08` }}>
          <div className="absolute inset-0 opacity-5"
            style={{ backgroundImage: `radial-gradient(circle at 30% 50%, ${themeColor} 1px, transparent 1px)`, backgroundSize: '16px 16px' }} />
          <div className="relative flex items-center gap-3">
            {result.image_url && (
              <motion.img
                initial={{ scale: 0, rotate: -10 }} animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", delay: 0.1 }}
                src={result.image_url} alt={result.name}
                className="w-14 h-14 rounded-xl object-cover border-2 shadow-md"
                style={{ borderColor: `${themeColor}40` }}
              />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground font-medium">🎉 النتيجة</p>
              <h4 className="text-sm font-black text-foreground truncate">{result.name}</h4>
              <p className="text-sm font-black" style={{ color: themeColor }}>{result.price.toLocaleString()} د.ع</p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
});

export default SpinWheel;
