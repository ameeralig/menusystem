import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Filter, Sparkles } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import SpinWheel from '@/components/wheel/SpinWheel';
import ProductDetailsModal from '@/components/store/fast-template/ProductDetailsModal';
import { Product } from '@/types/product';

interface WheelModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  colorTheme?: string;
  isStoreOwner?: boolean;
}

const WheelModal: React.FC<WheelModalProps> = ({ 
  isOpen, onClose, products, colorTheme, isStoreOwner = false
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);

  const categories = useMemo(() => {
    const availableProducts = products.filter(p => p.is_available);
    const uniqueCategories = [...new Set(availableProducts.map(p => p.category).filter(Boolean) as string[])].sort();
    if (!selectedCategory && uniqueCategories.length > 0) setSelectedCategory(uniqueCategories[0]);
    return uniqueCategories;
  }, [products, selectedCategory]);

  const filteredProducts = useMemo(() => {
    return products.filter(p => p.is_available && p.category === selectedCategory);
  }, [products, selectedCategory]);

  const handleWheelResult = (product: Product) => {
    setSelectedProduct(product);
    setIsProductModalOpen(true);
  };

  const getThemeColor = () => {
    if (colorTheme?.startsWith('#')) return colorTheme;
    const themeColors: Record<string, string> = {
      coral: '#ff9178', purple: '#8B5CF6', blue: '#3B82F6', green: '#10B981',
      pink: '#EC4899', teal: '#14B8A6', amber: '#F59E0B', indigo: '#6366F1', rose: '#F43F5E',
    };
    return themeColors[colorTheme || ''] || '#3B82F6';
  };
  const themeColor = getThemeColor();

  if (!isOpen) return null;

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
            onClick={(e) => e.target === e.currentTarget && onClose()}
          >
            {/* Backdrop */}
            <motion.div className="absolute inset-0 bg-black/70 backdrop-blur-md" />

            {/* Modal */}
            <motion.div
              initial={{ y: 100, opacity: 0, scale: 0.92 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 100, opacity: 0, scale: 0.92 }}
              transition={{ type: "spring", damping: 28, stiffness: 350 }}
              className="relative w-full max-w-md max-h-[92vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl bg-background shadow-2xl border border-border/30"
              style={{ direction: "rtl" }}
            >
              {/* Header */}
              <div
                className="relative p-5 text-white overflow-hidden"
                style={{ background: `linear-gradient(135deg, ${themeColor}, ${themeColor}bb)` }}
              >
                {/* Decorative elements */}
                <motion.div animate={{ y: [-5, 5, -5], rotate: [0, 10, 0] }}
                  transition={{ repeat: Infinity, duration: 4 }}
                  className="absolute top-2 left-8 text-2xl opacity-20">🎰</motion.div>
                <motion.div animate={{ y: [5, -5, 5] }}
                  transition={{ repeat: Infinity, duration: 3 }}
                  className="absolute bottom-2 left-20 text-lg opacity-15">⭐</motion.div>
                <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-white/10 blur-2xl" />
                <div className="absolute -bottom-8 -left-8 w-24 h-24 rounded-full bg-white/10 blur-xl" />

                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <motion.div
                      animate={{ rotate: [0, 360] }}
                      transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
                      className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm text-2xl"
                    >
                      🎡
                    </motion.div>
                    <div>
                      <h2 className="text-lg font-black tracking-wide">عجلة الحظ</h2>
                      <p className="text-[10px] text-white/60 font-medium">اختر تصنيفاً وأدر العجلة! 🎯</p>
                    </div>
                  </div>
                  <button onClick={onClose}
                    className="p-2 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-all">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="p-4 space-y-4">
                {/* Category Selector */}
                {categories.length > 0 && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                    className="p-3 rounded-2xl border border-border/30"
                    style={{ background: `${themeColor}05` }}>
                    <div className="flex items-center gap-2 mb-2 text-xs text-muted-foreground font-medium">
                      <Filter className="w-3.5 h-3.5" />
                      <span>اختر التصنيف</span>
                    </div>
                    <Select value={selectedCategory} onValueChange={(v) => { setSelectedCategory(v); setSelectedProduct(null); }}>
                      <SelectTrigger className="w-full rounded-xl border-2 h-11 font-bold"
                        style={{ borderColor: `${themeColor}30` }}>
                        <SelectValue placeholder="اختر تصنيف..." />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category} ({products.filter(p => p.category === category && p.is_available).length})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </motion.div>
                )}

                {/* Wheel */}
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="rounded-2xl overflow-hidden border border-border/30 bg-card p-3">
                  {filteredProducts.length > 0 ? (
                    <SpinWheel 
                      products={filteredProducts} 
                      onResult={handleWheelResult}
                      colorTheme={colorTheme}
                      hideResult={true}
                    />
                  ) : (
                    <div className="text-center py-12 space-y-3">
                      <motion.span animate={{ y: [0, -8, 0] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className="text-5xl block">📦</motion.span>
                      <h3 className="text-base font-black text-foreground">لا توجد منتجات</h3>
                      <p className="text-xs text-muted-foreground">
                        {selectedCategory ? `لا توجد منتجات في "${selectedCategory}"` : 'لا توجد منتجات متاحة'}
                      </p>
                    </div>
                  )}
                </motion.div>
              </div>

              {/* Footer */}
              <div className="p-3 border-t border-border/20">
                <p className="text-center text-[10px] text-muted-foreground font-medium">
                  ✨ اضغط وسط العجلة لبدء الدوران!
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {selectedProduct && (
        <ProductDetailsModal
          product={selectedProduct}
          isOpen={isProductModalOpen}
          onClose={() => { setIsProductModalOpen(false); setSelectedProduct(null); }}
          colorTheme={colorTheme}
          isStoreOwner={isStoreOwner}
        />
      )}
    </>
  );
};

export default WheelModal;
