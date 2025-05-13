
import { useEffect, useState } from "react";
import { Product } from "@/types/product";
import { supabase } from "@/integrations/supabase/client";
import BackButton from "@/components/store/BackButton";
import ProductView from "./ProductView";
import FeedbackDialog from "@/components/store/FeedbackDialog";

interface ProductPreviewContentProps {
  storeOwnerId: string | null;
}

const ProductPreviewContent = ({ storeOwnerId }: ProductPreviewContentProps) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoadingProduct, setIsLoadingProduct] = useState(true);

  const handleBackClick = () => {
    window.history.back();
  };

  useEffect(() => {
    const fetchProductData = async () => {
      try {
        if (!storeOwnerId) {
          setIsLoadingProduct(false);
          return;
        }

        // البحث عن المنتج بناءً على معرّف المالك
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .eq("user_id", storeOwnerId)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error) {
          console.error("Error fetching product:", error);
          setIsLoadingProduct(false);
          return;
        }

        setProduct(data as Product | null);

        // استدعاء وظيفة زيادة عداد المشاهدات
        if (storeOwnerId) {
          try {
            const response = await supabase.functions.invoke('increment-page-view', {
              body: { userId: storeOwnerId }
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

    if (storeOwnerId) {
      fetchProductData();
    } else {
      setIsLoadingProduct(false);
    }
  }, [storeOwnerId]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-4">
        <BackButton onClick={handleBackClick} />
      </div>
      
      <ProductView 
        product={product}
        isLoading={isLoadingProduct}
      />
      
      {storeOwnerId && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2">
          <FeedbackDialog userId={storeOwnerId} />
        </div>
      )}
    </div>
  );
};

export default ProductPreviewContent;
