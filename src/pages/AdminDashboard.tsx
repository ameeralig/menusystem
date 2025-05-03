
import { useEffect } from "react";
import { useAdminAuth } from "@/hooks/admin/useAdminAuth";
import AdminHeader from "@/components/admin/AdminHeader";
import AdminDashboardTabs from "@/components/admin/AdminDashboardTabs";

const AdminDashboard = () => {
  const { isAuthenticated, handleLogout } = useAdminAuth();

  // إذا تم التحقق من عدم المصادقة، فسيتم التوجيه تلقائياً من خلال useAdminAuth
  if (!isAuthenticated) {
    return null; // لن يتم عرض شيء أثناء التحقق من المصادقة
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <AdminHeader onLogout={handleLogout} />
      
      <div className="container mx-auto px-4 py-6 flex-1">
        <AdminDashboardTabs />
      </div>
    </div>
  );
};

export default AdminDashboard;
