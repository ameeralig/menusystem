import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Json } from '@/integrations/supabase/types';

interface VisitorAnalytic {
  id: string;
  store_owner_id: string;
  session_id: string;
  action_type: string;
  action_data: Json;
  created_at: string;
}

interface AnalyticsSummary {
  totalVisitors: number;
  uniqueSessions: number;
  productViews: number;
  favorites: number;
  shares: number;
  searches: number;
  aiChats: number;
  cartAdds: number;
  feedbacks: number;
  gamesPlayed: number;
  menuDownloads: number;
  storeInfoViews: number;
  topProducts: { name: string; views: number }[];
  topCategories: { name: string; clicks: number }[];
  actionsByType: { type: string; count: number }[];
}

interface UseVisitorAnalyticsOptions {
  storeOwnerId?: string;
  limit?: number;
  fromDate?: Date;
  toDate?: Date;
}

const getJsonValue = (json: Json, key: string): string | undefined => {
  if (typeof json === 'object' && json !== null && !Array.isArray(json)) {
    const value = (json as Record<string, Json>)[key];
    return typeof value === 'string' ? value : undefined;
  }
  return undefined;
};

export const useVisitorAnalytics = (options: UseVisitorAnalyticsOptions = {}) => {
  const [analytics, setAnalytics] = useState<VisitorAnalytic[]>([]);
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('visitor_analytics')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(options.limit || 500);

      if (options.storeOwnerId) {
        query = query.eq('store_owner_id', options.storeOwnerId);
      }

      if (options.fromDate) {
        query = query.gte('created_at', options.fromDate.toISOString());
      }

      if (options.toDate) {
        query = query.lte('created_at', options.toDate.toISOString());
      }

      const { data, error } = await query;

      if (error) throw error;
      
      const analyticsData = data || [];
      setAnalytics(analyticsData);
      
      // حساب الإحصائيات
      const uniqueSessions = new Set(analyticsData.map(a => a.session_id)).size;
      const productViews = analyticsData.filter(a => a.action_type === 'product_view' || a.action_type === 'product_click').length;
      const favorites = analyticsData.filter(a => a.action_type === 'add_to_favorites').length;
      const shares = analyticsData.filter(a => a.action_type === 'share_menu' || a.action_type === 'share_product').length;
      const searches = analyticsData.filter(a => a.action_type === 'search').length;
      const aiChats = analyticsData.filter(a => a.action_type === 'ai_chat').length;
      const cartAdds = analyticsData.filter(a => a.action_type === 'add_to_cart').length;
      const feedbacks = analyticsData.filter(a => a.action_type === 'feedback_submit' || a.action_type === 'feedback_open').length;
      const gamesPlayed = analyticsData.filter(a => a.action_type === 'game_play' || a.action_type === 'game_open').length;
      const menuDownloads = analyticsData.filter(a => a.action_type === 'menu_download').length;
      const storeInfoViews = analyticsData.filter(a => a.action_type === 'store_info_view').length;

      // أكثر المنتجات مشاهدة
      const productViewsMap = new Map<string, number>();
      analyticsData
        .filter(a => (a.action_type === 'product_view' || a.action_type === 'product_click'))
        .forEach(a => {
          const name = getJsonValue(a.action_data, 'product_name');
          if (name) {
            productViewsMap.set(name, (productViewsMap.get(name) || 0) + 1);
          }
        });
      
      const topProducts = Array.from(productViewsMap.entries())
        .map(([name, views]) => ({ name, views }))
        .sort((a, b) => b.views - a.views)
        .slice(0, 10);

      // أكثر التصنيفات نقراً
      const categoryClicksMap = new Map<string, number>();
      analyticsData
        .filter(a => a.action_type === 'category_click')
        .forEach(a => {
          const name = getJsonValue(a.action_data, 'category_name');
          if (name) {
            categoryClicksMap.set(name, (categoryClicksMap.get(name) || 0) + 1);
          }
        });
      
      const topCategories = Array.from(categoryClicksMap.entries())
        .map(([name, clicks]) => ({ name, clicks }))
        .sort((a, b) => b.clicks - a.clicks)
        .slice(0, 10);

      // توزيع الأنشطة حسب النوع
      const actionTypesMap = new Map<string, number>();
      analyticsData.forEach(a => {
        actionTypesMap.set(a.action_type, (actionTypesMap.get(a.action_type) || 0) + 1);
      });
      
      const actionsByType = Array.from(actionTypesMap.entries())
        .map(([type, count]) => ({ type, count }))
        .sort((a, b) => b.count - a.count);

      setSummary({
        totalVisitors: analyticsData.length,
        uniqueSessions,
        productViews,
        favorites,
        shares,
        searches,
        aiChats,
        cartAdds,
        feedbacks,
        gamesPlayed,
        menuDownloads,
        storeInfoViews,
        topProducts,
        topCategories,
        actionsByType
      });
    } catch (error) {
      console.error('Error fetching visitor analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [options.storeOwnerId]);

  return { analytics, summary, isLoading, refetch: fetchAnalytics };
};
