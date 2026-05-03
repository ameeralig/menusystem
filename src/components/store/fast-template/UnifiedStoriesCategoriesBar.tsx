import React, { useState, useEffect, useCallback } from "react";
import { Product } from "@/types/product";
import { CategoryImage } from "@/types/categoryImage";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, LayoutGrid, Settings2 } from "lucide-react";
import CategoryTabs from "./CategoryTabs";
import StoryCircle from "../stories/StoryCircle";
import StoryViewer from "../stories/StoryViewer";
import StoriesManagerSheet from "../stories/StoriesManagerSheet";
import { useStoriesData, StoryItem } from "@/hooks/store/useStoriesData";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Props {
  categories: string[];
  selectedCategory: string | null;
  onCategorySelect: (category: string | null) => void;
  colorTheme?: string | null;
  categoryImages?: CategoryImage[];
  isStoreOwner?: boolean;
  storeOwnerId?: string;
  refreshData?: () => void;
  // stories
  products: Product[];
  storiesEnabled: boolean;
  storiesAutoGenerate: boolean;
  onAddToCart?: (product: Product) => void;
  onToggleFavorite?: (productId: string, productName?: string) => void;
  onShare?: (product: Product) => void;
  isFavorite?: (productId: string) => boolean;
  showAddButton?: boolean;
}

type Tab = "categories" | "stories";

const PREF_KEY = "qrmenuc_default_tab";

