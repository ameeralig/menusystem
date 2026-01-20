import { useAdminAuth } from "@/hooks/admin/useAdminAuth";
import AdminHeader from "@/components/admin/AdminHeader";
import AdminDashboardTabs from "@/components/admin/AdminDashboardTabs";
import SimpleBackground from "@/components/background/SimpleBackground";
import { Spinner } from "@/components/ui/spinner";

const AdminDashboard = () => {
  const { isAuthenticated, handleLogout } = useAdminAuth();

  // إذا تم التحقق من عدم المصادقة، فسيتم التوجيه تلقائياً من خلال useAdminAuth
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <SimpleBackground />
        <div className="flex flex-col items-center gap-4">
          <Spinner className="h-10 w-10 text-cyan-400" />
          <p className="text-white/70 font-bold">جاري التحقق...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative font-arabic">
      <SimpleBackground />
      
      <div className="relative z-10">
        <AdminHeader onLogout={handleLogout} />
        
        <div className="container mx-auto px-4 py-6">
          <AdminDashboardTabs />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
