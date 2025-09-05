import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { RotateCcw, Play } from 'lucide-react';
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

  // إنشاء صوت دوران العجلة الحقيقي (محسّن للأداء)
  const playSpinSound = useCallback(() => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // إنشاء صوت الدوران المتكرر للعجلة
      const createTickSound = (time: number, pitch: number) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(pitch, time);
        
        gainNode.gain.setValueAtTime(0, time);
        gainNode.gain.linearRampToValueAtTime(0.3, time + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.01, time + 0.1);
        
        oscillator.start(time);
        oscillator.stop(time + 0.1);
      };
      
      // إنشاء سلسلة من الأصوات للمحاكاة صوت العجلة
      const tickCount = 30;
      const duration = 3.5;
      
      for (let i = 0; i < tickCount; i++) {
        const time = audioContext.currentTime + (i / tickCount) * duration;
        // تقليل التردد تدريجياً لمحاكاة تباطؤ العجلة
        const pitch = 800 - (i / tickCount) * 400;
        // زيادة الفترة الزمنية بين النقرات تدريجياً
        const interval = 0.05 + (i / tickCount) * 0.15;
        
        if (i % Math.max(1, Math.floor((i + 1) / 5)) === 0) {
          createTickSound(time, pitch);
        }
      }
      
      // صوت التوقف النهائي
      setTimeout(() => {
        const finalOscillator = audioContext.createOscillator();
        const finalGain = audioContext.createGain();
        
        finalOscillator.connect(finalGain);
        finalGain.connect(audioContext.destination);
        
        finalOscillator.type = 'sine';
        finalOscillator.frequency.setValueAtTime(200, audioContext.currentTime);
        finalOscillator.frequency.exponentialRampToValueAtTime(150, audioContext.currentTime + 0.3);
        
        finalGain.gain.setValueAtTime(0.2, audioContext.currentTime);
        finalGain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        
        finalOscillator.start();
        finalOscillator.stop(audioContext.currentTime + 0.3);
      }, 3200);
      
    } catch (error) {
      console.log('Audio not supported');
    }
  }, []);

  // ألوان العجلة الثابتة للتصميم الجديد
  const wheelColors = useMemo(() => {
    const baseColors = [
      '#e74c3c', // أحمر
      '#3498db', // أزرق  
      '#2ecc71', // أخضر
      '#f1c40f', // أصفر
      '#9b59b6', // بنفسجي
      '#e67e22', // برتقالي
      '#1abc9c', // تركواز
      '#e91e63', // وردي
      '#ff5722', // برتقالي محمر
      '#607d8b'  // رمادي مزرق
    ];
    
    return products.map((_, i) => baseColors[i % baseColors.length]);
  }, [products.length]);

  // التأكد من وجود منتجات
  if (!products || products.length === 0) {
    return (
      <Card className="p-8 text-center">
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
    
    // حساب الدوران العشوائي (8-12 دورة كاملة + زاوية عشوائية)
    const spins = Math.floor(Math.random() * 5) + 8; // 8-12 دورات
    const finalAngle = Math.random() * 360;
    const totalRotation = rotation + (spins * 360) + finalAngle;
    
    setRotation(totalRotation);
    
    // تحديد المنتج الفائز بعد انتهاء الدوران
    setTimeout(() => {
      const normalizedAngle = (360 - (totalRotation % 360)) % 360;
      const winnerIndex = Math.floor(normalizedAngle / sectorAngle);
      const winner = products[winnerIndex < products.length ? winnerIndex : 0];
      
      setResult(winner);
      setIsSpinning(false);
      onResult?.(winner);
      
      toast.success(`🎊 مبروك! النتيجة: ${winner.name}!`);
    }, 4000);
  }, [isSpinning, rotation, sectorAngle, products, onResult, playSpinSound]);

  const resetWheel = useCallback(() => {
    setRotation(0);
    setResult(null);
  }, []);

  return (
    <div className="flex flex-col items-center gap-6 p-6">
      {/* العجلة */}
      <div className="relative">
        {/* المؤشر الجديد */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-5 z-20">
          <div 
            className="w-0 h-0 border-l-5 border-r-5 border-b-7"
            style={{
              borderLeftColor: 'transparent',
              borderRightColor: 'transparent', 
              borderBottomColor: '#333',
              borderLeftWidth: '20px',
              borderRightWidth: '20px',
              borderBottomWidth: '30px'
            }}
          />
        </div>
        
        {/* العجلة الدوارة الجديدة */}
        <motion.div
          ref={wheelRef}
          className="relative w-96 h-96 rounded-full overflow-hidden"
          animate={{ rotate: rotation }}
          transition={{ 
            duration: isSpinning ? 4 : 0,
            ease: isSpinning ? "easeOut" : "linear",
          }}
          style={{
            border: '8px solid #333',
            background: '#fff'
          }}
        >
          {/* الشرائح المثلثية */}
          {products.map((product, index) => {
            const angle = (index * sectorAngle);
            const color = wheelColors[index];
            const textColor = color === '#f1c40f' ? '#333' : '#fff';
            
            return (
              <div
                key={product.id}
                className="absolute"
                style={{
                  width: '50%',
                  height: '50%',
                  top: '50%',
                  left: '50%',
                  transformOrigin: '0% 0%',
                  transform: `rotate(${angle}deg)`,
                  background: color,
                  clipPath: 'polygon(0 0, 100% 0, 0 100%)',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  color: textColor
                }}
              >
                <div 
                  className="absolute"
                  style={{
                    transform: `rotate(${30}deg)`,
                    transformOrigin: 'center',
                    width: '100%',
                    textAlign: 'center',
                    top: '30%',
                    left: '20%'
                  }}
                >
                  {product.name.length > 8 ? product.name.substring(0, 8) + '...' : product.name}
                </div>
              </div>
            );
          })}
        </motion.div>
      </div>

      {/* أزرار التحكم */}
      <div className="flex gap-4">
        <Button
          onClick={handleSpin}
          disabled={isSpinning}
          size="lg"
          className="px-8"
        >
          {isSpinning ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-5 h-5 mr-2"
              >
                <RotateCcw className="w-5 h-5" />
              </motion.div>
              جاري الدوران...
            </>
          ) : (
              <>
                <Play className="w-5 h-5 mr-2" />
                🎉 جرّب حظك
              </>
          )}
        </Button>
        
        <Button onClick={resetWheel} variant="outline" size="lg">
          <RotateCcw className="w-5 h-5 mr-2" />
          إعادة تعيين
        </Button>
      </div>

      {/* عرض النتيجة */}
      {result && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <Card className="p-6 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
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
                <h4 className="text-xl font-semibold">{result.name}</h4>
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