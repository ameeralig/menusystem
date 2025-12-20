import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Filter } from 'lucide-react';
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
  isOpen, 
  onClose, 
  products,
  colorTheme,
  isStoreOwner = false
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);

  const categories = useMemo(() => {
    const availableProducts = products.filter(p => p.is_available);
    const uniqueCategories = [...new Set(availableProducts
      .map(product => product.category)
      .filter(Boolean) as string[])]
      .sort();
    
    if (!selectedCategory && uniqueCategories.length > 0) {
      setSelectedCategory(uniqueCategories[0]);
    }
    
    return uniqueCategories;
  }, [products, selectedCategory]);

  const filteredProducts = useMemo(() => {
    return products.filter(product => 
      product.is_available && 
      product.category === selectedCategory
    );
  }, [products, selectedCategory]);

  const handleWheelResult = (product: Product) => {
    setSelectedProduct(product);
    onClose();
    setTimeout(() => {
      setIsProductModalOpen(true);
    }, 300);
  };

  const handleCloseProductModal = () => {
    setIsProductModalOpen(false);
    setSelectedProduct(null);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setSelectedProduct(null);
  };

  const getThemeColor = () => {
    if (colorTheme?.startsWith('#')) return colorTheme;
    
    const themeColors: { [key: string]: string } = {
      coral: '#ff9178',
      purple: '#8B5CF6',
      blue: '#3B82F6',
      green: '#10B981',
      pink: '#EC4899',
      teal: '#14B8A6',
      amber: '#F59E0B',
      indigo: '#6366F1',
      rose: '#F43F5E'
    };
    
    return themeColors[colorTheme || ''] || '#3B82F6';
  };

  const themeColor = getThemeColor();

  if (!isOpen) return null;

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            {/* الخلفية الضبابية */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 z-50 backdrop-blur-md bg-black/40"
            />

            {/* النافذة العائمة */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
            >
              <div className="pointer-events-auto w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                {/* زر الإغلاق */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/20 backdrop-blur-lg border border-white/30 flex items-center justify-center text-white shadow-lg"
                >
                  <X className="w-5 h-5" />
                </motion.button>

                {/* البطاقة الزجاجية */}
                <div 
                  className="rounded-3xl overflow-hidden shadow-2xl border border-white/20"
                  style={{
                    background: `linear-gradient(135deg, ${themeColor}ee, ${themeColor}cc)`,
                    backdropFilter: 'blur(20px)',
                  }}
                >
                  {/* تأثير الإضاءة العلوي */}
                  <div 
                    className="absolute top-0 left-0 right-0 h-32 opacity-30 pointer-events-none"
                    style={{
                      background: 'linear-gradient(180deg, rgba(255,255,255,0.4) 0%, transparent 100%)',
                    }}
                  />

                  <div className="relative p-6 text-center text-white">
                    {/* العنوان */}
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.1, type: "spring" }}
                      className="mb-4"
                    >
                      <div className="text-5xl mb-2">🎡</div>
                      <h2 className="text-2xl font-bold mb-1 drop-shadow-lg">عجلة الحظ</h2>
                      <p className="text-white/80 text-sm">
                        اختر تصنيفاً واضغط على العجلة!
                      </p>
                    </motion.div>

                    {/* اختيار التصنيف */}
                    {categories.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="mb-4 max-w-md mx-auto"
                      >
                        <div 
                          className="p-3 rounded-2xl bg-white/10 backdrop-blur-lg border border-white/20"
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <Filter className="w-4 h-4 text-white/80" />
                            <span className="text-sm font-medium text-white/90">اختر التصنيف</span>
                          </div>
                          <Select value={selectedCategory} onValueChange={handleCategoryChange}>
                            <SelectTrigger className="w-full bg-white/20 border-white/30 text-white">
                              <SelectValue placeholder="اختر تصنيف..." />
                            </SelectTrigger>
                            <SelectContent>
                              {categories.map((category) => (
                                <SelectItem key={category} value={category}>
                                  {category} ({products.filter(p => p.category === category && p.is_available).length} منتج)
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </motion.div>
                    )}

                    {/* العجلة */}
                    <div className="bg-white/95 rounded-2xl p-4 mx-auto max-w-lg">
                      {filteredProducts.length > 0 ? (
                        <SpinWheel 
                          products={filteredProducts} 
                          onResult={handleWheelResult}
                          colorTheme={colorTheme}
                          hideResult={true}
                        />
                      ) : (
                        <div className="text-center py-8">
                          <div className="text-5xl mb-3">📦</div>
                          <h3 className="text-lg font-bold mb-2" style={{ color: themeColor }}>لا توجد منتجات</h3>
                          <p className="text-sm text-muted-foreground">
                            {selectedCategory 
                              ? `لا توجد منتجات متاحة في "${selectedCategory}"`
                              : 'لا توجد منتجات متاحة'
                            }
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* نافذة تفاصيل المنتج */}
      {selectedProduct && (
        <ProductDetailsModal
          product={selectedProduct}
          isOpen={isProductModalOpen}
          onClose={handleCloseProductModal}
          colorTheme={colorTheme}
          isStoreOwner={isStoreOwner}
        />
      )}
    </>
  );
};

export default WheelModal;
