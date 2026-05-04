import React, { useState, useEffect, useCallback } from "react";
import { Product } from "@/types/product";
import { CategoryImage } from "@/types/categoryImage";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, LayoutGrid, Settings2, Edit, GripVertical } from "lucide-react";
import StoryViewer from "../stories/StoryViewer";
import StoriesManagerSheet from "../stories/StoriesManagerSheet";
import CategoryImageUploadDialog from "./CategoryImageUploadDialog";
import { useStoriesData, StoryItem } from "@/hooks/store/useStoriesData";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { sortCategoriesByOrder } from "@/utils/categorySort";
import { logVisitorActivity } from "@/hooks/analytics/useActivityLogger";

interface Props {
  categories: string[];
  selectedCategory: string | null;
  onCategorySelect: (category: string | null) => void;
  colorTheme?: string | null;
  categoryImages?: CategoryImage[];
  isStoreOwner?: boolean;
  storeOwnerId?: string;
  refreshData?: () => void;
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
    try { return (localStorage.getItem(PREF_KEY) as Tab) || "categories"; } catch { return "categories"; }
  });
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);
  const [managerOpen, setManagerOpen] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedCategoryForUpload, setSelectedCategoryForUpload] = useState<string>("");

  const { stories } = useStoriesData({
    storeOwnerId, enabled: storiesEnabled, autoGenerate: storiesAutoGenerate, products, categoryImages,
  });

  const themeColor = colorTheme?.startsWith("#") ? colorTheme : "#8B5CF6";
  const showStoriesTab = storiesEnabled && (stories.length > 0 || isStoreOwner);

  // إذا اختفى تبويب الستوريز نهائياً، عُد للتصنيفات
  useEffect(() => {
    if (!showStoriesTab && activeTab === "stories") setActiveTab("categories");
  }, [showStoriesTab, activeTab]);

  const handleTabChange = (t: Tab) => {
    setActiveTab(t);
    try { localStorage.setItem(PREF_KEY, t); } catch {}
  };

  const handleSettingsChange = async (s: { stories_enabled?: boolean; stories_auto_generate?: boolean }) => {
    if (!storeOwnerId) return;
    const { error } = await supabase.from("store_settings").update(s).eq("user_id", storeOwnerId);
    if (error) toast.error("فشل الحفظ");
    else { toast.success("تم الحفظ"); refreshData?.(); }
  };

  const handleOpenStory = useCallback((idx: number) => {
    setViewerIndex(idx);
    setViewerOpen(true);
    // تتبع مشاهدة الستوري (مخفي عن الزائر، يظهر في تحليلات الإدارة فقط)
    const story = stories[idx];
    if (storeOwnerId && !isStoreOwner && story) {
      logVisitorActivity(storeOwnerId, "story_view", {
        story_id: story.id, story_type: story.type, story_title: story.title,
      });
    }
  }, [stories, storeOwnerId, isStoreOwner]);

  const handleEditCategory = (category: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedCategoryForUpload(category);
    setUploadDialogOpen(true);
  };

  const sortedCategoriesList = sortCategoriesByOrder(categories, categoryImages || []);
  const getCategoryImage = (c: string) => categoryImages?.find(i => i.category === c);

  const viewerProducts: Product[] = stories.map((s) => {
    if (s.product) return s.product;
    return {
      id: s.id, name: s.title || "", description: s.caption || "", price: 0,
      image_url: s.image_url, category: s.type === "category" ? s.title || "" : "",
      is_available: true, user_id: storeOwnerId || "", created_at: "",
    } as Product;
  });

  return (
    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-100 dark:border-gray-700/50 sticky top-0 z-30">
      {/* Segmented Control */}
      {showStoriesTab && (
        <div className="relative flex items-center justify-center px-3 pt-2.5 pb-1">
          <div className="relative flex bg-gray-100 dark:bg-gray-900/60 rounded-full p-0.5 w-full max-w-[260px]">
            <motion.div
              layout
              transition={{ type: "spring", stiffness: 400, damping: 32 }}
              className="absolute inset-y-0.5 w-[calc(50%-2px)] rounded-full bg-white dark:bg-gray-700 shadow-sm"
              style={{ right: activeTab === "categories" ? 2 : "calc(50% + 0px)" }}
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
            </button>
          </div>

          {isStoreOwner && (
            <button
              onClick={() => setManagerOpen(true)}
              className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition"
              title="إدارة الستوريز"
            >
              <Settings2 className="w-4 h-4 text-gray-600 dark:text-gray-300" />
            </button>
          )}
        </div>
      )}

      <div className="relative">
        <AnimatePresence mode="wait" initial={false}>
          {activeTab === "stories" && showStoriesTab ? (
            <motion.div
              key="stories"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
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
                    <CircleItem
                      key={s.id}
                      imageUrl={s.image_url}
                      title={s.title || ""}
                      themeColor={themeColor}
                      isSelected={false}
                      glowing
                      badge={s.type === "category" ? <LayoutGrid className="w-2 h-2 text-white" /> : null}
                      onClick={() => handleOpenStory(idx)}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="categories"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center gap-2 px-3 py-2.5 overflow-x-auto scrollbar-hide">
                {sortedCategoriesList.map((c) => {
                  const img = getCategoryImage(c);
                  const isSel = selectedCategory === c;
                  return (
                    <CircleItem
                      key={c}
                      imageUrl={img?.image_url || null}
                      title={c}
                      themeColor={themeColor}
                      isSelected={isSel}
                      onClick={() => {
                        onCategorySelect(c);
                        if (storeOwnerId && !isStoreOwner) {
                          logVisitorActivity(storeOwnerId, "category_click", { category_name: c });
                        }
                      }}
                      ownerEdit={isStoreOwner ? (e) => handleEditCategory(c, e) : undefined}
                    />
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

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
      />

      {isStoreOwner && storeOwnerId && (
        <>
          <StoriesManagerSheet
            isOpen={managerOpen}
            onClose={() => setManagerOpen(false)}
            storeOwnerId={storeOwnerId}
            products={products}
            storiesEnabled={storiesEnabled}
            autoGenerate={storiesAutoGenerate}
            onSettingsChange={handleSettingsChange}
          />
          <CategoryImageUploadDialog
            open={uploadDialogOpen}
            onOpenChange={setUploadDialogOpen}
            category={selectedCategoryForUpload}
            currentImageUrl={getCategoryImage(selectedCategoryForUpload)?.image_url}
            userId={storeOwnerId}
            onSuccess={() => refreshData?.()}
          />
        </>
      )}

      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes storyGradient {
          0%,100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
      `}</style>
    </div>
  );
};

// عنصر دائري موحد للتصنيفات والستوريز
const CircleItem: React.FC<{
  imageUrl: string | null;
  title: string;
  themeColor: string;
  isSelected: boolean;
  glowing?: boolean;
  badge?: React.ReactNode;
  onClick: () => void;
  ownerEdit?: (e: React.MouseEvent) => void;
}> = ({ imageUrl, title, themeColor, isSelected, glowing, badge, onClick, ownerEdit }) => {
  return (
    <motion.button
      whileTap={{ scale: 0.92 }}
      onClick={onClick}
      className="group flex flex-col items-center gap-1 flex-shrink-0 w-[68px]"
    >
      <div
        className="relative p-[2px] rounded-full"
        style={
          glowing
            ? {
                background: `linear-gradient(45deg, ${themeColor}, #ec4899, #f59e0b)`,
                backgroundSize: "200% 200%",
                animation: "storyGradient 3s ease infinite",
              }
            : isSelected
            ? { background: themeColor }
            : { background: "transparent", border: `2px solid ${document.documentElement.classList.contains('dark') ? '#374151' : '#e5e7eb'}` }
        }
      >
        <div className={`${glowing ? "bg-white dark:bg-gray-900 p-[2px] rounded-full" : ""}`}>
          <div className="w-14 h-14 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800">
            {imageUrl ? (
              <img src={imageUrl} alt={title} className="w-full h-full object-cover" loading="lazy" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-base font-bold text-white" style={{ backgroundColor: themeColor }}>
                {title.charAt(0)}
              </div>
            )}
          </div>
        </div>
        {badge && (
          <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-blue-500 border-2 border-white dark:border-gray-800 flex items-center justify-center">
            {badge}
          </div>
        )}
        {ownerEdit && (
          <button
            onClick={ownerEdit}
            className="absolute -top-1 -right-1 bg-primary text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition shadow-md z-10"
            title="تحديث الصورة"
          >
            <Edit className="w-2.5 h-2.5" />
          </button>
        )}
      </div>
      <span
        className={`text-[10px] font-medium truncate w-full text-center ${
          isSelected ? "font-semibold" : "text-gray-700 dark:text-gray-300"
        }`}
        style={isSelected ? { color: themeColor } : undefined}
      >
        {title}
      </span>
    </motion.button>
  );
};

export default UnifiedStoriesCategoriesBar;
