import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

interface DailySale {
  id: string;
  employee_id: string;
  employee_name: string;
  sale_date: string;
  total_orders: number;
  total_sales: number;
}

interface EmployeeSalesStats {
  totalSales: number;
  totalOrders: number;
  dailySales: DailySale[];
  topEmployee: { name: string; sales: number } | null;
}

export const useEmployeeSales = (storeOwnerId?: string) => {
  const [stats, setStats] = useState<EmployeeSalesStats>({
    totalSales: 0,
    totalOrders: 0,
    dailySales: [],
    topEmployee: null
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchSalesData = async () => {
    if (!storeOwnerId) return;
    
    setIsLoading(true);
    try {
      // جلب بيانات المبيعات اليومية لآخر 7 أيام
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const dateStr = sevenDaysAgo.toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('employee_daily_sales')
        .select('*')
        .eq('store_owner_id', storeOwnerId)
        .gte('sale_date', dateStr)
        .order('sale_date', { ascending: false });

      if (error) throw error;

      const salesData = data || [];
      
      // حساب الإحصائيات
      const totalSales = salesData.reduce((sum, item) => sum + Number(item.total_sales), 0);
      const totalOrders = salesData.reduce((sum, item) => sum + item.total_orders, 0);
      
      // تجميع المبيعات حسب الموظف
      const employeeSales: Record<string, { name: string; sales: number }> = {};
      salesData.forEach(item => {
        if (!employeeSales[item.employee_id]) {
          employeeSales[item.employee_id] = { name: item.employee_name, sales: 0 };
        }
        employeeSales[item.employee_id].sales += Number(item.total_sales);
      });
      
      // إيجاد أفضل موظف
      let topEmployee: { name: string; sales: number } | null = null;
      Object.values(employeeSales).forEach(emp => {
        if (!topEmployee || emp.sales > topEmployee.sales) {
          topEmployee = emp;
        }
      });

      setStats({
        totalSales,
        totalOrders,
        dailySales: salesData,
        topEmployee
      });
    } catch (error) {
      console.error("Error fetching sales data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSalesData();
  }, [storeOwnerId]);

  return {
    stats,
    isLoading,
    refetch: fetchSalesData
  };
};
