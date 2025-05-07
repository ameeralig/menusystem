
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { CategoryImage } from "@/types/categoryImage";

export const useCategoryImages = (userId: string | null, forceRefresh: number) => {
  const [categoryImages, setCategoryImages] = useState<CategoryImage[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const fetchCategoryImages = async () => {
      if (!userId) return;

      try {
        const { data, error } = await supabase
          .from("category_images")
          .select("*")
          .eq("user_id", userId);

        if (error) {
          throw error;
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

        setCategoryImages(updatedImages);
      } catch (error: any) {
        console.error("Error fetching category images:", error);
        toast({
          title: "خطأ في جلب صور التصنيفات",
          description: error.message,
          variant: "destructive"
        });
      }
    };

    fetchCategoryImages();
  }, [userId, forceRefresh, toast]);

  return categoryImages;
};
