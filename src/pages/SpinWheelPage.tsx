import React, { useState, useEffect, useCallback, Suspense, lazy } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader2, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import SpinWheel from '@/components/wheel/SpinWheel';
import ProductPreviewContainer from '@/components/store/ProductPreviewContainer';
import AnimatedStoreHeader from '@/components/store/AnimatedStoreHeader';
import { Product } from '@/types/product';
import { useStoreSettings } from '@/hooks/store/useStoreSettings';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// تحميل بطيء لمكون الملاحظات
const FeedbackTrigger = lazy(() => import('@/components/store/feedback/FeedbackTrigger'));

const SpinWheelPage: React.FC = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
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
      
      const products = productsData || [];
      setAllProducts(products);
      
      // استخراج التصنيفات الفريدة
      const uniqueCategories = [...new Set(products
        .map(product => product.category)
        .filter(Boolean) as string[])]
        .sort();
      
      setCategories(uniqueCategories);
      
      // إذا لم يتم اختيار تصنيف بعد، اختر الأول
      if (!selectedCategory && uniqueCategories.length > 0) {
        setSelectedCategory(uniqueCategories[0]);
        setProducts(products.filter(product => product.category === uniqueCategories[0]));
      } else if (selectedCategory) {
        setProducts(products.filter(product => product.category === selectedCategory));
      } else {
        setProducts(products);
      }
      
    } catch (error) {
      console.error('Error loading products:', error);
      toast.error('حدث خطأ في تحميل المنتجات');
    } finally {
      setProductsLoading(false);
    }
  }, [storeSettings.storeOwnerId, selectedCategory]);

  const handleWheelResult = (product: Product) => {
    setSelectedProduct(product);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setSelectedProduct(null); // إعادة تعيين النتيجة عند تغيير التصنيف
    const filteredProducts = allProducts.filter(product => product.category === category);
    setProducts(filteredProducts);
  };

  const goBack = () => {
    // التأكد من وجود slug صحيح قبل التنقل
    if (slug && storeSettings.storeName) {
      navigate(`/${slug}`);
    } else {
      // في حالة عدم وجود slug صحيح، العودة للرئيسية
      navigate('/');
    }
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
      {/* زر الرجوع الدائري في أعلى اليمين */}
      <button
        onClick={goBack}
        className="fixed top-4 right-4 z-50 w-12 h-12 bg-white dark:bg-white shadow-lg rounded-full flex items-center justify-center hover:shadow-xl transition-all duration-200 hover:scale-105 border border-gray-200"
      >
        <ArrowLeft className="w-5 h-5 text-gray-700" />
      </button>
      
      {/* اسم المتجر في أعلى الصفحة */}
      <div className="text-center mb-8 pt-4">        
        <div className="flex justify-center items-center">
          <AnimatedStoreHeader 
            storeName={storeSettings.storeName}
            colorTheme={storeSettings.colorTheme}
            fontSettings={storeSettings.fontSettings}
          />
        </div>
      </div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto text-center"
      >
        {/* مقدمة مبسطة */}
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
            اختر تصنيفاً واضغط على وسط العجلة لاكتشاف المنتج المحظوظ!
          </p>
        </div>

        {/* اختيار التصنيف */}
        {categories.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="mb-8 max-w-md mx-auto"
          >
            <Card className="p-6 border-border/50 bg-card/50 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-4">
                <Filter className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold text-foreground">اختر التصنيف</h3>
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
                <p className="text-sm text-muted-foreground mt-2 text-center">
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

        {/* زر الملاحظات */}
        {storeSettings.storeOwnerId && (
          <div className="mt-12 flex justify-center">
            <Suspense fallback={<div className="animate-pulse bg-gray-200 h-10 rounded-md w-40" />}>
              <FeedbackTrigger 
                userId={storeSettings.storeOwnerId} 
                colorTheme={storeSettings.colorTheme}
              />
            </Suspense>
          </div>
        )}
      </motion.div>
    </ProductPreviewContainer>
  );
};

export default SpinWheelPage;