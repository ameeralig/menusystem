import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Product } from '@/types/product';
import { toast } from 'sonner';

interface SpinWheelProps {
  products: Product[];
  onResult?: (product: Product) => void;
  colorTheme?: string;
}

const SpinWheel: React.FC<SpinWheelProps> = React.memo(({ products, onResult, colorTheme = "default" }) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState<Product | null>(null);
  const wheelRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // إنشاء صوت دوران العجلة محسّن وواقعي
  const playSpinSound = useCallback(() => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // إنشاء صوت النقر الواقعي للعجلة
      const createRealisticTick = (time: number, intensity: number) => {
        // صوت النقر الأساسي
        const clickOscillator = audioContext.createOscillator();
        const clickGain = audioContext.createGain();
        const clickFilter = audioContext.createBiquadFilter();
        
        clickOscillator.connect(clickFilter);
        clickFilter.connect(clickGain);
        clickGain.connect(audioContext.destination);
        
        // تضبيط الصوت ليكون أكثر واقعية
        clickOscillator.type = 'square';
        clickOscillator.frequency.setValueAtTime(300 + intensity * 100, time);
        clickOscillator.frequency.exponentialRampToValueAtTime(150, time + 0.05);
        
        clickFilter.type = 'highpass';
        clickFilter.frequency.setValueAtTime(200, time);
        
        clickGain.gain.setValueAtTime(0, time);
        clickGain.gain.linearRampToValueAtTime(0.4 * intensity, time + 0.01);
        clickGain.gain.exponentialRampToValueAtTime(0.001, time + 0.08);
        
        clickOscillator.start(time);
        clickOscillator.stop(time + 0.08);
        
        // إضافة صوت خشخشة خفيف
        const noiseBuffer = audioContext.createBuffer(1, audioContext.sampleRate * 0.1, audioContext.sampleRate);
        const noiseData = noiseBuffer.getChannelData(0);
        for (let i = 0; i < noiseData.length; i++) {
          noiseData[i] = (Math.random() * 2 - 1) * 0.1 * intensity;
        }
        
        const noiseSource = audioContext.createBufferSource();
        const noiseGain = audioContext.createGain();
        const noiseFilter = audioContext.createBiquadFilter();
        
        noiseSource.buffer = noiseBuffer;
        noiseSource.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(audioContext.destination);
        
        noiseFilter.type = 'bandpass';
        noiseFilter.frequency.setValueAtTime(800, time);
        
        noiseGain.gain.setValueAtTime(0, time);
        noiseGain.gain.linearRampToValueAtTime(0.2 * intensity, time + 0.01);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, time + 0.05);
        
        noiseSource.start(time);
      };
      
      // محاكاة دوران العجلة مع تباطؤ تدريجي
      const totalTicks = 50; // زيادة عدد النقرات لمزيد من الواقعية
      const duration = 4.2; // تطابق مدة الانيميشن الجديدة
      
      for (let i = 0; i < totalTicks; i++) {
        // حساب الوقت مع تباطؤ تدريجي (المسافات تزيد تدريجياً)
        const progress = i / totalTicks;
        const easeOut = 1 - Math.pow(1 - progress, 3.5); // منحنى تباطؤ أكثر سلاسة
        const time = audioContext.currentTime + easeOut * duration;
        
        // شدة الصوت تقل تدريجياً
        const intensity = 1 - (progress * 0.7);
        
        // تكرار النقرات يقل تدريجياً
        if (progress < 0.4 || Math.random() > progress * 0.8) {
          createRealisticTick(time, intensity);
        }
      }
      
      // صوت التوقف النهائي - نقرة أخيرة مكتومة
      setTimeout(() => {
        const finalClick = audioContext.createOscillator();
        const finalGain = audioContext.createGain();
        
        finalClick.connect(finalGain);
        finalGain.connect(audioContext.destination);
        
        finalClick.type = 'triangle';
        finalClick.frequency.setValueAtTime(180, audioContext.currentTime);
        finalClick.frequency.exponentialRampToValueAtTime(120, audioContext.currentTime + 0.2);
        
        finalGain.gain.setValueAtTime(0.3, audioContext.currentTime);
        finalGain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.2);
        
        finalClick.start();
        finalClick.stop(audioContext.currentTime + 0.2);
      }, 4200); // تطابق المدة الجديدة
      
    } catch (error) {
      console.log('Audio not supported');
    }
  }, []);

  // ألوان العجلة محسّنة للأداء
  const wheelColors = useMemo(() => {
    const colorMap: { [key: string]: string } = {
      default: '#6E7681',
      coral: '#ff9178',
      purple: '#8B5CF6',
      blue: '#3B82F6',
      green: '#10B981',
      pink: '#EC4899',
      teal: '#14B8A6',
      amber: '#F59E0B',
      indigo: '#6366F1',
      rose: '#F43F5E'
    };

    const mainColor = colorMap[colorTheme] || colorMap.default;
    
    // تحويل لون hex إلى HSL مُحسّن
    const hexToHsl = (hex: string): [number, number, number] => {
      const r = parseInt(hex.slice(1, 3), 16) / 255;
      const g = parseInt(hex.slice(3, 5), 16) / 255;
      const b = parseInt(hex.slice(5, 7), 16) / 255;
      
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      let h = 0, s = 0;
      const l = (max + min) / 2;
      
      if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        
        switch (max) {
          case r: h = (g - b) / d + (g < b ? 6 : 0); break;
          case g: h = (b - r) / d + 2; break;
          case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
      }
      
      return [h * 360, s * 100, l * 100];
    };

    const [hue, saturation, lightness] = hexToHsl(mainColor);
    
    // إنشاء تدرجات محسّنة
    return products.map((_, i) => {
      const adjustedHue = (hue + (i * (360 / products.length))) % 360;
      const adjustedSaturation = Math.max(40, saturation - (i % 3) * 10);
      const adjustedLightness = Math.max(45, Math.min(75, lightness + (i % 4) * 8));
      return `hsl(${adjustedHue}, ${adjustedSaturation}%, ${adjustedLightness}%)`;
    });
  }, [products.length, colorTheme]);

  // التأكد من وجود منتجات
  if (!products || products.length === 0) {
    return (
      <Card className="p-8 text-center mx-auto max-w-md">
        <p className="text-muted-foreground">لا توجد منتجات متاحة للعجلة</p>
      </Card>
    );
  }

  // حساب زاوية كل قطاع (مُحسّن)
  const sectorAngle = useMemo(() => 360 / products.length, [products.length]);

  const handleSpin = useCallback(() => {
    if (isSpinning) return;
    
    setIsSpinning(true);
    setResult(null);
    playSpinSound();
    
    // حساب الدوران العشوائي (10-15 دورة كاملة + زاوية عشوائية لمزيد من الواقعية)
    const spins = Math.floor(Math.random() * 6) + 10; // 10-15 دورات
    const finalAngle = Math.random() * 360;
    const totalRotation = rotation + (spins * 360) + finalAngle;
    
    setRotation(totalRotation);
    
    // تحديد المنتج الفائز بعد انتهاء الدوران - تصحيح للاتجاه الصحيح
    setTimeout(() => {
      // السهم في الأعلى (90 درجة)، لذا نحتاج لتعديل الحساب
      const normalizedAngle = (totalRotation + 90) % 360; // إضافة 90 درجة للسهم في الأعلى
      const winnerIndex = Math.floor(normalizedAngle / sectorAngle) % products.length;
      const winner = products[winnerIndex];
      
      setResult(winner);
      setIsSpinning(false);
      onResult?.(winner);
      
      toast.success(`🎉 النتيجة: ${winner.name}!`);
    }, 4500); // تطابق مدة الانيميشن الجديدة
  }, [isSpinning, rotation, sectorAngle, products, onResult, playSpinSound]);

  const resetWheel = useCallback(() => {
    setRotation(0);
    setResult(null);
  }, []);

  return (
    <div className="flex flex-col items-center gap-6 p-6 w-full">
      {/* العجلة */}
      <div className="relative flex justify-center">
        {/* المؤشر المحسّن */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-4 z-10">
          <div className="flex flex-col items-center">
            <div 
              className="w-0 h-0 border-l-8 border-r-8 border-b-16 border-l-transparent border-r-transparent"
              style={{
                borderBottomColor: 'hsl(45, 100%, 50%)',
                filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.4)) drop-shadow(0 0 10px hsl(45, 100%, 70%))'
              }}
            ></div>
            <div 
              className="w-6 h-8 rounded-b-md"
              style={{
                background: 'linear-gradient(180deg, hsl(45, 100%, 50%) 0%, hsl(43, 74%, 49%) 50%, hsl(43, 74%, 43%) 100%)',
                boxShadow: '0 4px 8px rgba(0,0,0,0.3), 0 0 15px hsl(45, 100%, 70%)'
              }}
            ></div>
          </div>
        </div>
        
        {/* العجلة الدوارة المحسّنة */}
        <motion.div
          ref={wheelRef}
          className="relative w-96 h-96 rounded-full shadow-2xl overflow-hidden"
          animate={{ rotate: rotation }}
          transition={{ 
            duration: isSpinning ? 4.5 : 0,
            ease: isSpinning ? [0.25, 0.46, 0.45, 0.94] : "linear",
            type: "tween"
          }}
          style={useMemo(() => ({
            background: `conic-gradient(${products.map((_, index) => {
              const startAngle = (index * sectorAngle);
              const endAngle = ((index + 1) * sectorAngle);
              const color1 = wheelColors[index] || wheelColors[index % wheelColors.length];
              // تدرج لوني متقدم مع تأثيرات إضاءة
              const hslMatch = color1.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
              if (hslMatch) {
                const [h, s, l] = hslMatch.slice(1, 4).map(Number);
                const color2 = `hsl(${h}, ${Math.min(100, s + 15)}%, ${Math.min(85, l + 15)}%)`;
                const color3 = `hsl(${h}, ${Math.max(30, s - 10)}%, ${Math.max(30, l - 15)}%)`;
                return `${color3} ${startAngle}deg, ${color1} ${startAngle + (sectorAngle/3)}deg, ${color2} ${startAngle + (2*sectorAngle/3)}deg, ${color1} ${endAngle}deg`;
              }
              return `${color1} ${startAngle}deg, ${color1} ${endAngle}deg`;
            }).join(', ')})`,
            border: '6px solid rgba(255, 255, 255, 0.3)',
            boxShadow: `
              0 0 50px rgba(255, 255, 255, 0.2),
              0 0 100px rgba(255, 255, 255, 0.1),
              inset 0 0 30px rgba(255, 255, 255, 0.1),
              0 20px 40px rgba(0, 0, 0, 0.3)
            `
          }), [products.length, sectorAngle, wheelColors])}
        >
          {/* خطوط فاصلة محسّنة بين القطاعات */}
          {products.map((_, index) => {
            const angle = index * sectorAngle;
            const radian = (angle * Math.PI) / 180;
            const x1 = Math.cos(radian - Math.PI/2) * 20 + 192;
            const y1 = Math.sin(radian - Math.PI/2) * 20 + 192;
            const x2 = Math.cos(radian - Math.PI/2) * 192 + 192;
            const y2 = Math.sin(radian - Math.PI/2) * 192 + 192;
            
            return (
              <div
                key={`line-${index}`}
                className="absolute w-1 origin-bottom"
                style={{
                  left: x1,
                  top: y1,
                  height: Math.sqrt((x2-x1)**2 + (y2-y1)**2),
                  transform: `rotate(${angle + 90}deg)`,
                  transformOrigin: 'bottom',
                  background: 'linear-gradient(to bottom, rgba(255,255,255,0.8), rgba(255,255,255,0.3), rgba(255,255,255,0.1))',
                  boxShadow: '0 0 4px rgba(255,255,255,0.5)'
                }}
              />
            );
          })}

          {/* أسماء المنتجات المحسّنة */}
          {products.map((product, index) => {
            const angle = (index * sectorAngle) + (sectorAngle / 2);
            
            return (
              <div
                key={product.id}
                className="absolute"
                style={{
                  left: '50%',
                  top: '50%',
                  transform: `rotate(${angle}deg)`,
                  transformOrigin: '0 0',
                  width: '140px',
                  height: '20px'
                }}
              >
                {/* النص من المنتصف للطرف مع تأثيرات محسّنة */}
                <div 
                  className="absolute flex items-center justify-start"
                  style={{
                    left: '40px', // بداية النص من المركز
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '130px'
                  }}
                >
                  <p 
                    className="text-sm font-bold whitespace-nowrap overflow-hidden text-ellipsis text-white"
                    style={{
                      textShadow: '2px 2px 4px rgba(0,0,0,0.9), 1px 1px 2px rgba(0,0,0,0.8), 0 0 8px rgba(0,0,0,0.6)',
                      filter: 'drop-shadow(0 0 2px rgba(255,255,255,0.4))'
                    }}
                  >
                    {product.name.length > 12 ? product.name.substring(0, 12) + '...' : product.name}
                  </p>
                </div>
              </div>
            );
          })}
          
          {/* دائرة مركزية قابلة للضغط لبدء الدوران */}
          <motion.div 
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full flex items-center justify-center"
            style={{
              background: `
                radial-gradient(circle, 
                  rgba(255,255,255,0.95) 0%, 
                  rgba(255,255,255,0.8) 30%, 
                  rgba(255,255,255,0.6) 70%, 
                  rgba(255,255,255,0.3) 100%
                )
              `,
              boxShadow: `
                0 0 25px rgba(255,255,255,0.8),
                inset 0 0 25px rgba(255,255,255,0.4),
                0 6px 12px rgba(0,0,0,0.4)
              `,
              border: '3px solid rgba(255,255,255,0.9)',
              cursor: isSpinning ? 'not-allowed' : 'pointer',
              pointerEvents: isSpinning ? 'none' : 'auto'
            }}
            whileHover={!isSpinning ? { scale: 1.1 } : {}}
            whileTap={!isSpinning ? { scale: 0.95 } : {}}
            onClick={!isSpinning ? handleSpin : undefined}
          >
            {isSpinning ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="text-3xl"
              >
                ⭐
              </motion.div>
            ) : (
              <motion.div 
                className="text-center"
                initial={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-2xl mb-1">🎯</div>
                <div className="text-xs font-bold text-gray-700">اضغط</div>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      </div>

      {/* إعادة تعيين العجلة فقط */}
      <div className="flex justify-center mt-6">
        <Button 
          onClick={resetWheel} 
          variant="outline" 
          size="lg"
          className="border-border bg-background hover:bg-muted text-foreground hover:text-foreground"
        >
          <RotateCcw className="w-5 h-5 mr-2" />
          إعادة تعيين
        </Button>
      </div>

      {/* عرض النتيجة */}
      {result && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center w-full"
        >
          <Card className="p-6 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20 mx-auto max-w-md">
            <h3 className="text-2xl font-bold text-primary mb-2">🎉 النتيجة</h3>
            <div className="flex items-center justify-center gap-4">
              {result.image_url && (
                <img 
                  src={result.image_url} 
                  alt={result.name}
                  className="w-16 h-16 rounded-full object-cover border-2 border-primary"
                />
              )}
              <div>
                <h4 className="text-xl font-semibold text-foreground">{result.name}</h4>
                <p className="text-lg text-primary font-bold">{result.price.toLocaleString()} د.ع</p>
                {result.description && (
                  <p className="text-sm text-muted-foreground mt-1">{result.description}</p>
                )}
              </div>
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
});

export default SpinWheel;