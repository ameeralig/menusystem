import React, { useState, useRef } from 'react';
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
    
    // حساب الدوران العشوائي (5-10 دورات كاملة + زاوية عشوائية)
    const spins = Math.floor(Math.random() * 6) + 5; // 5-10 دورات
    const finalAngle = Math.random() * 360;
    const totalRotation = rotation + (spins * 360) + finalAngle;
    
    setRotation(totalRotation);
    
    // تحديد المنتج الفائز بعد انتهاء الدوران
    setTimeout(() => {
      const normalizedAngle = totalRotation % 360;
      const winnerIndex = Math.floor(normalizedAngle / sectorAngle);
      const winner = products[winnerIndex];
      
      setResult(winner);
      setIsSpinning(false);
      onResult?.(winner);
      
      toast.success(`🎉 النتيجة: ${winner.name}!`);
    }, 3000);
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
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2 z-10">
          <div className="w-0 h-0 border-l-4 border-r-4 border-b-8 border-l-transparent border-r-transparent border-b-primary"></div>
        </div>
        
        {/* العجلة الدوارة */}
        <motion.div
          ref={wheelRef}
          className="relative w-80 h-80 rounded-full border-4 border-primary shadow-2xl overflow-hidden"
          animate={{ rotate: rotation }}
          transition={{ 
            duration: isSpinning ? 3 : 0,
            ease: isSpinning ? "easeOut" : "linear"
          }}
          style={{
            background: `conic-gradient(${products.map((_, index) => {
              const startAngle = (index * sectorAngle);
              const endAngle = ((index + 1) * sectorAngle);
              const color1 = `hsl(${(index * 360) / products.length}, 70%, 60%)`;
              const color2 = `hsl(${(index * 360) / products.length}, 70%, 70%)`;
              return `${color1} ${startAngle}deg ${endAngle}deg`;
            }).join(', ')})`
          }}
        >
          {/* النصوص والصور */}
          {products.map((product, index) => {
            const angle = (index * sectorAngle) + (sectorAngle / 2);
            const radian = (angle * Math.PI) / 180;
            const x = Math.cos(radian - Math.PI/2) * 100 + 160;
            const y = Math.sin(radian - Math.PI/2) * 100 + 160;
            
            return (
              <div
                key={product.id}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 text-center"
                style={{
                  left: x,
                  top: y,
                  transform: `translate(-50%, -50%) rotate(${angle}deg)`,
                  width: '60px',
                }}
              >
                {/* صورة المنتج */}
                {product.image_url && (
                  <div className="w-8 h-8 mx-auto mb-1 rounded-full overflow-hidden border-2 border-white shadow-sm">
                    <img 
                      src={product.image_url} 
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                
                {/* اسم المنتج */}
                <p 
                  className="text-[10px] font-bold text-white drop-shadow-md leading-tight"
                  style={{ transform: `rotate(${-angle}deg)` }}
                >
                  {product.name.length > 8 ? product.name.substring(0, 8) + '...' : product.name}
                </p>
              </div>
            );
          })}
          
          {/* الدائرة المركزية */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-background rounded-full border-4 border-primary shadow-lg flex items-center justify-center">
            <Play className="w-6 h-6 text-primary" />
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