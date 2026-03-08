import React, { useState } from "react";
import { motion } from "framer-motion";
import { Gamepad2, MessageSquare, Search, X, Share2, Download, Heart, Info, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SocialLinks, ContactInfo, FontSettings } from "@/types/store";
import StoreInfoSheet from "./StoreInfoSheet";
import AddProductModal from "./AddProductModal";
import CustomerAIAssistant from "./CustomerAIAssistant";
import WheelModal from "../WheelModal";
import GamesMenuModal from "../games/GamesMenuModal";
import MemoryMatchGame from "../games/MemoryMatchGame";
import PriceGuessGame from "../games/PriceGuessGame";
import BillPayerGame from "../games/BillPayerGame";
import FeedbackDialog from "../feedback/FeedbackDialog";
import OwnerFeedbackSheet from "../feedback/OwnerFeedbackSheet";
import StoreOwnerActionsMenu from "./StoreOwnerActionsMenu";
import ShareMenuCard from "../share/ShareMenuCard";
import MenuDownloadDialog from "../menu-download/MenuDownloadDialog";
import { Product } from "@/types/product";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface BottomActionsBarProps {
  slug?: string;
  storeOwnerId?: string;
  colorTheme?: string | null;
  socialLinks?: SocialLinks;
  contactInfo?: ContactInfo;
  searchQuery: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClearSearch: () => void;
  isStoreOwner?: boolean;
  storeName?: string;
  fontSettings?: FontSettings;
  products?: Product[];
  externalOrdersEnabled?: boolean;
  deliveryFee?: number;
  logoUrl?: string | null;
  favoritesCount?: number;
  onOpenFavorites?: () => void;
}

