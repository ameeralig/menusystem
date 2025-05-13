
import { useEffect, useState, ReactNode } from "react";
import { useParams } from "react-router-dom";
import { Product } from "@/types/product";
import { useStoreData } from "@/hooks/useStoreData";
import LoadingState from "@/components/store/LoadingState";
import StoreHeader from "@/components/store/StoreHeader";
import FeedbackDialog from "@/components/store/FeedbackDialog";
import BackButton from "@/components/store/BackButton";
import { supabase } from "@/integrations/supabase/client";
import { FontSettings } from "@/types/store";

// إضافة واجهة للمكون لدعم الـ children
interface ProductPreviewContainerProps {
  colorTheme?: string; 
  bannerUrl?: string | null;
  fontSettings?: FontSettings;
  containerHeight?: string;
  children?: ReactNode;
}

const ProductPreviewContainer = (props?: ProductPreviewContainerProps) => {
  const { slug } = useParams<{ slug: string }>();
  const { storeData, isLoading } = useStoreData(slug || "");
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoadingProduct, setIsLoadingProduct] = useState(true);

  // استخدم القيم من props إذا تم تمريرها، وإلا استخدم القيم من storeData
  const colorTheme = props?.colorTheme || storeData.colorTheme;
  const bannerUrl = props?.bannerUrl || storeData.bannerUrl;
  const fontSettings = props?.fontSettings || storeData.fontSettings;
  const containerHeight = props?.containerHeight || "auto";

  // إذا تم تمرير children استخدمهم بدلاً من عرض المنتج
  const hasCustomContent = !!props?.children;

  useEffect(() => {
    // فقط استدعاء API إذا لم يكن هناك children
    if (hasCustomContent) {
      setIsLoadingProduct(false);
      return;
    }

    const fetchProductData = async () => {
      try {
        if (!storeData || !storeData.storeOwnerId) return;

        // البحث عن المنتج بناءً على الرابط المخصص
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .eq("user_id", storeData.storeOwnerId)
          .eq("published", true)
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        if (error) {
          console.error("Error fetching product:", error);
          return;
        }

        setProduct(data as Product);

        // استدعاء وظيفة زيادة عداد المشاهدات
        if (storeData.storeOwnerId) {
          try {
            const response = await supabase.functions.invoke('increment-page-view', {
              body: { userId: storeData.storeOwnerId }
            });
            
            console.log('تم تحديث عداد المشاهدات:', response);
          } catch (viewError) {
            console.error('خطأ في تحديث عداد المشاهدات:', viewError);
          }
        }

      } catch (error) {
        console.error("Error:", error);
      } finally {
        setIsLoadingProduct(false);
      }
    };

    if (!isLoading && storeData && !hasCustomContent) {
      fetchProductData();
    }
  }, [storeData, isLoading, slug, hasCustomContent]);

  if (isLoading && !hasCustomContent) {
    return <LoadingState />;
  }

  if (!storeData && !hasCustomContent) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
        <h1 className="text-2xl font-bold mb-4">هذا المتجر غير موجود</h1>
        <p className="text-muted-foreground mb-8">
          تأكد من الرابط وحاول مرة أخرى، أو قم بإنشاء متجرك الخاص
        </p>
      </div>
    );
  }

  const handleBackClick = () => {
    window.history.back();
  };

  const fontFamily = fontSettings?.generalText?.family || '';

  return (
    <div 
      className={`min-h-screen bg-background ${fontFamily}`}
      style={{ 
        height: containerHeight,
        backgroundColor: colorTheme || 'inherit',
        color: 'inherit'
      }}
    >
      <StoreHeader 
        storeName={storeData?.storeName || props?.colorTheme || ''} 
        colorTheme={colorTheme} 
        fontSettings={fontSettings}
      />
      
      <div className="container mx-auto px-4 py-8">
        {!hasCustomContent && (
          <div className="mb-4">
            <BackButton onClick={handleBackClick} />
          </div>
        )}
        
        {hasCustomContent ? (
          props?.children
        ) : isLoadingProduct ? (
          <div className="flex justify-center items-center py-16">
            <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : product ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden max-w-4xl mx-auto">
            {product.image_url && (
              <div className="aspect-video w-full">
                <img 
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h1 className="text-2xl font-bold">{product.name}</h1>
                <span className="text-xl font-bold text-primary">
                  {product.price.toLocaleString()} د.ع
                </span>
              </div>
              
              {product.description && (
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  {product.description}
                </p>
              )}
              
              {/* التعامل مع الميزات إذا كان هناك أسطر متعددة في الوصف */}
              {product.description && product.description.includes('\n') && (
                <div className="mb-6">
                  <h2 className="font-semibold mb-2 text-lg">المميزات</h2>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    {product.description.split('\n').filter(Boolean).map((feature, index) => (
                      <li key={index}>{feature.trim()}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {product.category && (
                <div className="text-sm text-muted-foreground mt-6">
                  التصنيف: <span className="font-medium">{product.category}</span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-16">
            <h2 className="text-xl font-medium mb-2">لم يتم العثور على المنتج</h2>
            <p className="text-muted-foreground">
              المنتج غير موجود أو تم إزالته
            </p>
          </div>
        )}
      </div>
      
      {!hasCustomContent && storeData?.storeOwnerId && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2">
          <FeedbackDialog userId={storeData.storeOwnerId} />
        </div>
      )}
    </div>
  );
};

export default ProductPreviewContainer;
