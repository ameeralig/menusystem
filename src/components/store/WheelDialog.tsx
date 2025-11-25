import React, { useState, useEffect, useCallback, Suspense, lazy } from 'react';
import { motion } from 'framer-motion';
import { X, Loader2, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import SpinWheel from '@/components/wheel/SpinWheel';
import AnimatedStoreHeader from '@/components/store/AnimatedStoreHeader';
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
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setSelectedProduct(null);
    const filteredProducts = allProducts.filter(product => product.category === category);
    setProducts(filteredProducts);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-6">
        {/* زر الإغلاق */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 z-50 w-10 h-10 bg-background border border-border shadow-lg rounded-full flex items-center justify-center hover:shadow-xl transition-all duration-200 hover:scale-105"
        >
          <X className="w-5 h-5 text-foreground" />
        </button>

        {productsLoading ? (
          <div className="min-h-[400px] flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-muted-foreground">جاري تحميل العجلة...</p>
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
            <div className="mb-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="text-5xl mb-3"
              >
                🎡
              </motion.div>
              <h2 className="text-2xl font-bold mb-2 text-foreground">عجلة الحظ</h2>
              <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
                اختر تصنيفاً واضغط على وسط العجلة لاكتشاف المنتج المحظوظ!
              </p>
            </div>

            {/* اختيار التصنيف */}
            {categories.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="mb-6 max-w-md mx-auto"
              >
                <Card className="p-4 border-border/50 bg-card/50 backdrop-blur-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <Filter className="w-4 h-4 text-primary" />
                    <h3 className="text-base font-semibold text-foreground">اختر التصنيف</h3>
                  </div>
                  <Select value={selectedCategory} onValueChange={handleCategoryChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="اختر تصنيف..." />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category} ({allProducts.filter(p => p.category === category).length} منتج)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedCategory && (
                    <p className="text-xs text-muted-foreground mt-2 text-center">
                      يوجد {products.length} منتج في تصنيف "{selectedCategory}"
                    </p>
                  )}
                </Card>
              </motion.div>
            )}

            {/* العجلة */}
            {products.length > 0 ? (
              <SpinWheel 
                products={products} 
                onResult={handleWheelResult}
                colorTheme={colorTheme}
              />
            ) : (
              <Card className="p-8 border-border/50 bg-card/50 backdrop-blur-sm mx-auto max-w-md">
                <div className="text-5xl mb-3">📦</div>
                <h3 className="text-xl font-bold mb-2 text-foreground">لا توجد منتجات</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  لا يوجد منتجات متاحة حالياً في هذا المتجر لعرضها في العجلة
                </p>
                <Button onClick={onClose} variant="outline" size="sm">
                  إغلاق
                </Button>
              </Card>
            )}
          </motion.div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default WheelDialog;
