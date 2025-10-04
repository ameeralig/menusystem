import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { CartItem } from "./useCart";
import { Order, OrderItem } from "@/types/employee";

export const useOrders = () => {
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();

  const createOrder = async (
    storeOwnerId: string,
    employeeId: string,
    tableId: string,
    items: CartItem[],
    customerName?: string,
    customerPhone?: string
  ) => {
    setIsCreating(true);
    try {
      // حساب الإجمالي
      const totalAmount = items.reduce(
        (sum, item) => sum + Number(item.product.price) * item.quantity,
        0
      );

      // إنشاء الطلب
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          store_owner_id: storeOwnerId,
          employee_id: employeeId,
          table_id: tableId,
          status: "pending",
          total_amount: totalAmount,
          final_amount: totalAmount,
          customer_name: customerName || null,
          customer_phone: customerPhone || null,
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // إضافة عناصر الطلب
      const orderItems = items.map((item) => ({
        order_id: order.id,
        product_id: item.product.id,
        product_name: item.product.name,
        quantity: item.quantity,
        unit_price: Number(item.product.price),
        subtotal: Number(item.product.price) * item.quantity,
        notes: item.notes || null,
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);

      if (itemsError) throw itemsError;

      toast({
        title: "تم إنشاء الطلب",
        description: "تم إنشاء الطلب بنجاح",
      });

      return order;
    } catch (error: any) {
      console.error("Error creating order:", error);
      toast({
        variant: "destructive",
        title: "خطأ",
        description: error.message || "حدث خطأ أثناء إنشاء الطلب",
      });
      return null;
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

  return {
    createOrder,
    getOrderWithItems,
    isCreating,
  };
};
