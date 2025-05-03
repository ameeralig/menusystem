
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface AdminSession {
  email: string;
  isAdmin: boolean;
  timestamp: string;
}

export const useAdminAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const adminSessionStr = localStorage.getItem("adminSession");
    
    if (!adminSessionStr) {
      navigate("/admin");
      return;
    }
    
    try {
      const adminSession: AdminSession = JSON.parse(adminSessionStr);
      
      // التحقق من صلاحية بيانات الجلسة
      if (
        !adminSession ||
        adminSession.email !== "ameer_a16@icloud.com" ||
        !adminSession.isAdmin
      ) {
        localStorage.removeItem("adminSession");
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
      localStorage.removeItem("adminSession");
      navigate("/admin");
    }
  }, [navigate, toast]);

  const handleLogout = () => {
    localStorage.removeItem("adminSession");
    toast({
      title: "تم تسجيل الخروج",
      description: "تم تسجيل خروجك بنجاح من لوحة تحكم المسؤول."
    });
    navigate("/admin");
  };

  return { isAuthenticated, handleLogout };
};
