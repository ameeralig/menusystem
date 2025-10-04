import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Employee } from "@/types/employee";

export const useEmployeeAuth = (storeOwnerId: string | null) => {
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const login = async (email: string, password: string) => {
    if (!storeOwnerId) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "معرف المتجر غير صحيح"
      });
      return false;
    }

    setIsLoading(true);
    try {
      // تسجيل دخول باستخدام Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (authError) throw authError;

      // التحقق من أن المستخدم موظف نشط في هذا المتجر
      const { data: employeeData, error: employeeError } = await supabase
        .from('employees')
        .select('*')
        .eq('user_id', authData.user.id)
        .eq('store_owner_id', storeOwnerId)
        .eq('is_active', true)
        .single();

      if (employeeError || !employeeData) {
        await supabase.auth.signOut();
        throw new Error("لا يمكنك الوصول إلى هذا المتجر");
      }

      setEmployee(employeeData);
      toast({
        title: "مرحباً",
        description: `أهلاً ${employeeData.full_name}`
      });
      return true;
    } catch (error: any) {
      console.error("Error logging in employee:", error);
      toast({
        variant: "destructive",
        title: "خطأ",
        description: error.message || "حدث خطأ أثناء تسجيل الدخول"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setEmployee(null);
  };

  // التحقق من الجلسة عند التحميل
  useEffect(() => {
    const checkSession = async () => {
      if (!storeOwnerId) return;

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: employeeData } = await supabase
          .from('employees')
          .select('*')
          .eq('user_id', user.id)
          .eq('store_owner_id', storeOwnerId)
          .eq('is_active', true)
          .single();

        if (employeeData) {
          setEmployee(employeeData);
        }
      }
    };

    checkSession();
  }, [storeOwnerId]);

  return {
    employee,
    isLoading,
    login,
    logout
  };
};
