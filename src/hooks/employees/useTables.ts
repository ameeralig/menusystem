import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Table } from "@/types/employee";

export const useTables = () => {
  const [tables, setTables] = useState<Table[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchTables = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from('tables')
        .select('*')
        .eq('store_owner_id', user.id)
        .order('table_number', { ascending: true });

      if (error) throw error;
      setTables(data || []);
    } catch (error: any) {
      console.error("Error fetching tables:", error);
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "حدث خطأ أثناء جلب بيانات الطاولات"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addTable = async (tableData: Omit<Table, 'id' | 'store_owner_id' | 'created_at' | 'is_occupied' | 'current_order_id'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { error } = await supabase
        .from('tables')
        .insert({
          store_owner_id: user.id,
          ...tableData,
          is_occupied: false,
          current_order_id: null
        });

      if (error) throw error;

      toast({
        title: "تم بنجاح",
        description: "تم إضافة الطاولة بنجاح"
      });

      await fetchTables();
      return true;
    } catch (error: any) {
      console.error("Error adding table:", error);
      toast({
        variant: "destructive",
        title: "خطأ",
        description: error.message || "حدث خطأ أثناء إضافة الطاولة"
      });
      return false;
    }
  };

  const updateTable = async (id: string, updates: Partial<Table>) => {
    try {
      const { error } = await supabase
        .from('tables')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "تم بنجاح",
        description: "تم تحديث بيانات الطاولة بنجاح"
      });

      await fetchTables();
      return true;
    } catch (error: any) {
      console.error("Error updating table:", error);
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "حدث خطأ أثناء تحديث بيانات الطاولة"
      });
      return false;
    }
  };

  const deleteTable = async (id: string) => {
    try {
      const { error } = await supabase
        .from('tables')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "تم بنجاح",
        description: "تم حذف الطاولة بنجاح"
      });

      await fetchTables();
      return true;
    } catch (error: any) {
      console.error("Error deleting table:", error);
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "حدث خطأ أثناء حذف الطاولة"
      });
      return false;
    }
  };

  useEffect(() => {
    fetchTables();
  }, []);

  return {
    tables,
    isLoading,
    fetchTables,
    addTable,
    updateTable,
    deleteTable
  };
};
