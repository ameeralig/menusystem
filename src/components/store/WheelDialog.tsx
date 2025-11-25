import React, { useState, useEffect, useCallback, Suspense, lazy } from 'react';
import { motion } from 'framer-motion';
import { X, Loader2, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import SpinWheel from '@/components/wheel/SpinWheel';
import AnimatedStoreHeader from '@/components/store/AnimatedStoreHeader';
import ProductDetailsModal from '@/components/store/fast-template/ProductDetailsModal';
import { Product } from '@/types/product';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface WheelDialogProps {
  isOpen: boolean;
  onClose: () => void;
  storeOwnerId: string;
  storeName: string;
  colorTheme?: string;
  fontSettings?: any;
}

const WheelDialog: React.FC<WheelDialogProps> = ({ 
  isOpen, 
  onClose, 
  storeOwnerId, 
  storeName, 
  colorTheme,
  fontSettings 
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productsLoading, setProductsLoading] = useState(true);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);

  useEffect(() => {
    if (isOpen && storeOwnerId) {
      fetchProducts();
    }
  }, [isOpen, storeOwnerId]);

  const fetchProducts = useCallback(async () => {
    try {
      setProductsLoading(true);

      // جلب المنتجات المتاحة فقط
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .eq('user_id', storeOwnerId)
        .eq('is_available', true)
        .order('name');

      if (productsError) throw productsError;
      
      const products = productsData || [];
      setAllProducts(products);
      
      // استخراج التصنيفات الفريدة
      const uniqueCategories = [...new Set(products
        .map(product => product.category)
        .filter(Boolean) as string[])]
        .sort();
      
      setCategories(uniqueCategories);
      
      // إذا لم يتم اختيار تصنيف بعد، اختر الأول
      const firstCategory = uniqueCategories.length > 0 ? uniqueCategories[0] : '';
      const currentCategory = selectedCategory || firstCategory;
      const filteredProducts = currentCategory 
        ? products.filter(product => product.category === currentCategory)
        : products;

      if (!selectedCategory && firstCategory) {
        setSelectedCategory(firstCategory);
      }
      setProducts(filteredProducts);
      
    } catch (error) {
      console.error('Error loading products:', error);
      toast.error('حدث خطأ في تحميل المنتجات');
    } finally {
      setProductsLoading(false);
    }
  }, [storeOwnerId, selectedCategory]);

  const handleWheelResult = (product: Product) => {
    setSelectedProduct(product);
    // فتح نافذة تفاصيل المنتج
    setIsProductModalOpen(true);
  };

  const handleCloseProductModal = () => {
    setIsProductModalOpen(false);
    setSelectedProduct(null);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setSelectedProduct(null);
    const filteredProducts = allProducts.filter(product => product.category === category);
    setProducts(filteredProducts);
  };

  // تحديد لون الثيم
  const getThemeColor = () => {
    if (colorTheme?.startsWith('#')) {
      return colorTheme;
    }
    
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

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent 
          className="max-w-[95vw] sm:max-w-3xl lg:max-w-4xl max-h-[90vh] overflow-y-auto p-4 sm:p-6"
          style={{
            background: `linear-gradient(135deg, ${themeColor}08, ${themeColor}15)`,
            borderColor: `${themeColor}40`,
          }}
        >
          {/* زر الإغلاق */}
          <button
            onClick={onClose}
            className="absolute top-2 left-2 sm:top-4 sm:left-4 z-50 w-8 h-8 sm:w-10 sm:h-10 shadow-lg rounded-full flex items-center justify-center hover:shadow-xl transition-all duration-200 hover:scale-105"
            style={{
              background: themeColor,
              color: 'white'
            }}
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {productsLoading ? (
            <div className="min-h-[300px] sm:min-h-[400px] flex items-center justify-center">
              <div className="text-center">
                <Loader2 className="w-10 h-10 sm:w-12 sm:h-12 animate-spin mx-auto mb-4" style={{ color: themeColor }} />
                <p className="text-sm sm:text-base" style={{ color: themeColor }}>جاري تحميل العجلة...</p>
              </div>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              {/* العنوان */}
              <div className="mb-4 sm:mb-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                  className="text-4xl sm:text-5xl mb-2 sm:mb-3"
                >
                  🎡
                </motion.div>
                <h2 className="text-xl sm:text-2xl font-bold mb-2" style={{ color: themeColor }}>عجلة الحظ</h2>
                <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl mx-auto px-4">
                  اختر تصنيفاً واضغط على وسط العجلة لاكتشاف المنتج المحظوظ!
                </p>
              </div>

              {/* اختيار التصنيف */}
              {categories.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                  className="mb-4 sm:mb-6 max-w-md mx-auto px-4"
                >
                  <Card 
                    className="p-3 sm:p-4 backdrop-blur-sm"
                    style={{
                      background: `${themeColor}10`,
                      borderColor: `${themeColor}30`,
                    }}
                  >
                    <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                      <Filter className="w-3 h-3 sm:w-4 sm:h-4" style={{ color: themeColor }} />
                      <h3 className="text-sm sm:text-base font-semibold" style={{ color: themeColor }}>اختر التصنيف</h3>
                    </div>
                    <Select value={selectedCategory} onValueChange={handleCategoryChange}>
                      <SelectTrigger className="w-full text-sm sm:text-base">
                        <SelectValue placeholder="اختر تصنيف..." />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category} className="text-sm sm:text-base">
                            {category} ({allProducts.filter(p => p.category === category).length} منتج)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {selectedCategory && (
                      <p className="text-[10px] sm:text-xs text-muted-foreground mt-2 text-center">
                        يوجد {products.length} منتج في تصنيف "{selectedCategory}"
                      </p>
                    )}
                  </Card>
                </motion.div>
              )}

              {/* العجلة */}
              {products.length > 0 ? (
                <div className="px-2 sm:px-4">
                  <SpinWheel 
                    products={products} 
                    onResult={handleWheelResult}
                    colorTheme={colorTheme}
                    hideResult={true}
                  />
                </div>
              ) : (
                <Card 
                  className="p-6 sm:p-8 backdrop-blur-sm mx-auto max-w-md"
                  style={{
                    background: `${themeColor}10`,
                    borderColor: `${themeColor}30`,
                  }}
                >
                  <div className="text-4xl sm:text-5xl mb-3">📦</div>
                  <h3 className="text-lg sm:text-xl font-bold mb-2" style={{ color: themeColor }}>لا توجد منتجات</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-4">
                    لا يوجد منتجات متاحة حالياً في هذا المتجر لعرضها في العجلة
                  </p>
                  <Button 
                    onClick={onClose} 
                    variant="outline" 
                    size="sm"
                    style={{
                      borderColor: themeColor,
                      color: themeColor
                    }}
                  >
                    إغلاق
                  </Button>
                </Card>
              )}
            </motion.div>
          )}
        </DialogContent>
      </Dialog>

      {/* نافذة تفاصيل المنتج */}
      {selectedProduct && (
        <ProductDetailsModal
          product={selectedProduct}
          isOpen={isProductModalOpen}
          onClose={handleCloseProductModal}
          colorTheme={colorTheme}
          isStoreOwner={false}
        />
      )}
    </>
  );
};

export default WheelDialog;
