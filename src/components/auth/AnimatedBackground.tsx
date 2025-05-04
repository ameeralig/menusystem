
import React, { useEffect, useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

// مكونات الطعام التي ستتحرك في الخلفية
const foodItems = [
  "🍔", "🍕", "🍣", "🍜", "🍱", "🍲", "🍝", "🥗", "🥘", "🌮", 
  "🥪", "🍦", "🧁", "☕", "🍹", "🥤"
];

export const AnimatedBackground: React.FC = () => {
  const [items, setItems] = useState<Array<{id: number; emoji: string; x: number; y: number; size: number; speed: number}>>([]);
  const isMobile = useIsMobile();
  
  useEffect(() => {
    // إنشاء العناصر المتحركة عند تحميل المكون
    const count = isMobile ? 8 : 15;
    const newItems = [];
    
    for (let i = 0; i < count; i++) {
      newItems.push({
        id: i,
        emoji: foodItems[Math.floor(Math.random() * foodItems.length)],
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * (isMobile ? 20 : 30) + 20, // حجم أصغر على الهواتف
        speed: Math.random() * 0.5 + 0.2 // سرعة عشوائية
      });
    }
    
    setItems(newItems);
    
    // تحريك العناصر
    const animateItems = () => {
      setItems(prevItems => 
        prevItems.map(item => ({
          ...item,
          y: (item.y + item.speed) % 100, // حركة للأسفل مع إعادة العنصر للأعلى
          x: item.x + (Math.sin(item.y / 10) * 0.3) // حركة متموجة بسيطة
        }))
      );
    };
    
    const animationInterval = setInterval(animateItems, 50);
    return () => clearInterval(animationInterval);
  }, [isMobile]);
  
  return (
    <div className="fixed top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
      {items.map(item => (
        <div 
          key={item.id}
          className="fixed transition-transform duration-300 opacity-10 dark:opacity-5"
          style={{
            left: `${item.x}%`,
            top: `${item.y}%`,
            fontSize: `${item.size}px`,
            transform: `translateY(-50%) translateX(-50%) rotate(${Math.sin(item.y / 10) * 20}deg)`,
            filter: "blur(1px)"
          }}
        >
          {item.emoji}
        </div>
      ))}
      
      {/* إضافة تأثير النيون المتوهج */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent"></div>
      <div className="absolute w-full h-full bg-[radial-gradient(circle_at_center,rgba(var(--primary)/0.08)_0,transparent_70%)]"></div>
    </div>
  );
};
