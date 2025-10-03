
import { BarChart3, LayoutDashboard, Users, UtensilsCrossed } from "lucide-react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardActions from "@/components/dashboard/DashboardActions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DashboardStats from "@/components/dashboard/DashboardStats";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import MobileNavigation from "@/components/dashboard/MobileNavigation";
import FloatingActionButton from "@/components/dashboard/FloatingActionButton";
import EmployeesTab from "@/components/employees/EmployeesTab";
import TablesTab from "@/components/employees/TablesTab";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const Dashboard = () => {
  const { stats, dailyViewsData, loading } = useDashboardStats();
  const [employeeSystemEnabled, setEmployeeSystemEnabled] = useState(false);

  useEffect(() => {
    const checkEmployeeSystem = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data } = await supabase
          .from('store_settings')
          .select('employee_system_enabled')
          .eq('user_id', user.id)
          .maybeSingle();

        setEmployeeSystemEnabled(data?.employee_system_enabled || false);
      } catch (error) {
        console.error("Error checking employee system:", error);
      }
    };

    checkEmployeeSystem();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <DashboardHeader />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-background border-b border-border/50">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center space-y-2">
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              لوحة التحكم
            </h1>
            <p className="text-muted-foreground text-lg">إدارة متجرك الإلكتروني بسهولة وفعالية</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 pb-24">
        {/* Stats Section */}
        <div className="mb-8">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-foreground mb-2">الإحصائيات</h2>
            <p className="text-sm text-muted-foreground">نظرة سريعة على أداء متجرك</p>
          </div>
          <DashboardStats stats={stats} loading={loading} />
        </div>

        {/* Actions and Analytics */}
        <div className="space-y-6">
          <Tabs defaultValue="actions" className="w-full">
            <TabsList className={`grid w-full ${employeeSystemEnabled ? 'grid-cols-4' : 'grid-cols-2'} mb-6 bg-muted/50 p-1 rounded-xl`}>
              <TabsTrigger 
                value="actions" 
                className="rounded-lg text-sm font-medium data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm"
              >
                الإجراءات السريعة
              </TabsTrigger>
              <TabsTrigger 
                value="analytics"
                className="rounded-lg text-sm font-medium data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm"
              >
                الإحصائيات التفصيلية
              </TabsTrigger>
              {employeeSystemEnabled && (
                <>
                  <TabsTrigger 
                    value="employees"
                    className="rounded-lg text-sm font-medium data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm"
                  >
                    <Users className="h-4 w-4 ml-2" />
                    الموظفين
                  </TabsTrigger>
                  <TabsTrigger 
                    value="tables"
                    className="rounded-lg text-sm font-medium data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm"
                  >
                    <UtensilsCrossed className="h-4 w-4 ml-2" />
                    الطاولات
                  </TabsTrigger>
                </>
              )}
            </TabsList>
            
            <TabsContent value="actions" className="mt-0 space-y-4">
              <div className="mb-4">
                <h2 className="text-xl font-semibold text-foreground mb-2">الإجراءات السريعة</h2>
                <p className="text-sm text-muted-foreground">أدوات سريعة لإدارة متجرك</p>
              </div>
              <DashboardActions />
            </TabsContent>
            
            <TabsContent value="analytics" className="mt-0">
              <Card className="bg-card/50 backdrop-blur-sm border-border/60 shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3 text-lg">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <BarChart3 className="h-5 w-5 text-primary" />
                    </div>
                    إحصائيات الزيارات اليومية
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="h-[300px] flex items-center justify-center">
                      <div className="text-center space-y-2">
                        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
                        <p className="text-muted-foreground text-sm">جاري تحميل الإحصائيات...</p>
                      </div>
                    </div>
                  ) : (
                    <div className="h-[300px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={dailyViewsData}
                          margin={{
                            top: 20,
                            right: 20,
                            left: 20,
                            bottom: 20,
                          }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                          <XAxis 
                            dataKey="date" 
                            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                            axisLine={{ stroke: 'hsl(var(--border))' }}
                          />
                          <YAxis 
                            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                            axisLine={{ stroke: 'hsl(var(--border))' }}
                          />
                          <Tooltip
                            content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                return (
                                  <div className="rounded-xl border bg-background/95 backdrop-blur-sm p-3 shadow-xl border-border/60">
                                    <div className="flex flex-col space-y-1">
                                      <span className="text-sm font-semibold text-foreground">
                                        {payload[0].payload.date}
                                      </span>
                                      <div className="flex items-center gap-2 text-sm">
                                        <div className="h-2 w-2 rounded-full bg-primary"></div>
                                        <span className="text-muted-foreground">الزيارات:</span>
                                        <span className="font-medium text-foreground">{payload[0].value}</span>
                                      </div>
                                    </div>
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                          <Bar 
                            dataKey="views" 
                            fill="hsl(var(--primary))" 
                            radius={[6, 6, 0, 0]}
                            opacity={0.8}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {employeeSystemEnabled && (
              <>
                <TabsContent value="employees" className="mt-0">
                  <EmployeesTab />
                </TabsContent>

                <TabsContent value="tables" className="mt-0">
                  <TablesTab />
                </TabsContent>
              </>
            )}
          </Tabs>
        </div>
      </main>

      {/* Mobile Navigation */}
      <MobileNavigation />
      
      {/* Floating Action Button */}
      <FloatingActionButton />
    </div>
  );
};

export default Dashboard;
