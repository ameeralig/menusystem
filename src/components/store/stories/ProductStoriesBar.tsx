import React, { useState, useMemo, useCallback } from "react";
import { Product } from "@/types/product";
import StoryCircle from "./StoryCircle";
import StoryViewer from "./StoryViewer";
import { motion } from "framer-motion";

interface ProductStoriesBarProps {
  products: Product[];
  colorTheme?: string | null;
  onAddToCart?: (product: Product) => void;
  onToggleFavorite?: (productId: string, productName?: string) => void;
  onShare?: (product: Product) => void;
  isFavorite?: (productId: string) => boolean;
  showAddButton?: boolean;
  storeOwnerId?: string;
}

const ProductStoriesBar: React.FC<ProductStoriesBarProps> = ({
  products,
  colorTheme,
  onAddToCart,
  onToggleFavorite,
  onShare,
  isFavorite,
  showAddButton = false,
  storeOwnerId,
}) => {
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);
  const [viewedIds, setViewedIds] = useState<Set<string>>(() => {
    try {
      const key = `stories_viewed_${storeOwnerId || 'default'}`;
      const saved = sessionStorage.getItem(key);
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });

  // تصفية المنتجات المميزة والجديدة فقط (لها صور)
  const storyProducts = useMemo(() => {
    return products.filter(p =>
      (p.is_new || p.is_popular) && p.image_url && p.is_available !== false
    ).slice(0, 20); // حد أقصى 20 ستوري
  }, [products]);

  const handleOpenStory = useCallback((index: number) => {
    setViewerIndex(index);
    setViewerOpen(true);
  }, []);

  const handleViewed = useCallback((productId: string) => {
    setViewedIds(prev => {
      const next = new Set(prev);
      next.add(productId);
      try {
        const key = `stories_viewed_${storeOwnerId || 'default'}`;
        sessionStorage.setItem(key, JSON.stringify([...next]));
      } catch {}
      return next;
    });
  }, [storeOwnerId]);

  // لا نعرض الشريط إذا لم يكن هناك منتجات مميزة
  if (storyProducts.length === 0) return null;

  // ترتيب: غير المشاهدة أولاً
  const sortedProducts = useMemo(() => {
    return [...storyProducts].sort((a, b) => {
      const aViewed = viewedIds.has(a.id) ? 1 : 0;
      const bViewed = viewedIds.has(b.id) ? 1 : 0;
      return aViewed - bViewed;
    });
  }, [storyProducts, viewedIds]);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-100 dark:border-gray-700/50"
      >
        <div className="flex items-center gap-1 px-3 py-3 overflow-x-auto scrollbar-hide">
          {/* عنوان صغير */}
          <div className="flex-shrink-0 flex flex-col items-center justify-center w-[52px] mr-1">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm mb-1"
              style={{ backgroundColor: colorTheme?.startsWith('#') ? colorTheme : '#8B5CF6' }}
            >
              ✨
            </div>
            <span className="text-[9px] text-gray-500 dark:text-gray-400 font-medium">مميز</span>
          </div>

          {sortedProducts.map((product, idx) => (
            <StoryCircle
              key={product.id}
              product={product}
              colorTheme={colorTheme}
              isViewed={viewedIds.has(product.id)}
              onClick={() => handleOpenStory(idx)}
            />
          ))}
        </div>
      </motion.div>

      {/* عارض الستوري */}
      <StoryViewer
        products={sortedProducts}
        initialIndex={viewerIndex}
        isOpen={viewerOpen}
        onClose={() => setViewerOpen(false)}
        colorTheme={colorTheme}
        onAddToCart={onAddToCart}
        onToggleFavorite={onToggleFavorite}
        onShare={onShare}
        isFavorite={isFavorite}
        showAddButton={showAddButton}
        onViewed={handleViewed}
      />

      {/* CSS للأنيميشن */}
      <style>{`
        @keyframes storyGradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </>
  );
};

export default ProductStoriesBar;
