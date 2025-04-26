
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

type SystemStats = {
  total_users: number;
  total_active_stores: number;
  total_page_views: number;
  last_updated: string;
};

const Engineering = () => {
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data, error } = await supabase
          .from("system_stats")
          .select("*")
          .maybeSingle();

        if (error) {
          throw error;
        }

        if (data) {
          setStats(data);
        }
      } catch (error: any) {
        console.error("Error fetching stats:", error);
        toast({
          variant: "destructive",
          title: "خطأ",
          description: "حدث خطأ أثناء جلب الإحصائيات"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 60000); // تحديث كل دقيقة

    return () => clearInterval(interval);
  }, [toast]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">جاري التحميل...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">لوحة تحكم المبرمج</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>إجمالي المستخدمين</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats?.total_users || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>المتاجر النشطة</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats?.total_active_stores || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>مشاهدات الصفحات</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats?.total_page_views || 0}</p>
          </CardContent>
        </Card>
      </div>
      <div className="text-center mt-4 text-sm text-gray-500">
        آخر تحديث: {stats?.last_updated ? new Date(stats.last_updated).toLocaleString('ar-SA') : 'غير متوفر'}
      </div>
    </div>
  );
};

export default Engineering;
