
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminUsersTab from "@/components/admin/AdminUsersTab";
import AdminStatsTab from "@/components/admin/AdminStatsTab";
import AdminSettingsTab from "@/components/admin/AdminSettingsTab";
import AdminNotificationsTab from "@/components/admin/AdminNotificationsTab";

const AdminDashboardTabs = () => {
  const [activeTab, setActiveTab] = useState("users");

  return (
    <Tabs
      defaultValue="users"
      value={activeTab}
      onValueChange={setActiveTab}
      className="space-y-4"
    >
      <TabsList className="grid w-full grid-cols-4 mb-8">
        <TabsTrigger value="users">إدارة المستخدمين</TabsTrigger>
        <TabsTrigger value="notifications">الإشعارات</TabsTrigger>
        <TabsTrigger value="stats">الإحصائيات</TabsTrigger>
        <TabsTrigger value="settings">الإعدادات</TabsTrigger>
      </TabsList>
      
      <TabsContent value="users" className="space-y-4">
        <AdminUsersTab />
      </TabsContent>
      
      <TabsContent value="notifications" className="space-y-4">
        <AdminNotificationsTab />
      </TabsContent>
      
      <TabsContent value="stats" className="space-y-4">
        <AdminStatsTab />
      </TabsContent>
      
      <TabsContent value="settings" className="space-y-4">
        <AdminSettingsTab />
      </TabsContent>
    </Tabs>
  );
};

export default AdminDashboardTabs;
