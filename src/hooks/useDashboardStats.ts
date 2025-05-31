
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface DashboardStats {
  totalViews: number;
  totalProducts: number;
  activeProducts: number;
  popularProducts: number;
  newProducts: number;
}

export interface DailyViewData {
  date: string;
  views: number;
}

export const useDashboardStats = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalViews: 0,
    totalProducts: 0,
    activeProducts: 0,
    popularProducts: 0,
    newProducts: 0,
  });
  const [dailyViewsData, setDailyViewsData] = useState<DailyViewData[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchStats = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("المستخدم غير مسجل الدخول");
      }

      // جلب إحصائيات المشاهدات
      const { data: viewsData, error: viewsError } = await supabase
        .from("page_views")
        .select("view_count, last_viewed_at")
        .eq("user_id", user.id);
      
      if (viewsError) throw viewsError;

      // جلب إحصائيات المنتجات
      const { data: productsData, error: productsError } = await supabase
        .from("products")
        .select("is_available, is_popular, is_new, created_at")
        .eq("user_id", user.id);
      
      if (productsError) throw productsError;

      // حساب الإحصائيات
      const totalViews = viewsData?.reduce((sum, item) => sum + (item.view_count || 0), 0) || 0;
      const totalProducts = productsData?.length || 0;
      const activeProducts = productsData?.filter(product => product.is_available).length || 0;
      const popularProducts = productsData?.filter(product => product.is_popular).length || 0;
      const newProducts = productsData?.filter(product => product.is_new).length || 0;

      setStats({
        totalViews,
        totalProducts,
        activeProducts,
        popularProducts,
        newProducts,
      });

      // إنشاء بيانات المشاهدات اليومية
      const today = new Date();
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date(today);
        date.setDate(today.getDate() - (6 - i));
        return date;
      });

      const dailyData = last7Days.map(date => {
        const formattedDate = `${date.getDate()}/${date.getMonth() + 1}`;
        
        // حساب المشاهدات لهذا اليوم
        const dayViews = viewsData?.filter(view => {
          if (!view.last_viewed_at) return false;
          const viewDate = new Date(view.last_viewed_at);
          return viewDate.toDateString() === date.toDateString();
        }).reduce((sum, view) => sum + (view.view_count || 0), 0) || 0;
        
        return {
          date: formattedDate,
          views: dayViews,
        };
      });
      
      setDailyViewsData(dailyData);

    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      toast({
        title: "حدث خطأ",
        description: "لم نتمكن من تحميل الإحصائيات",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return {
    stats,
    dailyViewsData,
    loading,
    refetch: fetchStats,
  };
};
