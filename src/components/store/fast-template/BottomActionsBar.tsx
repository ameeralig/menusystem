import React, { useState } from "react";
import { motion } from "framer-motion";
import { Disc3, MessageSquare, Search, X, Sparkles, Share2, Download, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SocialLinks, ContactInfo, FontSettings } from "@/types/store";
import StoreInfoSheet from "./StoreInfoSheet";
import AddProductModal from "./AddProductModal";
import CustomerAIAssistant from "./CustomerAIAssistant";
import WheelModal from "../WheelModal";
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
  const [isFeedbackDialogOpen, setIsFeedbackDialogOpen] = useState(false);
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

  // زر الإجراء المشترك
  const ActionButton = ({ 
    onClick, 
    icon: Icon, 
    label, 
    gradient 
  }: { 
    onClick: () => void; 
    icon: React.ElementType; 
    label: string; 
    gradient: string;
  }) => (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <div
        onClick={onClick}
        className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl shadow-md cursor-pointer transition-all"
        style={{
          background: gradient,
          border: '1px solid rgba(255,255,255,0.2)',
        }}
      >
        <Icon className="h-4 w-4 text-white" />
        <span className="text-[10px] font-medium text-white whitespace-nowrap">{label}</span>
      </div>
    </motion.div>
  );

  // الأزرار الرئيسية (تظهر دائماً)
  const primaryButtons = [
    // زر المفضلة - للزوار فقط
    !isStoreOwner && onOpenFavorites && {
      id: 'favorites',
      onClick: onOpenFavorites,
      icon: Heart,
      label: favoritesCount > 0 ? `${favoritesCount}` : 'مفضلة',
      gradient: `linear-gradient(135deg, #ef4444, #dc2626)`,
    },
    // زر شارك المنيو
    slug && {
      id: 'share',
      onClick: () => setIsShareCardOpen(true),
      icon: Share2,
      label: 'شارك',
      gradient: `linear-gradient(135deg, #f59e0b, #d97706)`,
    },
    // زر تحميل المنيو
    storeName && products.length > 0 && {
      id: 'download',
      onClick: () => setIsMenuDownloadOpen(true),
      icon: Download,
      label: 'تحميل',
      gradient: `linear-gradient(135deg, #10b981, #059669)`,
    },
    // زر عجلة الحظ
    storeOwnerId && products.length > 0 && {
      id: 'wheel',
      onClick: () => setIsWheelModalOpen(true),
      icon: Disc3,
      label: 'حظ',
      gradient: `linear-gradient(135deg, ${themeColor}, ${themeColor}dd)`,
    },
    // زر AI
    storeOwnerId && {
      id: 'ai',
      onClick: () => setIsAIAssistantOpen(true),
      icon: Sparkles,
      label: 'AI',
      gradient: `linear-gradient(135deg, #8b5cf6, #7c3aed)`,
    },
    // تقييم للزوار فقط
    storeOwnerId && !isStoreOwner && {
      id: 'feedback',
      onClick: () => setIsFeedbackDialogOpen(true),
      icon: MessageSquare,
      label: 'رأيك',
      gradient: `linear-gradient(135deg, #ec4899, #db2777)`,
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
        <div className="container mx-auto px-2 py-2">
          <div className="flex items-center gap-2 max-w-4xl mx-auto">
            
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
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div
                  onClick={() => setIsSearchExpanded(true)}
                  className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl shadow-md cursor-pointer transition-all"
                  style={{
                    background: `${themeColor}15`,
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}
                >
                  <Search className="h-4 w-4" style={{ color: themeColor }} />
                  <span className="text-[10px] font-medium whitespace-nowrap" style={{ color: themeColor }}>بحث</span>
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

            {/* الأزرار الرئيسية */}
            <div className="flex items-center gap-1.5">
              {primaryButtons.map((btn: any) => (
                <ActionButton
                  key={btn.id}
                  onClick={btn.onClick}
                  icon={btn.icon}
                  label={btn.label}
                  gradient={btn.gradient}
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

      {/* FeedbackDialog - للزوار */}
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
