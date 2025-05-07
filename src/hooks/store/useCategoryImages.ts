
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { CategoryImage } from "@/types/categoryImage";
import { toast } from "sonner";

export const useCategoryImages = (userId: string | null, forceRefresh: number) => {
  const [categoryImages, setCategoryImages] = useState<CategoryImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast: uiToast } = useToast();

  useEffect(() => {
    const fetchCategoryImages = async () => {
      try {
        if (!userId) {
          console.log("No userId provided to useCategoryImages, skipping fetch");
          setIsLoading(false);
          return;
        }

        console.log("Fetching category images for userId:", userId);
        
        const { data, error } = await supabase
          .from("category_images")
          .select("*")
          .eq("user_id", userId);

        if (error) {
          console.error("Error fetching category images:", error);
          toast.error("خطأ في جلب صور التصنيفات");
          setIsLoading(false);
          return;
        }

        const uniqueTimestamp = forceRefresh;
        const cacheBreaker = `t=${uniqueTimestamp}&nocache=${Math.random()}`;
        
        const updatedImages = (data || []).map(img => {
          if (img.image_url) {
            const imageBaseUrl = img.image_url.split('?')[0];
            return {
              ...img,
              image_url: `${imageBaseUrl}?${cacheBreaker}`
            };
          }
          return img;
        });

        console.log(`Fetched ${updatedImages.length} category images successfully`);
        setCategoryImages(updatedImages);
        setIsLoading(false);
      } catch (error: any) {
        console.error("Error fetching category images:", error);
        toast.error("خطأ في جلب صور التصنيفات");
        setIsLoading(false);
      }
    };

    fetchCategoryImages();
  }, [userId, forceRefresh, uiToast]);

  return { categoryImages, isLoading };
};
