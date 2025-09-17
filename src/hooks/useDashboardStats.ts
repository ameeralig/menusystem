
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface DashboardStats {
  totalViews: number;
  totalProducts: number;
  activeProducts: number;
  popularProducts: number;
  newProducts: number;
  wheelSpins: number;
  todayViews: number;
  weeklyViews: number;
  monthlyViews: number;
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
    wheelSpins: 0,
    todayViews: 0,
    weeklyViews: 0,
    monthlyViews: 0,
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

      console.log("جلب إحصائيات المشاهدات للمستخدم:", user.id);

      // جلب إحصائيات المشاهدات
      const { data: viewsData, error: viewsError } = await supabase
        .from("page_views")
        .select("view_count, last_viewed_at")
        .eq("user_id", user.id);
      
      if (viewsError) {
        console.error("خطأ في جلب المشاهدات:", viewsError);
        throw viewsError;
      }

      console.log("بيانات المشاهدات المستلمة:", viewsData);

      // جلب إحصائيات المنتجات
      const { data: productsData, error: productsError } = await supabase
        .from("products")
        .select("is_available, is_popular, is_new, created_at")
        .eq("user_id", user.id);
      
      if (productsError) {
        console.error("خطأ في جلب المنتجات:", productsError);
        throw productsError;
      }

      console.log("بيانات المنتجات المستلمة:", productsData);

      // حساب الإحصائيات
      const totalViews = viewsData?.reduce((sum, item) => sum + (item.view_count || 0), 0) || 0;
      const totalProducts = productsData?.length || 0;
      const activeProducts = productsData?.filter(product => product.is_available).length || 0;
      const popularProducts = productsData?.filter(product => product.is_popular).length || 0;
      const newProducts = productsData?.filter(product => product.is_new).length || 0;

      const wheelSpins = Math.floor(totalViews / 10) || 0; // تقدير عدد دورات عجلة الحظ

      // حساب المشاهدات حسب الفترة الزمنية
      const currentDate = new Date();
      const todayStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
      const weekStart = new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);

      const todayViews = viewsData?.filter(view => {
        if (!view.last_viewed_at) return false;
        const viewDate = new Date(view.last_viewed_at);
        return viewDate >= todayStart;
      }).reduce((sum, view) => sum + (view.view_count || 0), 0) || 0;

      const weeklyViews = viewsData?.filter(view => {
        if (!view.last_viewed_at) return false;
        const viewDate = new Date(view.last_viewed_at);
        return viewDate >= weekStart;
      }).reduce((sum, view) => sum + (view.view_count || 0), 0) || 0;

      const monthlyViews = viewsData?.filter(view => {
        if (!view.last_viewed_at) return false;
        const viewDate = new Date(view.last_viewed_at);
        return viewDate >= monthStart;
      }).reduce((sum, view) => sum + (view.view_count || 0), 0) || 0;

      console.log("الإحصائيات المحسوبة:", {
        totalViews,
        totalProducts,
        activeProducts,
        popularProducts,
        newProducts
      });

      setStats({
        totalViews,
        totalProducts,
        activeProducts,
        popularProducts,
        newProducts,
        wheelSpins,
        todayViews,
        weeklyViews,
        monthlyViews,
      });

      // إنشاء بيانات المشاهدات اليومية للأسبوع الماضي
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
    
    // تحديث الإحصائيات كل 30 ثانية لضمان الحصول على أحدث البيانات
    const interval = setInterval(fetchStats, 30000);
    
    return () => clearInterval(interval);
  }, []);

  return {
    stats,
    dailyViewsData,
    loading,
    refetch: fetchStats,
  };
};