const UnifiedStoriesCategoriesBar: React.FC<Props> = ({
  categories, selectedCategory, onCategorySelect, colorTheme, categoryImages,
  isStoreOwner, storeOwnerId, refreshData, products, storiesEnabled, storiesAutoGenerate,
  onAddToCart, onToggleFavorite, onShare, isFavorite, showAddButton,
}) => {
  const [activeTab, setActiveTab] = useState<Tab>(() => {
    try {
      return (localStorage.getItem(PREF_KEY) as Tab) || "categories";
    } catch {
      return "categories";
    }
  });
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);
  const [managerOpen, setManagerOpen] = useState(false);
  const [viewedIds, setViewedIds] = useState<Set<string>>(() => {
    try {
      const saved = sessionStorage.getItem(`stories_viewed_${storeOwnerId || "x"}`);
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });

  const { stories } = useStoriesData({
    storeOwnerId,
    enabled: storiesEnabled,
    autoGenerate: storiesAutoGenerate,
    products,
    categoryImages,
  });

  // إذا الستوريز معطلة، اختر تصنيفات قسرياً
  useEffect(() => {
    if (!storiesEnabled && stories.length === 0 && activeTab === "stories") {
      setActiveTab("categories");
    }
  }, [storiesEnabled, stories.length, activeTab]);

  const handleTabChange = (t: Tab) => {
    setActiveTab(t);
    try { localStorage.setItem(PREF_KEY, t); } catch {}
  };

  const handleSettingsChange = async (s: { stories_enabled?: boolean; stories_auto_generate?: boolean }) => {
    if (!storeOwnerId) return;
    const { error } = await supabase.from("store_settings").update(s).eq("user_id", storeOwnerId);
    if (error) toast.error("فشل الحفظ");
    else {
      toast.success("تم الحفظ");
      refreshData?.();
    }
  };

  const handleOpenStory = useCallback((idx: number) => {
    setViewerIndex(idx);
    setViewerOpen(true);
  }, []);

  const handleViewed = useCallback((id: string) => {
    setViewedIds((prev) => {
      const n = new Set(prev);
      n.add(id);
      try { sessionStorage.setItem(`stories_viewed_${storeOwnerId || "x"}`, JSON.stringify([...n])); } catch {}
      return n;
    });
  }, [storeOwnerId]);

  // المنتجات لتمريرها للعارض (تحويل التصنيفات إلى منتج وهمي)
  const viewerProducts: Product[] = stories.map((s) => {
    if (s.product) return s.product;
    return {
      id: s.id,
      name: s.title || "",
      description: s.caption || "",
      price: 0,
      image_url: s.image_url,
      category: s.type === "category" ? s.title || "" : "",
      is_available: true,
      user_id: storeOwnerId || "",
      created_at: "",
    } as Product;
  });

  const showStoriesTab = storiesEnabled && (stories.length > 0 || isStoreOwner);
  const themeColor = colorTheme?.startsWith("#") ? colorTheme : "hsl(var(--primary))";

  return (
    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-100 dark:border-gray-700/50 sticky top-0 z-30">
      {/* Segmented Control */}
      {showStoriesTab && (
        <div className="flex items-center justify-between px-3 pt-2.5 pb-1 gap-2">
          <div className="relative flex bg-gray-100 dark:bg-gray-900/60 rounded-full p-0.5 flex-1 max-w-[260px]">
            <motion.div
              layout
              transition={{ type: "spring", stiffness: 400, damping: 32 }}
              className="absolute inset-y-0.5 w-[calc(50%-2px)] rounded-full bg-white dark:bg-gray-700 shadow-sm"
              style={{
                left: activeTab === "categories" ? 2 : "calc(50% + 0px)",
              }}
            />
            <button
              onClick={() => handleTabChange("categories")}
              className={`relative z-10 flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded-full transition-colors ${
                activeTab === "categories" ? "text-gray-900 dark:text-white" : "text-gray-500"
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              التصنيفات
            </button>
            <button
              onClick={() => handleTabChange("stories")}
              className={`relative z-10 flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded-full transition-colors ${
                activeTab === "stories" ? "text-gray-900 dark:text-white" : "text-gray-500"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              ستوريز
              {stories.filter((s) => !viewedIds.has(s.id)).length > 0 && (
                <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
              )}
            </button>
          </div>

          {isStoreOwner && (
            <button
              onClick={() => setManagerOpen(true)}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition"
              title="إدارة الستوريز"
            >
              <Settings2 className="w-4 h-4 text-gray-600 dark:text-gray-300" />
            </button>
          )}
        </div>
      )}

      {/* Content */}
      <div className="relative">
        <AnimatePresence mode="wait" initial={false}>
          {activeTab === "stories" && showStoriesTab ? (
            <motion.div
              key="stories"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {stories.length === 0 ? (
                <div className="px-3 py-4 text-center text-xs text-muted-foreground">
                  لا توجد ستوريز حالياً
                  {isStoreOwner && (
                    <button onClick={() => setManagerOpen(true)} className="block mx-auto mt-2 text-primary underline text-xs">
                      أضف ستوري الآن
                    </button>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2 px-3 py-2.5 overflow-x-auto scrollbar-hide">
                  {stories.map((s, idx) => (
                    <StoryItemCircle
                      key={s.id}
                      story={s}
                      colorTheme={colorTheme}
                      isViewed={viewedIds.has(s.id)}
                      onClick={() => handleOpenStory(idx)}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="categories"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
            >
              <CategoryTabs
                categories={categories}
                selectedCategory={selectedCategory}
                onCategorySelect={onCategorySelect}
                colorTheme={colorTheme}
                categoryImages={categoryImages}
                isStoreOwner={isStoreOwner}
                storeOwnerId={storeOwnerId}
                refreshData={refreshData}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Story Viewer */}
      <StoryViewer
        products={viewerProducts}
        initialIndex={viewerIndex}
        isOpen={viewerOpen}
        onClose={() => setViewerOpen(false)}
        colorTheme={colorTheme}
        onAddToCart={(p) => {
          const story = stories.find((s) => s.product_id === p.id || s.id === p.id);
          if (story?.type === "category" && story.title) {
            onCategorySelect(story.title);
            setViewerOpen(false);
          } else if (story?.product) {
            onAddToCart?.(story.product);
          }
        }}
        onToggleFavorite={onToggleFavorite}
        onShare={(p) => {
          const story = stories.find((s) => s.product_id === p.id);
          if (story?.product) onShare?.(story.product);
        }}
        isFavorite={isFavorite}
        showAddButton={showAddButton}
        onViewed={handleViewed}
      />

      {/* Manager Sheet */}
      {isStoreOwner && storeOwnerId && (
        <StoriesManagerSheet
          isOpen={managerOpen}
          onClose={() => setManagerOpen(false)}
          storeOwnerId={storeOwnerId}
          products={products}
          storiesEnabled={storiesEnabled}
          autoGenerate={storiesAutoGenerate}
          onSettingsChange={handleSettingsChange}
        />
      )}

      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

// Mini circle component for stories (uses StoryItem)
const StoryItemCircle: React.FC<{
  story: StoryItem;
  colorTheme?: string | null;
  isViewed: boolean;
  onClick: () => void;
}> = ({ story, colorTheme, isViewed, onClick }) => {
  const themeColor = colorTheme?.startsWith("#") ? colorTheme : "#8B5CF6";
  return (
    <motion.button
      whileTap={{ scale: 0.92 }}
      onClick={onClick}
      className="flex flex-col items-center gap-1 flex-shrink-0 w-[64px]"
    >
      <div
        className="relative p-[2px] rounded-full"
        style={{
          background: isViewed
            ? "linear-gradient(45deg, #d1d5db, #9ca3af)"
            : `linear-gradient(45deg, ${themeColor}, #ec4899, #f59e0b)`,
          backgroundSize: "200% 200%",
          animation: isViewed ? "none" : "storyGradient 3s ease infinite",
        }}
      >
        <div className="bg-white dark:bg-gray-900 p-[2px] rounded-full">
          <div className="w-14 h-14 rounded-full overflow-hidden">
            {story.image_url ? (
              <img src={story.image_url} alt={story.title || ""} className="w-full h-full object-cover" loading="lazy" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xs font-bold text-white" style={{ backgroundColor: themeColor }}>
                {(story.title || "?").charAt(0)}
              </div>
            )}
          </div>
        </div>
        {story.type === "category" && (
          <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-blue-500 border-2 border-white flex items-center justify-center">
            <LayoutGrid className="w-2 h-2 text-white" />
          </div>
        )}
      </div>
      <span className="text-[10px] font-medium text-gray-700 dark:text-gray-300 truncate w-full text-center">
        {story.title || ""}
      </span>
      <style>{`
        @keyframes storyGradient {
          0%,100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
      `}</style>
    </motion.button>
  );
};

export default UnifiedStoriesCategoriesBar;
