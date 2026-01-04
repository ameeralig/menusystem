import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminStatsTab from "@/components/admin/AdminStatsTab";
import AdminUsersTab from "@/components/admin/AdminUsersTab";
import UserNotificationTab from "@/components/admin/users/UserNotificationTab";
import UserAnalyticsTab from "@/components/admin/analytics/UserAnalyticsTab";
import StorageManagementTab from "@/components/admin/storage/StorageManagementTab";
import FloatingAIChat from "@/components/dashboard/FloatingAIChat";
import { APIKeysManager } from "@/components/dashboard/APIKeysManager";

const AdminDashboardTabs = () => {
  const [activeTab, setActiveTab] = useState('stats');
  
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">لوحة تحكم المسؤول</h1>
      
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        defaultValue="stats"
        className="space-y-4"
      >
        <div className="overflow-auto pb-2 border-b">
          <TabsList className="inline-flex h-9 items-center justify-start rounded-none w-full bg-transparent p-0">
            <TabsTrigger
              value="stats"
              className="relative h-9 rounded-none border-b-2 border-b-transparent bg-transparent px-4 pb-3 pt-2 font-semibold text-muted-foreground shadow-none transition-none data-[state=active]:border-b-primary data-[state=active]:text-foreground data-[state=active]:shadow-none"
            >
              الإحصائيات
            </TabsTrigger>
            <TabsTrigger
              value="users"
              className="relative h-9 rounded-none border-b-2 border-b-transparent bg-transparent px-4 pb-3 pt-2 font-semibold text-muted-foreground shadow-none transition-none data-[state=active]:border-b-primary data-[state=active]:text-foreground data-[state=active]:shadow-none"
            >
              المستخدمين
            </TabsTrigger>
            <TabsTrigger
              value="storage"
              className="relative h-9 rounded-none border-b-2 border-b-transparent bg-transparent px-4 pb-3 pt-2 font-semibold text-muted-foreground shadow-none transition-none data-[state=active]:border-b-primary data-[state=active]:text-foreground data-[state=active]:shadow-none"
            >
              التخزين
            </TabsTrigger>
            <TabsTrigger
              value="api"
              className="relative h-9 rounded-none border-b-2 border-b-transparent bg-transparent px-4 pb-3 pt-2 font-semibold text-muted-foreground shadow-none transition-none data-[state=active]:border-b-primary data-[state=active]:text-foreground data-[state=active]:shadow-none"
            >
              مفاتيح API
            </TabsTrigger>
            <TabsTrigger
              value="notifications"
              className="relative h-9 rounded-none border-b-2 border-b-transparent bg-transparent px-4 pb-3 pt-2 font-semibold text-muted-foreground shadow-none transition-none data-[state=active]:border-b-primary data-[state=active]:text-foreground data-[state=active]:shadow-none"
            >
              الإشعارات
            </TabsTrigger>
            <TabsTrigger
              value="analytics"
              className="relative h-9 rounded-none border-b-2 border-b-transparent bg-transparent px-4 pb-3 pt-2 font-semibold text-muted-foreground shadow-none transition-none data-[state=active]:border-b-primary data-[state=active]:text-foreground data-[state=active]:shadow-none"
            >
              التحليلات التفصيلية
            </TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="stats" className="space-y-4">
          <AdminStatsTab />
        </TabsContent>
        
        <TabsContent value="users" className="space-y-4">
          <AdminUsersTab />
        </TabsContent>

        <TabsContent value="storage" className="space-y-4">
          <StorageManagementTab />
        </TabsContent>

        <TabsContent value="api" className="space-y-4">
          <APIKeysManager />
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <UserNotificationTab />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <UserAnalyticsTab />
        </TabsContent>
      </Tabs>
      
      <FloatingAIChat />
    </div>
  );
};

export default AdminDashboardTabs;
