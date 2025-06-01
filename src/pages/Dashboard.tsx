
import { BarChart3, LayoutDashboard } from "lucide-react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardActions from "@/components/dashboard/DashboardActions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DashboardStats from "@/components/dashboard/DashboardStats";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { useDashboardStats } from "@/hooks/useDashboardStats";

const Dashboard = () => {
  const { stats, dailyViewsData, loading } = useDashboardStats();

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      <main className="container mx-auto p-6">
        <div className="mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gradient">لوحة التحكم</h1>
            <p className="text-muted-foreground">مرحبًا بك في لوحة تحكم متجرك الإلكتروني</p>
          </div>
          <Card className="w-full md:w-auto bg-primary/5 border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-primary">
                <LayoutDashboard className="h-5 w-5" />
                <span className="font-medium">نظرة عامة لمتجرك</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mb-8">
          <DashboardStats stats={stats} loading={loading} />
        </div>

        <Tabs defaultValue="actions" className="mb-8">
          <TabsList className="mb-4 w-full md:w-auto">
            <TabsTrigger value="actions">الإجراءات السريعة</TabsTrigger>
            <TabsTrigger value="analytics">الإحصائيات</TabsTrigger>
          </TabsList>
          <TabsContent value="actions" className="mt-0">
            <DashboardActions />
          </TabsContent>
          <TabsContent value="analytics" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  إحصائيات الزيارات اليومية
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                    جاري تحميل الإحصائيات...
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
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis 
                          dataKey="date" 
                          tick={{ fill: '#888' }}
                          axisLine={{ stroke: '#e0e0e0' }}
                        />
                        <YAxis 
                          tick={{ fill: '#888' }}
                          axisLine={{ stroke: '#e0e0e0' }}
                        />
                        <Tooltip
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              return (
                                <div className="rounded-lg border bg-background p-2 shadow-md">
                                  <div className="flex flex-col">
                                    <span className="text-sm font-bold">
                                      {payload[0].payload.date}
                                    </span>
                                    <span className="flex items-center gap-1 text-sm">
                                      <span className="h-2 w-2 rounded-full bg-[#ff9178]"></span>
                                      <span className="text-muted-foreground">
                                        الزيارات:
                                      </span>{" "}
                                      {payload[0].value}
                                    </span>
                                  </div>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Bar 
                          dataKey="views" 
                          fill="#ff9178" 
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Dashboard;
