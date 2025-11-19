import React from "react";
import { motion } from "framer-motion";
import { Disc3, MessageSquare, Search, Instagram, Facebook, Send, X } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SocialLinks } from "@/types/store";
import { useNavigate } from "react-router-dom";

interface BottomActionsBarProps {
  slug?: string;
  storeOwnerId?: string;
  colorTheme?: string | null;
  socialLinks?: SocialLinks;
  searchQuery: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClearSearch: () => void;
}

const BottomActionsBar: React.FC<BottomActionsBarProps> = ({
  slug,
  storeOwnerId,
  colorTheme,
  socialLinks,
  searchQuery,
  onSearchChange,
  onClearSearch,
}) => {
  const navigate = useNavigate();

  const getThemeColor = () => {
    if (colorTheme?.startsWith('#')) {
      return colorTheme;
    }
    
    const themeColors: { [key: string]: string } = {
      coral: 'rgb(251, 146, 60)',
      purple: 'rgb(168, 85, 247)',
      blue: 'rgb(59, 130, 246)',
      green: 'rgb(34, 197, 94)',
      red: 'rgb(239, 68, 68)',
    };
    
    return themeColors[colorTheme || ''] || 'rgb(59, 130, 246)';
  };

  const themeColor = getThemeColor();

  const normalizeUrl = (provider: "instagram" | "facebook" | "telegram", value?: string) => {
    if (!value) return undefined;
    const v = value.trim();
    if (/^https?:\/\//i.test(v)) return v;

    if (provider === "instagram") {
      const handle = v.startsWith("@") ? v.slice(1) : v.replace(/^instagram\.com\//i, "");
      return `https://instagram.com/${handle}`;
    }

    if (provider === "facebook") {
      const path = v.replace(/^facebook\.com\//i, "").replace(/^fb\.com\//i, "");
      return `https://facebook.com/${path}`;
    }

    const handle = v.startsWith("@") ? v.slice(1) : v.replace(/^t\.me\//i, "");
    return `https://t.me/${handle}`;
  };

  const instagramUrl = normalizeUrl("instagram", socialLinks?.instagram);
  const facebookUrl = normalizeUrl("facebook", socialLinks?.facebook);
  const telegramUrl = normalizeUrl("telegram", socialLinks?.telegram);

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ 
        type: "spring",
        stiffness: 260,
        damping: 20,
        delay: 0.2 
      }}
      className="fixed bottom-0 left-0 right-0 z-40 pb-safe"
      style={{ direction: 'ltr' }}
    >
      {/* الشريط الزجاجي الأفقي */}
      <div
        className="backdrop-blur-xl border-t shadow-2xl"
        style={{
          background: `linear-gradient(180deg, ${themeColor}08, ${themeColor}15)`,
          borderColor: `${themeColor}30`,
        }}
      >
        <div className="container mx-auto px-3 py-3">
          <div className="flex items-center gap-3 max-w-4xl mx-auto">
            {/* حقل البحث - يأخذ المساحة المتبقية */}
            <div className="flex-1 relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none z-10" />
              <Input
                type="text"
                placeholder="ابحث هنا..."
                value={searchQuery}
                onChange={onSearchChange}
                className="pr-10 pl-10 h-12 rounded-2xl border-0 text-sm"
                style={{
                  background: `${themeColor}10`,
                  backdropFilter: 'blur(10px)',
                }}
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClearSearch}
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 h-8 w-8 z-10"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* الأزرار */}
            <div className="flex items-center gap-2">
              {/* زر عجلة الحظ */}
              {slug && (
                <Link to={`/store/${slug}/wheel`}>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-12 h-12 rounded-2xl transition-all duration-300 relative group"
                      style={{
                        background: `${themeColor}15`,
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
                        <Disc3 className="w-5 h-5" />
                      </motion.div>
                      
                      <div 
                        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        style={{
                          background: `radial-gradient(circle, ${themeColor}30 0%, transparent 70%)`,
                        }}
                      />
                    </Button>
                  </motion.div>
                </Link>
              )}

              {/* زر الملاحظات */}
              {storeOwnerId && (
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    onClick={() => navigate(`/customer-feedback/${storeOwnerId}`)}
                    variant="ghost"
                    size="icon"
                    className="w-12 h-12 rounded-2xl transition-all duration-300 relative group"
                    style={{
                      background: `${themeColor}15`,
                      color: themeColor,
                    }}
                  >
                    <MessageSquare className="w-5 h-5" />
                    
                    <div 
                      className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      style={{
                        background: `radial-gradient(circle, ${themeColor}30 0%, transparent 70%)`,
                      }}
                    />
                  </Button>
                </motion.div>
              )}

              {/* أيقونات السوشيال ميديا */}
              {(instagramUrl || facebookUrl || telegramUrl) && (
                <>
                  <div className="w-px h-10 bg-border/50" />
                  
                  {instagramUrl && (
                    <motion.a
                      href={instagramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-12 h-12 rounded-2xl"
                        style={{ color: themeColor }}
                      >
                        <Instagram className="w-5 h-5" />
                      </Button>
                    </motion.a>
                  )}
                  
                  {facebookUrl && (
                    <motion.a
                      href={facebookUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-12 h-12 rounded-2xl"
                        style={{ color: themeColor }}
                      >
                        <Facebook className="w-5 h-5" />
                      </Button>
                    </motion.a>
                  )}
                  
                  {telegramUrl && (
                    <motion.a
                      href={telegramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-12 h-12 rounded-2xl"
                        style={{ color: themeColor }}
                      >
                        <Send className="w-5 h-5" />
                      </Button>
                    </motion.a>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default BottomActionsBar;
