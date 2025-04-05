
import { useState, useEffect } from "react";
import { BarChart3, LayoutDashboard } from "lucide-react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardActions from "@/components/dashboard/DashboardActions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DashboardStats from "@/components/dashboard/DashboardStats";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalViews: 0,
  });
  const { toast } = useToast();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          // Fix: Use sum of view_count to handle multiple rows
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
                  إحصائيات المتجر
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  سيتم عرض الإحصائيات هنا قريباً
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Dashboard;
