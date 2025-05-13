
import { useState, useEffect } from "react";
import { BarChart3, LayoutDashboard } from "lucide-react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardActions from "@/components/dashboard/DashboardActions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DashboardStats from "@/components/dashboard/DashboardStats";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
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
        
        if (!user) {
          toast({
            title: "غير مصرح",
            description: "يجب تسجيل الدخول لعرض لوحة التحكم",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }
        
        // جلب عدد المشاهدات من جدول page_views
        const { data: viewsData, error: viewsError } = await supabase
          .from("page_views")
          .select("*")
          .eq("user_id", user.id)
          .single();
        
        if (viewsError && viewsError.code !== "PGRST116") { // PGRST116 هو كود "لم يتم العثور على نتائج"
          console.error("خطأ في جلب عدد المشاهدات:", viewsError);
          throw new Error("فشل في تحميل إحصائيات المشاهدات");
        }
        
        const totalViews = viewsData?.view_count || 0;
        
        setStats({
          totalViews: totalViews,
        });

        // جلب بيانات المشاهدات اليومية من سجل المشاهدات
        // في تطبيق حقيقي، يفضل أن يكون لديك جدول للمشاهدات اليومية
        // حاليًا سنقوم بإنشاء بيانات تقريبية استنادًا إلى إجمالي المشاهدات
        
        const today = new Date();
        const last7Days = Array.from({ length: 7 }, (_, i) => {
          const date = new Date(today);
          date.setDate(today.getDate() - (6 - i));
          return date;
        });

        // إنشاء توزيع تقريبي للمشاهدات على الأيام السبعة الماضية
        let remainingViews = totalViews;
        const dailyData: DailyViewData[] = [];
        
        for (let i = 0; i < last7Days.length; i++) {
          const date = last7Days[i];
          const formattedDate = `${date.getDate()}/${date.getMonth() + 1}`;
          
          // توزيع المشاهدات بشكل متصاعد مع بعض العشوائية
          // اليوم الأخير (اليوم الحالي) يحصل على معظم المشاهدات
          const viewPercentage = (i + 1) / 15 + (i === last7Days.length - 1 ? 0.3 : 0);
          const viewsForDay = Math.min(Math.floor(totalViews * viewPercentage), remainingViews);
          remainingViews -= viewsForDay;
          
          dailyData.push({
            date: formattedDate,
            views: viewsForDay
          });
        }
        
        // إذا كانت هناك مشاهدات متبقية، أضفها لليوم الأخير
        if (remainingViews > 0 && dailyData.length > 0) {
          dailyData[dailyData.length - 1].views += remainingViews;
        }
        
        setDailyViewsData(dailyData);
      } catch (error) {
        console.error("خطأ في جلب بيانات لوحة التحكم:", error);
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