const BottomActionsBar: React.FC<BottomActionsBarProps> = ({
  slug,
  storeOwnerId,
  colorTheme,
  socialLinks,
  contactInfo,
  searchQuery,
  onSearchChange,
  onClearSearch,
  isStoreOwner = false,
  storeName,
  fontSettings,
  products = [],
  externalOrdersEnabled = false,
  deliveryFee = 0,
  logoUrl,
  favoritesCount = 0,
  onOpenFavorites,
}) => {
  const [isInfoSheetOpen, setIsInfoSheetOpen] = useState(false);
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false);
  const [isWheelModalOpen, setIsWheelModalOpen] = useState(false);
  const [isGamesMenuOpen, setIsGamesMenuOpen] = useState(false);
  const [isMemoryGameOpen, setIsMemoryGameOpen] = useState(false);
  const [isPriceGameOpen, setIsPriceGameOpen] = useState(false);
  const [isFeedbackDialogOpen, setIsFeedbackDialogOpen] = useState(false);
  const [isBillPayerOpen, setIsBillPayerOpen] = useState(false);
  const [isOwnerFeedbackOpen, setIsOwnerFeedbackOpen] = useState(false);
  const [isShareCardOpen, setIsShareCardOpen] = useState(false);
  const [isMenuDownloadOpen, setIsMenuDownloadOpen] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);

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

  // زر الإجراء المشترك - أيقونة فقط أو مع نص
  const ActionButton = ({ 
    onClick, 
    icon: Icon, 
    label, 
    gradient,
    showLabel = false,
    badge
  }: { 
    onClick: () => void; 
    icon: React.ElementType; 
    label: string; 
    gradient: string;
    showLabel?: boolean;
    badge?: number;
  }) => (
    <motion.div
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.92 }}
    >
      <div
        onClick={onClick}
        className="relative flex items-center justify-center w-10 h-10 rounded-xl shadow-md cursor-pointer transition-all"
        style={{
          background: gradient,
          border: '1px solid rgba(255,255,255,0.2)',
        }}
        title={label}
      >
        <Icon className="h-5 w-5 text-white" />
        {badge && badge > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center text-[10px] font-bold bg-white text-red-500 rounded-full shadow-md">
            {badge}
          </span>
        )}
        {showLabel && (
          <span className="text-[9px] font-medium text-white absolute -bottom-4 whitespace-nowrap">{label}</span>
        )}
      </div>
    </motion.div>
  );

  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);

  // عناصر قائمة المزيد (المعلومات، المشاركة، التحميل)
  const moreMenuItems = [
    // زر المعلومات - يظهر للزوار فقط إذا كانت هناك معلومات
    !isStoreOwner && contactInfo && {
      id: 'info',
      onClick: () => { setIsInfoSheetOpen(true); setIsMoreMenuOpen(false); },
      icon: Info,
      label: 'معلومات المتجر',
      color: '#3b82f6',
    },
    // زر شارك المنيو
    slug && {
      id: 'share',
      onClick: () => { setIsShareCardOpen(true); setIsMoreMenuOpen(false); },
      icon: Share2,
      label: 'مشاركة المنيو',
      color: '#f59e0b',
    },
    // زر تحميل المنيو
    storeName && products.length > 0 && {
      id: 'download',
      onClick: () => { setIsMenuDownloadOpen(true); setIsMoreMenuOpen(false); },
      icon: Download,
      label: 'تحميل المنيو',
      color: '#10b981',
    },
  ].filter(Boolean);

  // الأزرار الرئيسية (تظهر دائماً)
  const primaryButtons = [
    // زر المفضلة - للزوار فقط
    !isStoreOwner && onOpenFavorites && {
      id: 'favorites',
      onClick: onOpenFavorites,
      icon: Heart,
      label: 'مفضلة',
      gradient: `linear-gradient(135deg, #ef4444, #dc2626)`,
      showLabel: false,
      badge: favoritesCount > 0 ? favoritesCount : undefined,
    },
    // زر الألعاب (يجمع عجلة الحظ + طابق واربح)
    storeOwnerId && products.length > 0 && {
      id: 'games',
      onClick: () => setIsGamesMenuOpen(true),
      icon: Gamepad2,
      label: 'ألعاب',
      gradient: `linear-gradient(135deg, #f59e0b, #d97706)`,
      showLabel: false,
    },
    // زر AI
    storeOwnerId && {
      id: 'ai',
      onClick: () => setIsAIAssistantOpen(true),
      icon: () => (
        <span className="text-xs font-bold text-white">AI</span>
      ),
      label: 'AI',
      gradient: `linear-gradient(135deg, #8b5cf6, #7c3aed)`,
      showLabel: false,
    },
    // تقييم للزوار فقط
    storeOwnerId && !isStoreOwner && {
      id: 'feedback',
      onClick: () => setIsFeedbackDialogOpen(true),
      icon: MessageSquare,
      label: 'رأيك',
      gradient: `linear-gradient(135deg, #ec4899, #db2777)`,
      showLabel: false,
    },
  ].filter(Boolean);

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
      {/* الشريط الزجاجي */}
      <div
        className="backdrop-blur-xl border-t shadow-2xl"
        style={{
          background: `linear-gradient(180deg, ${themeColor}08, ${themeColor}12)`,
          borderColor: `${themeColor}25`,
        }}
      >
        <div className="container mx-auto px-4 sm:px-6 py-2.5">
          <div className="flex items-center justify-center gap-3 sm:gap-4 max-w-lg mx-auto">
            
            {/* زر/حقل البحث */}
            {isSearchExpanded ? (
              <motion.div 
                initial={{ width: 40, opacity: 0 }}
                animate={{ width: "100%", opacity: 1 }}
                exit={{ width: 40, opacity: 0 }}
                className="flex-1 relative min-w-0"
              >
                <Search className="absolute right-2.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none z-10" />
                <Input
                  type="text"
                  placeholder="ابحث..."
                  value={searchQuery}
                  onChange={onSearchChange}
                  autoFocus
                  className="pr-8 pl-8 h-10 rounded-xl border-0 text-sm"
                  style={{
                    background: `${themeColor}10`,
                    backdropFilter: 'blur(10px)',
                  }}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    onClearSearch();
                    setIsSearchExpanded(false);
                  }}
                  className="absolute left-1 top-1/2 transform -translate-y-1/2 h-7 w-7 z-10"
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </motion.div>
            ) : (
              <motion.div
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
              >
                <div
                  onClick={() => setIsSearchExpanded(true)}
                  className="flex items-center justify-center w-10 h-10 rounded-xl shadow-md cursor-pointer transition-all"
                  style={{
                    background: `${themeColor}20`,
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}
                  title="بحث"
                >
                  <Search className="h-5 w-5" style={{ color: themeColor }} />
                </div>
              </motion.div>
            )}

            {/* قائمة إدارة المتجر - للمالك فقط */}
            {isStoreOwner && storeOwnerId && (
              <StoreOwnerActionsMenu
                storeOwnerId={storeOwnerId}
                colorTheme={colorTheme}
                onAddProduct={() => setIsAddProductModalOpen(true)}
                onUpdate={() => window.location.reload()}
                onOpenInfo={() => setIsInfoSheetOpen(true)}
                onOpenFeedback={() => setIsOwnerFeedbackOpen(true)}
                hasContactInfo={!!contactInfo}
              />
            )}

            {/* زر المزيد - أول زر على اليمين */}
            {moreMenuItems.length > 0 && (
              <Popover open={isMoreMenuOpen} onOpenChange={setIsMoreMenuOpen}>
                <PopoverTrigger asChild>
                  <motion.div
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.92 }}
                  >
                    <div
                      className="flex items-center justify-center w-10 h-10 rounded-xl shadow-md cursor-pointer transition-all"
                      style={{
                        background: `linear-gradient(135deg, ${themeColor}, ${themeColor}cc)`,
                        border: '1px solid rgba(255,255,255,0.2)',
                      }}
                      title="المزيد"
                    >
                      <MoreHorizontal className="h-5 w-5 text-white" />
                    </div>
                  </motion.div>
                </PopoverTrigger>
                <PopoverContent 
                  className="w-48 p-2 border shadow-xl bg-white dark:bg-gray-800"
                  style={{
                    borderColor: `${themeColor}30`,
                  }}
                  align="end"
                  side="top"
                  sideOffset={8}
                >
                  <div className="flex flex-col gap-1">
                    {moreMenuItems.map((item: any) => (
                      <button
                        key={item.id}
                        onClick={item.onClick}
                        className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-colors hover:bg-muted text-foreground"
                      >
                        <item.icon className="h-4 w-4" style={{ color: item.color }} />
                        <span>{item.label}</span>
                      </button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            )}

            {/* الأزرار الرئيسية */}
            <div className="flex items-center gap-3 sm:gap-4">
              {primaryButtons.map((btn: any) => (
                <ActionButton
                  key={btn.id}
                  onClick={btn.onClick}
                  icon={btn.icon}
                  label={btn.label}
                  gradient={btn.gradient}
                  showLabel={btn.showLabel}
                  badge={btn.badge}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* StoreInfoSheet */}
      <StoreInfoSheet
        isOpen={isInfoSheetOpen}
        onOpenChange={setIsInfoSheetOpen}
        contactInfo={contactInfo}
        colorTheme={colorTheme}
        socialLinks={socialLinks}
        storeName={storeName}
        products={products}
        isStoreOwner={isStoreOwner}
        storeOwnerId={storeOwnerId}
      />

      {/* AddProductModal */}
      <AddProductModal
        isOpen={isAddProductModalOpen}
        onOpenChange={setIsAddProductModalOpen}
        colorTheme={colorTheme}
        onProductAdded={() => {
          window.location.reload();
        }}
      />

      {/* CustomerAIAssistant */}
      {storeOwnerId && (
        <CustomerAIAssistant
          isOpen={isAIAssistantOpen}
          onOpenChange={setIsAIAssistantOpen}
          storeOwnerId={storeOwnerId}
          products={products}
          externalOrdersEnabled={externalOrdersEnabled}
          deliveryFee={deliveryFee}
          storePhone={contactInfo?.phone}
          storeName={storeName}
          isStoreOwner={isStoreOwner}
        />
      )}

      {/* WheelModal */}
      {storeOwnerId && (
        <WheelModal
          isOpen={isWheelModalOpen}
          onClose={() => setIsWheelModalOpen(false)}
          products={products}
          colorTheme={colorTheme || undefined}
          isStoreOwner={isStoreOwner}
        />
      )}

      {/* GamesMenuModal */}
      <GamesMenuModal
        isOpen={isGamesMenuOpen}
        onClose={() => setIsGamesMenuOpen(false)}
        onSelectGame={(gameId) => {
          if (gameId === "wheel") setIsWheelModalOpen(true);
          if (gameId === "memory") setIsMemoryGameOpen(true);
          if (gameId === "price") setIsPriceGameOpen(true);
          if (gameId === "billpayer") setIsBillPayerOpen(true);
        }}
        colorTheme={colorTheme}
      />

      {/* MemoryMatchGame */}
      <MemoryMatchGame
        isOpen={isMemoryGameOpen}
        onClose={() => setIsMemoryGameOpen(false)}
        products={products}
        colorTheme={colorTheme || undefined}
      />

      {/* PriceGuessGame */}
      <PriceGuessGame
        isOpen={isPriceGameOpen}
        onClose={() => setIsPriceGameOpen(false)}
        products={products}
        colorTheme={colorTheme || undefined}
      />

      {/* BillPayerGame */}
      <BillPayerGame
        isOpen={isBillPayerOpen}
        onClose={() => setIsBillPayerOpen(false)}
        colorTheme={colorTheme || undefined}
      />

      {storeOwnerId && !isStoreOwner && (
        <FeedbackDialog
          isOpen={isFeedbackDialogOpen}
          onClose={() => setIsFeedbackDialogOpen(false)}
          storeOwnerId={storeOwnerId}
          colorTheme={colorTheme || undefined}
        />
      )}

      {/* OwnerFeedbackSheet - لصاحب المتجر */}
      {storeOwnerId && isStoreOwner && (
        <OwnerFeedbackSheet
          isOpen={isOwnerFeedbackOpen}
          onOpenChange={setIsOwnerFeedbackOpen}
          storeOwnerId={storeOwnerId}
          colorTheme={colorTheme || undefined}
        />
      )}

      {/* ShareMenuCard - بطاقة مشاركة المنيو */}
      <ShareMenuCard
        isOpen={isShareCardOpen}
        onClose={() => setIsShareCardOpen(false)}
        storeName={storeName}
        slug={slug}
        colorTheme={colorTheme}
        logoUrl={logoUrl}
        productsCount={products.length}
      />

      {/* MenuDownloadDialog - نافذة تحميل المنيو */}
      {storeName && (
        <MenuDownloadDialog
          isOpen={isMenuDownloadOpen}
          onClose={() => setIsMenuDownloadOpen(false)}
          storeName={storeName}
          products={products}
          colorTheme={colorTheme}
        />
      )}
    </motion.div>
  );
};

export default BottomActionsBar;
