
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import UsersManagement from "@/components/engineering/UsersManagement";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Ban } from "lucide-react";

type SystemStats = {
  total_users: number;
  total_active_stores: number;
  total_page_views: number;
  last_updated: string;
};

const Engineering = () => {
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const checkAdminRole = async () => {
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      if (roleError) {
        console.error('Error checking admin role:', roleError);
        setError("غير مصرح لك بالوصول إلى هذه الصفحة");
        return false;
      }

      if (roleData?.role !== 'admin') {
        setError("غير مصرح لك بالوصول إلى هذه الصفحة");
        return false;
      }

      setIsAdmin(true);
      return true;
    };

    const fetchStats = async () => {
      try {
        const isAdminUser = await checkAdminRole();
        if (!isAdminUser) {
          setLoading(false);
          return;
        }

        await supabase.rpc('update_system_stats');

        const { data, error } = await supabase
          .from("system_stats")
          .select("*")
          .maybeSingle();

        if (error) throw error;

        if (data) {
          setStats(data);
        }
      } catch (error: any) {
        console.error("Error fetching stats:", error);
        setError("حدث خطأ أثناء جلب الإحصائيات");
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
    const interval = setInterval(fetchStats, 60000);

    return () => clearInterval(interval);
  }, [toast]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">جاري التحميل...</div>
      </div>
    );
  }

  if (error || !isAdmin) {
    return (
      <div className="container mx-auto py-8">
        <Alert variant="destructive" className="mb-6">
          <Ban className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">لوحة تحكم المبرمج</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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

      {isAdmin && <UsersManagement />}
      
      <div className="text-center mt-4 text-sm text-gray-500">
        آخر تحديث: {stats?.last_updated ? new Date(stats.last_updated).toLocaleString('ar-SA') : 'غير متوفر'}
      </div>
    </div>
  );
};

export default Engineering;
