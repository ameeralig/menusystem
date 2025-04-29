
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import AdminUsersTab from "@/components/admin/AdminUsersTab";
import AdminStatsTab from "@/components/admin/AdminStatsTab";
import AdminSettingsTab from "@/components/admin/AdminSettingsTab";
import AdminHeader from "@/components/admin/AdminHeader";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("users");
  const { toast } = useToast();
  const navigate = useNavigate();

  // التحقق من الجلسة
  useEffect(() => {
    const adminSessionStr = localStorage.getItem("adminSession");
    
    if (!adminSessionStr) {
      navigate("/admin");
      return;
    }
    
    try {
      const adminSession = JSON.parse(adminSessionStr);
      
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

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <AdminHeader onLogout={handleLogout} />
      
      <div className="container mx-auto px-4 py-6 flex-1">
        <Tabs
          defaultValue="users"
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-4"
        >
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="users">إدارة المستخدمين</TabsTrigger>
            <TabsTrigger value="stats">الإحصائيات</TabsTrigger>
            <TabsTrigger value="settings">الإعدادات</TabsTrigger>
          </TabsList>
          
          <TabsContent value="users" className="space-y-4">
            <AdminUsersTab />
          </TabsContent>
          
          <TabsContent value="stats" className="space-y-4">
            <AdminStatsTab />
          </TabsContent>
          
          <TabsContent value="settings" className="space-y-4">
            <AdminSettingsTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
