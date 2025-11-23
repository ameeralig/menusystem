
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const useAdminAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          navigate("/admin");
          return;
        }
        
        // التحقق من دور المستخدم
        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .single();
        
        if (roleError || !roleData || roleData.role !== 'admin') {
          toast({
            variant: "destructive",
            title: "خطأ في الصلاحيات",
            description: "غير مصرح بالوصول إلى لوحة التحكم."
          });
          navigate("/admin");
        } else {
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error("خطأ في التحقق من جلسة المسؤول:", error);
        navigate("/admin");
      }
    };
    
    checkAuth();
  }, [navigate, toast]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "تم تسجيل الخروج",
      description: "تم تسجيل خروجك بنجاح من لوحة تحكم المسؤول."
    });
    navigate("/admin");
  };

  return { isAuthenticated, handleLogout };
};
