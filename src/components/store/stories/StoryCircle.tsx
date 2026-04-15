import React from "react";
import { motion } from "framer-motion";
import { Product } from "@/types/product";
import { optimizeImageUrl } from "@/utils/imageOptimizer";

interface StoryCircleProps {
  product: Product;
  colorTheme?: string | null;
  isViewed?: boolean;
  onClick: () => void;
}

const StoryCircle: React.FC<StoryCircleProps> = ({
  product,
  colorTheme,
  isViewed = false,
  onClick,
}) => {
  const themeColor = colorTheme?.startsWith('#') ? colorTheme : '#8B5CF6';
  const imgUrl = optimizeImageUrl(product.image_url, 'thumbnail');

  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      className="flex flex-col items-center gap-1.5 flex-shrink-0 w-[72px]"
    >
      {/* الحلقة المتوهجة */}
      <div
        className="relative w-16 h-16 rounded-full p-[2.5px]"
        style={{
          background: isViewed
            ? 'linear-gradient(135deg, #9ca3af, #d1d5db)'
            : `linear-gradient(135deg, ${themeColor}, #f59e0b, #ef4444, ${themeColor})`,
          backgroundSize: '300% 300%',
          animation: isViewed ? 'none' : 'storyGradient 3s ease infinite',
        }}
      >
        <div className="w-full h-full rounded-full bg-white dark:bg-gray-900 p-[2px]">
          <div className="w-full h-full rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
            {product.image_url ? (
              <img
                src={imgUrl}
                alt={product.name}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center text-white text-lg font-bold"
                style={{ backgroundColor: themeColor }}
              >
                {product.name.charAt(0)}
              </div>
            )}
          </div>
        </div>

        {/* شارة جديد / مميز */}
        {product.is_new && (
          <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 bg-green-500 text-white text-[8px] px-1.5 py-0.5 rounded-full font-bold shadow-lg whitespace-nowrap">
            جديد
          </span>
        )}
        {product.is_popular && !product.is_new && (
          <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 bg-amber-500 text-white text-[8px] px-1.5 py-0.5 rounded-full font-bold shadow-lg">
            🔥
          </span>
        )}
      </div>

      {/* اسم المنتج */}
      <span className="text-[10px] text-gray-700 dark:text-gray-300 font-medium text-center leading-tight line-clamp-1 w-full px-0.5">
        {product.name}
      </span>
    </motion.button>
  );
};

export default StoryCircle;
