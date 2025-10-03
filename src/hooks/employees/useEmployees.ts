import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Employee } from "@/types/employee";

export const useEmployees = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchEmployees = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('store_owner_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEmployees(data || []);
    } catch (error: any) {
      console.error("Error fetching employees:", error);
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "حدث خطأ أثناء جلب بيانات الموظفين"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addEmployee = async (employeeData: Omit<Employee, 'id' | 'store_owner_id' | 'created_at' | 'updated_at' | 'user_id'> & { password: string }) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // إنشاء حساب Auth للموظف
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: employeeData.email,
        password: employeeData.password,
        options: {
          data: {
            full_name: employeeData.full_name,
            role: 'employee'
          }
        }
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("فشل إنشاء حساب الموظف");

      // إضافة الموظف لجدول employees
      const { phone, is_active, full_name, email } = employeeData;
      const { error } = await supabase
        .from('employees')
        .insert({
          store_owner_id: user.id,
          full_name,
          email,
          phone,
          is_active,
          user_id: authData.user.id
        });

      if (error) throw error;

      toast({
        title: "تم بنجاح",
        description: "تم إضافة الموظف بنجاح. يمكنه الآن تسجيل الدخول."
      });

      await fetchEmployees();
      return true;
    } catch (error: any) {
      console.error("Error adding employee:", error);
      toast({
        variant: "destructive",
        title: "خطأ",
        description: error.message || "حدث خطأ أثناء إضافة الموظف"
      });
      return false;
    }
  };

  const updateEmployee = async (id: string, updates: Partial<Employee>) => {
    try {
      const { error } = await supabase
        .from('employees')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "تم بنجاح",
        description: "تم تحديث بيانات الموظف بنجاح"
      });

      await fetchEmployees();
      return true;
    } catch (error: any) {
      console.error("Error updating employee:", error);
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "حدث خطأ أثناء تحديث بيانات الموظف"
      });
      return false;
    }
  };

  const deleteEmployee = async (id: string) => {
    try {
      const { error } = await supabase
        .from('employees')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "تم بنجاح",
        description: "تم حذف الموظف بنجاح"
      });

      await fetchEmployees();
      return true;
    } catch (error: any) {
      console.error("Error deleting employee:", error);
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "حدث خطأ أثناء حذف الموظف"
      });
      return false;
    }
  };

  const toggleEmployeeStatus = async (id: string, currentStatus: boolean) => {
    return await updateEmployee(id, { is_active: !currentStatus });
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  return {
    employees,
    isLoading,
    fetchEmployees,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    toggleEmployeeStatus
  };
};
