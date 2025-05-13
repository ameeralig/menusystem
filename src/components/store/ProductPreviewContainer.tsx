
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Product } from "@/types/product";
import { useStoreData } from "@/hooks/useStoreData";
import LoadingState from "@/components/store/LoadingState";
import StoreHeader from "@/components/store/StoreHeader";
import FeedbackDialog from "@/components/store/FeedbackDialog";
import BackButton from "@/components/store/BackButton";
import { supabase } from "@/integrations/supabase/client";

const ProductPreviewContainer = () => {
  const { slug } = useParams<{ slug: string }>();
  const { storeData, loading, error } = useStoreData(slug || "");
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoadingProduct, setIsLoadingProduct] = useState(true);

  useEffect(() => {
    const fetchProductData = async () => {
      try {
        if (!storeData || !storeData.user) return;

        // البحث عن المنتج بناءً على الرابط المخصص
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .eq("user_id", storeData.user.id)
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
        if (storeData.user.id) {
          try {
            const response = await supabase.functions.invoke('increment-page-view', {
              body: { userId: storeData.user.id }
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

    if (!loading && storeData) {
      fetchProductData();
    }
  }, [storeData, loading, slug]);

  if (loading) {
    return <LoadingState />;
  }

  if (error || !storeData) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
        <h1 className="text-2xl font-bold mb-4">هذا المتجر غير موجود</h1>
        <p className="text-muted-foreground mb-8">
          تأكد من الرابط وحاول مرة أخرى، أو قم بإنشاء متجرك الخاص
        </p>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-background ${storeData.settings?.font_family || ''}`}
      style={{ 
        // استخدام لون الخلفية من إعدادات المتجر إذا كان متاحًا
        backgroundColor: storeData.settings?.background_color || 'inherit',
        color: storeData.settings?.text_color || 'inherit'
      }}
    >
      <StoreHeader storeData={storeData} />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-4">
          <BackButton />
        </div>
        
        {isLoadingProduct ? (
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
              
              {product.features && (
                <div className="mb-6">
                  <h2 className="font-semibold mb-2 text-lg">المميزات</h2>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    {product.features.split('\n').filter(Boolean).map((feature, index) => (
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
      
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2">
        <FeedbackDialog userId={storeData.user?.id} />
      </div>
    </div>
  );
};

export default ProductPreviewContainer;
