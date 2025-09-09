import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface FastStoreData {
  user_id: string;
  store_name: string | null;
  slug: string;
}

export const useFastStoreIdentification = (slug: string | undefined) => {
  const [storeData, setStoreData] = useState<FastStoreData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const identifyStore = async () => {
      if (!slug) {
        setError("لم يتم توفير رابط المتجر");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // استعلام محسن للحصول على البيانات الأساسية للمستخدم فقط
        const { data, error } = await supabase
          .from("store_settings")
          .select("user_id, store_name, slug")
          .eq("slug", slug.trim())
          .maybeSingle();

        if (error) {
          console.error("خطأ في جلب بيانات المتجر:", error);
          setError("حدث خطأ في الوصول للمتجر");
          return;
        }

        if (!data) {
          setError("المتجر غير موجود أو تم حذفه");
          return;
        }

        console.log("تم التعرف على المتجر بنجاح:", data);
        setStoreData(data);

      } catch (error: any) {
        console.error("خطأ غير متوقع:", error);
        setError("حدث خطأ غير متوقع");
      } finally {
        setIsLoading(false);
      }
    };

    identifyStore();
  }, [slug]);

  return {
    storeData,
    isLoading,
    error,
    userId: storeData?.user_id || null,
    storeName: storeData?.store_name || null
  };
};