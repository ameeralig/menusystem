import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { RotateCcw, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Product } from '@/types/product';
import { toast } from 'sonner';

interface SpinWheelProps {
  products: Product[];
  onResult?: (product: Product) => void;
}

const SpinWheel: React.FC<SpinWheelProps> = ({ products, onResult }) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState<Product | null>(null);
  const wheelRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // إنشاء صوت الدوران
  useEffect(() => {
    // إنشاء صوت بسيط للدوران باستخدام Web Audio API
    const createSpinSound = () => {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.type = 'sawtooth';
      oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(80, audioContext.currentTime + 3);
      
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 3);
      
      return { oscillator, audioContext };
    };

    if (isSpinning) {
      try {
        const { oscillator, audioContext } = createSpinSound();
        oscillator.start();
        setTimeout(() => {
          oscillator.stop();
          audioContext.close();
        }, 3000);
      } catch (error) {
        console.log('Audio not supported');
      }
    }
  }, [isSpinning]);

  // التأكد من وجود منتجات
  if (!products || products.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">لا توجد منتجات متاحة للعجلة</p>
      </Card>
    );
  }

  // حساب زاوية كل قطاع
  const sectorAngle = 360 / products.length;

  const handleSpin = () => {
    if (isSpinning) return;
    
    setIsSpinning(true);
    setResult(null);
    
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
      
      toast.success(`🎉 النتيجة: ${winner.name}!`);
    }, 3500);
  };

  const resetWheel = () => {
    setRotation(0);
    setResult(null);
  };

  return (
    <div className="flex flex-col items-center gap-6 p-6">
      {/* العجلة */}
      <div className="relative">
        {/* المؤشر */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-3 z-10">
          <div className="flex flex-col items-center">
            <div className="w-0 h-0 border-l-6 border-r-6 border-b-12 border-l-transparent border-r-transparent border-b-primary shadow-lg"></div>
            <div className="w-4 h-6 bg-primary rounded-b-md shadow-lg"></div>
          </div>
        </div>
        
        {/* العجلة الدوارة */}
        <motion.div
          ref={wheelRef}
          className="relative w-96 h-96 rounded-full border-8 border-primary/20 shadow-2xl overflow-hidden bg-gradient-to-br from-background/90 to-background/70 backdrop-blur-sm"
          animate={{ rotate: rotation }}
          transition={{ 
            duration: isSpinning ? 3.5 : 0,
            ease: isSpinning ? [0.23, 1, 0.32, 1] : "linear",
            type: "spring"
          }}
          style={{
            background: `conic-gradient(${products.map((_, index) => {
              const startAngle = (index * sectorAngle);
              const endAngle = ((index + 1) * sectorAngle);
              // ألوان أكثر سلاسة ودعم للوضع الداكن
              const hue = (index * 360) / products.length;
              const color1 = `hsl(${hue}, 60%, 65%)`;
              const color2 = `hsl(${hue}, 65%, 75%)`;
              return `${color1} ${startAngle}deg, ${color2} ${endAngle}deg`;
            }).join(', ')})`
          }}
        >
          {/* خطوط فاصلة بين القطاعات */}
          {products.map((_, index) => {
            const angle = index * sectorAngle;
            const radian = (angle * Math.PI) / 180;
            const x1 = Math.cos(radian - Math.PI/2) * 50 + 192;
            const y1 = Math.sin(radian - Math.PI/2) * 50 + 192;
            const x2 = Math.cos(radian - Math.PI/2) * 192 + 192;
            const y2 = Math.sin(radian - Math.PI/2) * 192 + 192;
            
            return (
              <div
                key={`line-${index}`}
                className="absolute w-0.5 bg-white/30 origin-bottom"
                style={{
                  left: x1,
                  top: y1,
                  height: Math.sqrt((x2-x1)**2 + (y2-y1)**2),
                  transform: `rotate(${angle + 90}deg)`,
                  transformOrigin: 'bottom'
                }}
              />
            );
          })}

          {/* أسماء المنتجات */}
          {products.map((product, index) => {
            const angle = (index * sectorAngle) + (sectorAngle / 2);
            const radian = (angle * Math.PI) / 180;
            
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
                {/* النص من المنتصف للطرف */}
                <div 
                  className="absolute flex items-center justify-start"
                  style={{
                    left: '60px', // بداية النص من بعد المركز
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '130px'
                  }}
                >
                  <p className="text-sm font-bold text-white drop-shadow-lg whitespace-nowrap overflow-hidden text-ellipsis">
                    {product.name.length > 12 ? product.name.substring(0, 12) + '...' : product.name}
                  </p>
                </div>
              </div>
            );
          })}
          
          {/* الدائرة المركزية */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-gradient-to-br from-background to-background/80 rounded-full border-4 border-primary shadow-xl flex items-center justify-center backdrop-blur-sm">
            <Play className="w-8 h-8 text-primary" />
          </div>
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
              تدوير العجلة
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
};

export default SpinWheel;