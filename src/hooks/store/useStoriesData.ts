import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Product } from "@/types/product";
import { CategoryImage } from "@/types/categoryImage";

export interface StoryItem {
  id: string;
  type: "product" | "custom" | "category";
  product_id?: string | null;
  product?: Product | null;
  image_url: string;
  title?: string | null;
  caption?: string | null;
  link_url?: string | null;
  expires_at?: string;
  is_auto?: boolean;
}

interface Options {
  storeOwnerId?: string;
  enabled: boolean;
  autoGenerate: boolean;
  products: Product[];
  categoryImages?: CategoryImage[];
  onCategoryClick?: (category: string) => void;
}

export const useStoriesData = ({
  storeOwnerId,
  enabled,
  autoGenerate,
  products,
  categoryImages,
}: Options) => {
  const [dbStories, setDbStories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchStories = useCallback(async () => {
    if (!storeOwnerId || !enabled) {
      setDbStories([]);
      return;
    }
    setLoading(true);
    // حذف تلقائي للستوريز المنتهية (best-effort)
    supabase.rpc("cleanup_expired_stories" as any).then(() => {}, () => {});
    const { data } = await supabase
      .from("product_stories" as any)
      .select("*")
      .eq("store_owner_id", storeOwnerId)
      .gt("expires_at", new Date().toISOString())
      .order("display_order", { ascending: true });
    setDbStories(data || []);
    setLoading(false);
  }, [storeOwnerId, enabled]);

  useEffect(() => {
    fetchStories();
    if (!storeOwnerId) return;
    const ch = supabase
      .channel(`stories-${storeOwnerId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "product_stories", filter: `store_owner_id=eq.${storeOwnerId}` },
        () => fetchStories()
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [storeOwnerId, fetchStories]);

  // بناء قائمة الستوريز النهائية
  const stories: StoryItem[] = (() => {
    if (!enabled) return [];

    const items: StoryItem[] = [];

    // 1) ستوريز قاعدة البيانات
    for (const s of dbStories) {
      const p = s.product_id ? products.find((pp) => pp.id === s.product_id) : null;
      items.push({
        id: s.id,
        type: s.type as any,
        product_id: s.product_id,
        product: p,
        image_url: s.image_url || p?.image_url || "",
        title: s.title,
        caption: s.caption,
        link_url: s.link_url,
        expires_at: s.expires_at,
      });
    }

    // 2) التوليد التلقائي عند عدم وجود ستوريز DB
    if (autoGenerate && items.length === 0) {
      // أ) تصنيف لكل فئة لها صورة
      const cats = (categoryImages || [])
        .filter((c) => c.image_url)
        .slice(0, 8);
      for (const c of cats) {
        items.push({
          id: `auto-cat-${c.category}`,
          type: "category",
          image_url: c.image_url,
          title: c.category,
          caption: `استكشف ${c.category}`,
          is_auto: true,
        });
      }

      // ب) أحدث/أفضل المنتجات
      const featured = products
        .filter((p) => (p.is_new || p.is_popular) && p.image_url && p.is_available !== false)
        .slice(0, 10);
      for (const p of featured) {
        items.push({
          id: `auto-prod-${p.id}`,
          type: "product",
          product_id: p.id,
          product: p,
          image_url: p.image_url!,
          title: p.name,
          caption: p.description || undefined,
          is_auto: true,
        });
      }
    }

    return items;
  })();

  return { stories, dbStories, loading, refetch: fetchStories };
};
