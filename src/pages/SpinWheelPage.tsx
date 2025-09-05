import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import SpinWheel from '@/components/wheel/SpinWheel';
import ProductPreviewContainer from '@/components/store/ProductPreviewContainer';
import AnimatedStoreHeader from '@/components/store/AnimatedStoreHeader';
import { Product } from '@/types/product';
import { useStoreSettings } from '@/hooks/store/useStoreSettings';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const SpinWheelPage: React.FC = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const { storeSettings, isLoading } = useStoreSettings(slug);
  const [productsLoading, setProductsLoading] = useState(true);

  useEffect(() => {
    if (storeSettings.storeOwnerId && !isLoading) {
      fetchProducts();
    }
  }, [storeSettings.storeOwnerId, isLoading]);

  const fetchProducts = useCallback(async () => {
    try {
      setProductsLoading(true);

      // جلب المنتجات المتاحة فقط
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .eq('user_id', storeSettings.storeOwnerId)
        .eq('is_available', true)
        .order('name');

      if (productsError) throw productsError;
      
      setProducts(productsData || []);
      
    } catch (error) {
      console.error('Error loading products:', error);
      toast.error('حدث خطأ في تحميل المنتجات');
    } finally {
      setProductsLoading(false);
    }
  }, [storeSettings.storeOwnerId]);

  const handleWheelResult = (product: Product) => {
    setSelectedProduct(product);
  };

  const goBack = () => {
    navigate(`/store/${slug}`);
  };

  if (isLoading || productsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">جاري تحميل العجلة...</p>
        </div>
      </div>
    );
  }

  if (!storeSettings.storeName) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">المتجر غير موجود</h2>
          <p className="text-muted-foreground mb-4">الرابط الذي تحاول الوصول إليه غير صحيح</p>
          <Button onClick={() => navigate('/')}>العودة للرئيسية</Button>
        </Card>
      </div>
    );
  }

  return (
    <ProductPreviewContainer
      colorTheme={storeSettings.colorTheme}
      bannerUrl={storeSettings.bannerUrl}
      fontSettings={storeSettings.fontSettings}
      darkMode={storeSettings.darkMode}
      containerHeight="100vh"
    >
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border/50 -mx-4 sm:-mx-6 px-4 sm:px-6 -mt-4 sm:-mt-6 mb-8">
        <div className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={goBack}
                className="gap-2 hover:bg-muted/60"
              >
                <ArrowLeft className="w-4 h-4" />
                العودة للمتجر
              </Button>
            </div>
            {/* اسم المتجر مع الانيميشن في الأعلى */}
            <div className="flex justify-center flex-1">
              <AnimatedStoreHeader 
                storeName={storeSettings.storeName}
                colorTheme={storeSettings.colorTheme}
                fontSettings={storeSettings.fontSettings}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto text-center"
      >
        {/* مقدمة */}
        <div className="mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-6xl mb-4"
          >
            🎡
          </motion.div>
          <h2 className="text-3xl font-bold mb-2 text-foreground">عجلة الحظ</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            اضغط على "تدوير العجلة" واكتشف المنتج المحظوظ! 
            {products.length > 0 && ` يوجد ${products.length} منتج متاح في العجلة`}
          </p>
        </div>

        {/* العجلة */}
        {products.length > 0 ? (
          <SpinWheel 
            products={products} 
            onResult={handleWheelResult}
            colorTheme={storeSettings.colorTheme}
          />
        ) : (
          <Card className="p-12 border-border/50 bg-card/50 backdrop-blur-sm mx-auto max-w-md">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-2xl font-bold mb-2 text-foreground">لا توجد منتجات</h3>
            <p className="text-muted-foreground mb-6">
              لا يوجد منتجات متاحة حالياً في هذا المتجر لعرضها في العجلة
            </p>
            <Button onClick={goBack} variant="outline">
              العودة للمتجر
            </Button>
          </Card>
        )}

        {/* معلومات إضافية */}
        {products.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-12 text-center"
          >
            <Card className="p-6 bg-muted/30 border-border/50 backdrop-blur-sm">
              <h3 className="text-lg font-semibold mb-2 text-foreground">كيف تعمل العجلة؟</h3>
              <div className="grid md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🎯</span>
                  <span>اضغط على زر "تدوير العجلة"</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🎡</span>
                  <span>انتظر حتى تتوقف العجلة</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🎉</span>
                  <span>اكتشف المنتج المحظوظ!</span>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </motion.div>
    </ProductPreviewContainer>
  );
};

export default SpinWheelPage;