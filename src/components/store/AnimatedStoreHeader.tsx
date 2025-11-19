import { CSSProperties, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface FontSettings {
  storeName?: {
    family: string;
    isCustom: boolean;
    customFontUrl: string | null;
  };
}

interface AnimatedStoreHeaderProps {
  storeName: string | null;
  colorTheme: string | null;
  fontSettings?: FontSettings;
}

const AnimatedStoreHeader = ({ storeName, colorTheme, fontSettings }: AnimatedStoreHeaderProps) => {
  const [fontFaceLoaded, setFontFaceLoaded] = useState(false);
  const [fontId, setFontId] = useState<string>("");
  const [isAnimating, setIsAnimating] = useState(true);
  
  useEffect(() => {
    if (fontSettings?.storeName?.isCustom && fontSettings?.storeName?.customFontUrl) {
      const uniqueId = `store-name-font-${Math.random().toString(36).substring(2, 9)}`;
      setFontId(uniqueId);
      
      // إضافة preload للخط
      const preloadLink = document.createElement('link');
      preloadLink.rel = 'preload';
      preloadLink.as = 'font';
      preloadLink.href = fontSettings.storeName.customFontUrl;
      preloadLink.crossOrigin = 'anonymous';
      preloadLink.id = `preload-${uniqueId}`;
      document.head.appendChild(preloadLink);
      
      const fontFace = new FontFace(
        uniqueId, 
        `url(${fontSettings.storeName.customFontUrl})`,
        { display: 'swap' }
      );
      
      fontFace.load().then((loadedFontFace) => {
        document.fonts.add(loadedFontFace);
        setFontFaceLoaded(true);
      }).catch(err => {
        console.error("Error loading custom font:", err);
      });
      
      return () => {
        const styleElement = document.getElementById(`style-${uniqueId}`);
        if (styleElement) {
          styleElement.remove();
        }
        const preloadElement = document.getElementById(`preload-${uniqueId}`);
        if (preloadElement) {
          preloadElement.remove();
        }
      };
    }
  }, [fontSettings?.storeName?.customFontUrl, fontSettings?.storeName?.isCustom]);

  // إعادة تشغيل الانيميشن عند تغيير اسم المتجر
  useEffect(() => {
    setIsAnimating(true);
    const timer = setTimeout(() => {
      setIsAnimating(false);
    }, 100);
    return () => clearTimeout(timer);
  }, [storeName]);
  
  const getThemeColor = (theme: string | null) => {
    if (theme && theme.startsWith('#')) {
      return theme;
    }
    
    switch (theme) {
      case 'coral':
        return '#ff9178';
      case 'purple':
        return '#8b5cf6';
      case 'blue':
        return '#3b82f6';
      case 'green':
        return '#10b981';
      case 'pink':
        return '#ec4899';
      case 'teal':
        return '#14b8a6';
      case 'amber':
        return '#f59e0b';
      case 'indigo':
        return '#6366f1';
      case 'rose':
        return '#f43f5e';
      default:
        return '#1f2937';
    }
  };

  const getStoreNameStyle = (): CSSProperties => {
    let style: CSSProperties = {
      fontSizeAdjust: '0.5',
    };
    
    if (fontSettings?.storeName?.isCustom && fontId) {
      style.fontFamily = fontFaceLoaded 
        ? `"${fontId}", "Arial", sans-serif`
        : `"Arial", sans-serif`;
    }
    
    return style;
  };

  const themeColor = getThemeColor(colorTheme);

  // تقسيم اسم المتجر إلى حروف
  const letters = storeName ? storeName.split('') : [];

  // انيميشن سقوط الحروف - محسّن لمنع Layout Shifts
  const letterVariants = {
    initial: {
      y: 0,
      opacity: 0,
      scale: 0.8,
    },
    animate: (i: number) => ({
      y: 0,
      opacity: 1,
      scale: 1,
      transition: {
        delay: i * 0.05,
        duration: 0.4,
        ease: "easeOut",
      }
    }),
    bounce: {
      y: [0, -5, 0],
      transition: {
        duration: 0.3,
        delay: 0.1,
      }
    }
  };

  // انيميشن الشرارات
  const sparkleVariants = {
    initial: { scale: 0, rotate: 0 },
    animate: {
      scale: [0, 1.2, 0.8, 1, 0],
      rotate: [0, 180, 360],
      transition: {
        duration: 1,
        ease: "easeOut"
      }
    }
  };

  // انيميشن الوهج
  const glowVariants = {
    initial: { opacity: 0, scale: 0.5 },
    animate: {
      opacity: [0, 0.8, 0.4, 0],
      scale: [0.5, 1.5, 2],
      transition: {
        duration: 1.2,
        ease: "easeOut"
      }
    }
  };

  if (!storeName) return null;

  return (
    <div 
      className="relative mb-3"
      style={{
        minHeight: '2.5rem',
        contain: 'layout',
      }}
    >
      <AnimatePresence mode="wait">
        <motion.h1 
          key={storeName}
          className="text-xl md:text-2xl font-bold text-center relative z-10"
          style={{
            ...getStoreNameStyle(), 
            direction: 'rtl', 
            unicodeBidi: 'embed',
            minHeight: '2.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            willChange: 'opacity, transform',
          }}
          initial="initial"
          animate="animate"
        >
          {letters.map((letter, index) => (
            <span key={`${letter}-${index}`} className="relative inline-block">
              <motion.span
                custom={index}
                variants={letterVariants}
                initial="initial"
                animate={["animate", "bounce"]}
                style={{ 
                  color: themeColor,
                  display: 'inline-block',
                  textShadow: `0 0 20px ${themeColor}40, 0 0 40px ${themeColor}20`,
                }}
                className="relative z-20"
              >
                {letter === ' ' ? '\u00A0' : letter}
              </motion.span>
              
              {/* الشرارات */}
              <motion.div
                variants={sparkleVariants}
                initial="initial"
                animate="animate"
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  pointerEvents: 'none',
                }}
                className="z-10"
              >
                <div 
                  style={{ 
                    width: '4px', 
                    height: '4px', 
                    backgroundColor: themeColor,
                    borderRadius: '50%',
                    boxShadow: `0 0 10px ${themeColor}, 0 0 20px ${themeColor}, 0 0 30px ${themeColor}`,
                  }} 
                />
              </motion.div>
              
              {/* الوهج الخلفي */}
              <motion.div
                variants={glowVariants}
                initial="initial"
                animate="animate"
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '60px',
                  height: '60px',
                  background: `radial-gradient(circle, ${themeColor}30 0%, transparent 70%)`,
                  borderRadius: '50%',
                  pointerEvents: 'none',
                }}
                className="z-0"
              />
            </span>
          ))}
          
          {/* تأثير الضوء العام */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ 
              opacity: [0, 0.3, 0.1, 0],
              scale: [0.8, 1.2, 1.5, 2],
            }}
            transition={{ 
              duration: 2,
              delay: letters.length * 0.1 + 0.5,
              ease: "easeOut"
            }}
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '200px',
              height: '200px',
              background: `radial-gradient(circle, ${themeColor}20 0%, ${themeColor}10 30%, transparent 70%)`,
              borderRadius: '50%',
              pointerEvents: 'none',
            }}
            className="z-0"
          />
        </motion.h1>
      </AnimatePresence>
      
      {/* جزيئات متحركة في الخلفية */}
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ 
            x: Math.random() * 400 - 200,
            y: Math.random() * 200 - 100,
            opacity: 0 
          }}
          animate={{ 
            x: Math.random() * 400 - 200,
            y: Math.random() * 200 - 100,
            opacity: [0, 0.6, 0],
          }}
          transition={{
            delay: Math.random() * 2 + letters.length * 0.1,
            duration: 1.5 + Math.random(),
            ease: "easeOut"
          }}
          style={{
            position: 'absolute',
            width: '2px',
            height: '2px',
            backgroundColor: themeColor,
            borderRadius: '50%',
            boxShadow: `0 0 6px ${themeColor}`,
          }}
        />
      ))}
    </div>
  );
};

export default AnimatedStoreHeader;