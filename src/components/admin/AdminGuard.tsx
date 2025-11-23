import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { Spinner } from "@/components/ui/spinner";
import { supabase } from "@/integrations/supabase/client";

const AdminGuard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const checkAdminAccess = async () => {
      try {
        // التحقق من جلسة المستخدم الحالية
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user) {
          console.error("المستخدم غير مسجل الدخول");
          setIsAuthorized(false);
          setIsLoading(false);
          return;
        }
        
        // التحقق من دور المستخدم
        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .single();
        
        if (roleError) {
          console.error("خطأ في جلب دور المستخدم:", roleError);
          setIsAuthorized(false);
          setIsLoading(false);
          return;
        }
        
        // التحقق من أن المستخدم لديه دور admin
        if (roleData && roleData.role === 'admin') {
          setIsAuthorized(true);
        } else {
          console.error("المستخدم ليس لديه صلاحيات المسؤول");
          setIsAuthorized(false);
        }
      } catch (error) {
        console.error("خطأ في التحقق من صلاحية المسؤول:", error);
        setIsAuthorized(false);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAdminAccess();
  }, [location.pathname]);
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner className="w-8 h-8" />
      </div>
    );
  }
  
  return isAuthorized ? <Outlet /> : <Navigate to="/admin" replace />;
};

export default AdminGuard;
