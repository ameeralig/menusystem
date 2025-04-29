
import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { Spinner } from "@/components/ui/spinner";

interface AdminSession {
  email: string;
  timestamp: string;
  isAdmin: boolean;
}

const AdminGuard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const checkAdminAccess = () => {
      try {
        const adminSessionStr = localStorage.getItem("adminSession");
        
        if (!adminSessionStr) {
          setIsAuthorized(false);
          return;
        }
        
        const adminSession = JSON.parse(adminSessionStr) as AdminSession;
        
        // التحقق من صلاحية الجلسة
        if (
          adminSession &&
          adminSession.email === "ameer_a16@icloud.com" &&
          adminSession.isAdmin
        ) {
          // التحقق من مدة الجلسة (24 ساعة كحد أقصى)
          const sessionTime = new Date(adminSession.timestamp).getTime();
          const currentTime = new Date().getTime();
          const sessionDuration = currentTime - sessionTime;
          const maxSessionDuration = 24 * 60 * 60 * 1000; // 24 ساعة بالميلي ثانية
          
          if (sessionDuration <= maxSessionDuration) {
            setIsAuthorized(true);
          } else {
            // انتهت صلاحية الجلسة، قم بإزالتها
            localStorage.removeItem("adminSession");
            setIsAuthorized(false);
          }
        } else {
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
