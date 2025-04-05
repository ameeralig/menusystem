
import { useState, useEffect } from "react";
import { BarChart3, LayoutDashboard } from "lucide-react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardActions from "@/components/dashboard/DashboardActions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DashboardStats from "@/components/dashboard/DashboardStats";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from "recharts";

interface DailyViewData {
  date: string;
  views: number;
}

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalViews: 0,
  });
  const [dailyViewsData, setDailyViewsData] = useState<DailyViewData[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          // Get total views
          const { data: viewsData, error: viewsError } = await supabase
            .from("page_views")
            .select("view_count")
            .eq("user_id", user.id);
          
          if (viewsError) {
            console.error("Error fetching view count:", viewsError);
            throw new Error("فشل في تحميل إحصائيات المشاهدات");
          }
          
          // Calculate total views by summing all view_count values
          const totalViews = viewsData?.reduce((sum, item) => sum + (item.view_count || 0), 0) || 0;
          
          setStats({
            totalViews: totalViews,
          });

          // Generate sample data for the last 7 days
          const today = new Date();
          const last7Days = Array.from({ length: 7 }, (_, i) => {
            const date = new Date(today);
            date.setDate(today.getDate() - (6 - i));
            return date;
          });

          // Format to daily view data - in a real app, you'd fetch this from the database
          // For now we'll simulate some random values
          const dailyData = last7Days.map(date => {
            // Format the date as "DD/MM"
            const formattedDate = `${date.getDate()}/${date.getMonth() + 1}`;
            
            // Generate a random view count based on total views to make it realistic
            // Using Math.floor(totalViews * 0.1 * Math.random()) + 1 to get a value between 1 and 10% of total views
            const randomViews = Math.min(
              Math.floor(totalViews * 0.2 * Math.random()) + 1,
              Math.max(1, Math.floor(totalViews / 10))
            );
            
            return {
              date: formattedDate,
              views: randomViews,
            };
          });
          
          setDailyViewsData(dailyData);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        toast({
          title: "حدث خطأ",
          description: "لم نتمكن من تحميل بيانات لوحة التحكم",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [toast]);

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
                  إحصائيات الزيارات
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
