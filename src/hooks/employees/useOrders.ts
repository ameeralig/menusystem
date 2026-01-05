import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { CartItem } from "./useCart";
import { Order } from "@/types/employee";

interface OrderData {
  employee_id: string;
  table_id: string | null;
  table_number: string | null;
  total_amount: number;
  notes?: string;
  items: {
    product_id: string;
    product_name: string;
    quantity: number;
    unit_price: number;
    subtotal: number;
    notes?: string | null;
  }[];
}

export const useOrders = (storeOwnerId?: string, employeeId?: string) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();

  // جلب طلبات الموظف
  const fetchOrders = useCallback(async () => {
    if (!employeeId) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("employee_id", employeeId)
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;
      
      // تحويل البيانات لتتوافق مع النوع
      const ordersWithStatus = (data || []).map(order => ({
        ...order,
        status: (order as any).status || 'pending',
      })) as Order[];
      
      setOrders(ordersWithStatus);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setIsLoading(false);
    }
  }, [employeeId]);

  // جلب الطلبات عند التحميل
  useEffect(() => {
    if (employeeId) {
      fetchOrders();
    }
  }, [employeeId, fetchOrders]);

  const createOrder = async (orderData: OrderData) => {
    if (!storeOwnerId) {
      throw new Error("Store owner ID is required");
    }

    setIsCreating(true);
    try {
      // إنشاء الطلب
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          store_owner_id: storeOwnerId,
          employee_id: orderData.employee_id,
          table_id: orderData.table_id,
          table_number: orderData.table_number,
          total_amount: orderData.total_amount,
          final_amount: orderData.total_amount,
          notes: orderData.notes || null,
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // إضافة عناصر الطلب
      const orderItems = orderData.items.map((item) => ({
        order_id: order.id,
        product_id: item.product_id,
        product_name: item.product_name,
        quantity: item.quantity,
        unit_price: item.unit_price,
        subtotal: item.subtotal,
        notes: item.notes || null,
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // تحديث سجل المبيعات اليومي للموظف
      await updateEmployeeDailySales(storeOwnerId, orderData.employee_id, orderData.total_amount);

      // إعادة جلب الطلبات
      await fetchOrders();

      return order;
    } catch (error: any) {
      console.error("Error creating order:", error);
      throw error;
    } finally {
      setIsCreating(false);
    }
  };

  const getOrderWithItems = async (orderId: string) => {
    try {
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .select("*")
        .eq("id", orderId)
        .single();

      if (orderError) throw orderError;

      const { data: items, error: itemsError } = await supabase
        .from("order_items")
        .select("*")
        .eq("order_id", orderId);

      if (itemsError) throw itemsError;

      return { order, items };
    } catch (error: any) {
      console.error("Error fetching order:", error);
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "حدث خطأ أثناء جلب الطلب",
      });
      return null;
    }
  };

  const updateEmployeeDailySales = async (
    storeOwnerId: string,
    employeeId: string,
    orderAmount: number
  ) => {
    try {
      const today = new Date().toISOString().split('T')[0];

      // الحصول على اسم الموظف
      const { data: employee } = await supabase
        .from("employees")
        .select("full_name")
        .eq("id", employeeId)
        .single();

      if (!employee) return;

      // التحقق من وجود سجل لهذا اليوم
      const { data: existing } = await supabase
        .from("employee_daily_sales")
        .select("*")
        .eq("employee_id", employeeId)
        .eq("sale_date", today)
        .single();

      if (existing) {
        // تحديث السجل الموجود
        await supabase
          .from("employee_daily_sales")
          .update({
            total_orders: existing.total_orders + 1,
            total_sales: Number(existing.total_sales) + orderAmount,
          })
          .eq("id", existing.id);
      } else {
        // إنشاء سجل جديد
        await supabase
          .from("employee_daily_sales")
          .insert({
            store_owner_id: storeOwnerId,
            employee_id: employeeId,
            employee_name: employee.full_name,
            sale_date: today,
            total_orders: 1,
            total_sales: orderAmount,
          });
      }
    } catch (error) {
      console.error("Error updating daily sales:", error);
    }
  };

  return {
    orders,
    isLoading,
    isCreating,
    createOrder,
    getOrderWithItems,
    refetchOrders: fetchOrders,
  };
};
