import React, { Suspense, lazy } from "react";
import { motion } from "framer-motion";
import { Disc3, MessageSquare, Instagram, Facebook } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { SocialLinks } from "@/types/store";

const FeedbackTrigger = lazy(() => import("../feedback/FeedbackTrigger"));

interface FloatingActionsBarProps {
  slug?: string;
  storeOwnerId?: string;
  colorTheme?: string | null;
  socialLinks?: SocialLinks;
}

const FloatingActionsBar: React.FC<FloatingActionsBarProps> = ({
  slug,
  storeOwnerId,
  colorTheme,
  socialLinks,
}) => {
  // الحصول على لون الثيم أو استخدام اللون الافتراضي
  const getThemeColor = () => {
    if (colorTheme?.startsWith('#')) {
      return colorTheme;
    }
    
    // ألوان افتراضية حسب الثيم
    const themeColors: { [key: string]: string } = {
      coral: 'rgb(251, 146, 60)',
      purple: 'rgb(168, 85, 247)',
      blue: 'rgb(59, 130, 246)',
      green: 'rgb(34, 197, 94)',
      red: 'rgb(239, 68, 68)',
    };
    
    return themeColors[colorTheme || ''] || 'rgb(59, 130, 246)'; // أزرق افتراضي
  };

  const themeColor = getThemeColor();

  return (
    <motion.div
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="fixed bottom-6 left-6 z-30"
      style={{ direction: 'ltr' }}
    >
      {/* الشريط الزجاجي العائم */}
      <div
        className="backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${themeColor}15, ${themeColor}25)`,
        }}
      >
        <div className="flex flex-col gap-2 p-3">
          {/* زر عجلة الحظ */}
          {slug && (
            <Link to={`/${slug}/wheel`}>
              <Button
                variant="ghost"
                size="icon"
                className="w-12 h-12 rounded-xl transition-all duration-300 hover:scale-110 relative group"
                style={{
                  background: `${themeColor}20`,
                  color: themeColor,
                }}
              >
                <motion.div
                  animate={{
                    rotate: [0, 10, -10, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatDelay: 3,
                  }}
                >
                  <Disc3 className="w-6 h-6" />
                </motion.div>
                
                {/* تأثير التوهج عند التمرير */}
                <div 
                  className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{
                    background: `radial-gradient(circle, ${themeColor}40 0%, transparent 70%)`,
                  }}
                />
              </Button>
            </Link>
          )}

          {/* زر مشاركة الرأي */}
          {storeOwnerId && (
            <Suspense fallback={null}>
              <Link to={`/feedback/${storeOwnerId}`}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-12 h-12 rounded-xl transition-all duration-300 hover:scale-110 relative group"
                  style={{
                    background: `${themeColor}20`,
                    color: themeColor,
                  }}
                >
                  <motion.div
                    animate={{
                      scale: [1, 1.1, 1],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatDelay: 3,
                    }}
                  >
                    <MessageSquare className="w-6 h-6" />
                  </motion.div>
                  
                  {/* تأثير التوهج عند التمرير */}
                  <div 
                    className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{
                      background: `radial-gradient(circle, ${themeColor}40 0%, transparent 70%)`,
                    }}
                  />
                </Button>
              </Link>
            </Suspense>
          )}

          {/* أيقونات التواصل الاجتماعي */}
          {socialLinks && (
            <>
              {socialLinks.instagram && (
                <a
                  href={socialLinks.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-12 h-12 rounded-xl transition-all duration-300 hover:scale-110 relative group"
                    style={{
                      background: `${themeColor}20`,
                      color: themeColor,
                    }}
                  >
                    <motion.div
                      animate={{
                        scale: [1, 1.05, 1],
                      }}
                      transition={{
                        duration: 2.5,
                        repeat: Infinity,
                        repeatDelay: 3,
                      }}
                    >
                      <Instagram className="w-6 h-6" />
                    </motion.div>
                    
                    <div 
                      className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      style={{
                        background: `radial-gradient(circle, ${themeColor}40 0%, transparent 70%)`,
                      }}
                    />
                  </Button>
                </a>
              )}

              {socialLinks.facebook && (
                <a
                  href={socialLinks.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-12 h-12 rounded-xl transition-all duration-300 hover:scale-110 relative group"
                    style={{
                      background: `${themeColor}20`,
                      color: themeColor,
                    }}
                  >
                    <motion.div
                      animate={{
                        scale: [1, 1.05, 1],
                      }}
                      transition={{
                        duration: 2.5,
                        repeat: Infinity,
                        repeatDelay: 3,
                      }}
                    >
                      <Facebook className="w-6 h-6" />
                    </motion.div>
                    
                    <div 
                      className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      style={{
                        background: `radial-gradient(circle, ${themeColor}40 0%, transparent 70%)`,
                      }}
                    />
                  </Button>
                </a>
              )}

              {socialLinks.telegram && (
                <a
                  href={socialLinks.telegram}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-12 h-12 rounded-xl transition-all duration-300 hover:scale-110 relative group"
                    style={{
                      background: `${themeColor}20`,
                      color: themeColor,
                    }}
                  >
                    <motion.div
                      animate={{
                        scale: [1, 1.05, 1],
                      }}
                      transition={{
                        duration: 2.5,
                        repeat: Infinity,
                        repeatDelay: 3,
                      }}
                    >
                      <MessageSquare className="w-6 h-6" />
                    </motion.div>
                    
                    <div 
                      className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      style={{
                        background: `radial-gradient(circle, ${themeColor}40 0%, transparent 70%)`,
                      }}
                    />
                  </Button>
                </a>
              )}
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default FloatingActionsBar;
