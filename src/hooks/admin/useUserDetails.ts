import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

interface UserDetails {
  id: string;
  email: string;
  created_at: string;
  store_name: string | null;
  status: "active" | "banned" | "pending" | "suspended";
  role: string;
  lastActivity: string;
  visitsCount: number;
  productsCount: number;
  phone: string | null;
  account_status: string | null;
  employee_system_enabled: boolean;
  employeesCount: number;
  tablesCount: number;
  ordersCount: number;
  feedbackCount: number;
  categoriesCount: number;
}

export const useUserDetails = (userId: string) => {
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (userId) {
      fetchUserDetails();
    }
  }, [userId]);

  const fetchUserDetails = async () => {
    setIsLoading(true);

    try {
      // جلب بيانات المستخدم الأساسية
      const { data: userData, error: userError } = await supabase.functions.invoke('get-service-key', {
        body: { action: 'get_users' }
      });
      
      if (userError) throw userError;

      const user = userData?.users?.find((u: any) => u.id === userId);
      if (!user) {
        throw new Error("المستخدم غير موجود");
      }

      // جلب إعدادات المتجر
      const { data: storeData, error: storeError } = await supabase
        .from('store_settings')
        .select('store_name, employee_system_enabled')
        .eq('user_id', userId)
        .single();

      // جلب عدد المنتجات
      const { count: productsCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      // جلب عدد الزوار
      const { data: viewsData } = await supabase
        .from('page_views')
        .select('view_count')
        .eq('user_id', userId)
        .single();

      // جلب دور المستخدم
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .single();

      // جلب عدد الموظفين
      const { count: employeesCount } = await supabase
        .from('employees')
        .select('*', { count: 'exact', head: true })
        .eq('store_owner_id', userId);

      // جلب عدد الطاولات
      const { count: tablesCount } = await supabase
        .from('tables')
        .select('*', { count: 'exact', head: true })
        .eq('store_owner_id', userId);

      // جلب عدد الطلبات
      const { count: ordersCount } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('store_owner_id', userId);

      // جلب عدد الشكاوى
      const { count: feedbackCount } = await supabase
        .from('feedback')
        .select('*', { count: 'exact', head: true })
        .eq('store_owner_id', userId);

      // جلب عدد التصنيفات
      const { count: categoriesCount } = await supabase
        .from('categories')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      const details: UserDetails = {
        id: user.id,
        email: user.email || '',
        created_at: user.created_at,
        store_name: storeData?.store_name || null,
        status: user.banned_until ? (user.user_metadata?.is_suspended ? "suspended" : "banned") : "active",
        role: roleData?.role || 'user',
        lastActivity: user.last_sign_in_at || user.created_at,
        visitsCount: viewsData?.view_count || 0,
        productsCount: productsCount || 0,
        phone: user.user_metadata?.phone || null,
        account_status: user.user_metadata?.account_status || 'active',
        employee_system_enabled: storeData?.employee_system_enabled || false,
        employeesCount: employeesCount || 0,
        tablesCount: tablesCount || 0,
        ordersCount: ordersCount || 0,
        feedbackCount: feedbackCount || 0,
        categoriesCount: categoriesCount || 0,
      };

      setUserDetails(details);
    } catch (error) {
      console.error("Error fetching user details:", error);
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "حدث خطأ أثناء جلب تفاصيل المستخدم"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return { userDetails, isLoading, refetch: fetchUserDetails };
};
