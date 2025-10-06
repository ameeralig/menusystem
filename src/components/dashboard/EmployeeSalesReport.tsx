import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Download, TrendingUp, DollarSign, ShoppingCart, Calendar } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

interface EmployeeSale {
  id: string;
  employee_id: string;
  employee_name: string;
  sale_date: string;
  total_orders: number;
  total_sales: number;
  created_at: string;
}

const EmployeeSalesReport = () => {
  const [sales, setSales] = useState<EmployeeSale[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'all'>('week');
  const { toast } = useToast();

  useEffect(() => {
    loadSales();
  }, [selectedPeriod]);

  const loadSales = async () => {
    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          variant: "destructive",
          title: "خطأ",
          description: "يرجى تسجيل الدخول أولاً",
        });
        return;
      }

      let query = supabase
        .from('employee_daily_sales')
        .select('*')
        .eq('store_owner_id', user.id)
        .order('sale_date', { ascending: false });

      if (selectedPeriod === 'week') {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        query = query.gte('sale_date', weekAgo.toISOString().split('T')[0]);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error loading sales:', error);
        throw error;
      }

      console.log('Loaded sales data:', data);
      setSales(data || []);
    } catch (error: any) {
      console.error('Error loading sales:', error);
      toast({
        variant: "destructive",
        title: "خطأ",
        description: error.message || "حدث خطأ أثناء تحميل البيانات",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const exportToCSV = () => {
    if (sales.length === 0) {
      toast({
        title: "لا توجد بيانات",
        description: "لا توجد بيانات للتصدير",
      });
      return;
    }

    const headers = ['التاريخ', 'اسم الموظف', 'عدد الطلبات', 'إجمالي المبيعات (د.ع)'];
    const csvData = sales.map(sale => [
      format(new Date(sale.sale_date), 'yyyy-MM-dd'),
      sale.employee_name,
      sale.total_orders,
      Number(sale.total_sales).toFixed(0),
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `employee-sales-${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "تم التصدير",
      description: "تم تصدير البيانات بنجاح",
    });
  };

  const getTotalSales = () => {
    return sales.reduce((sum, sale) => sum + Number(sale.total_sales), 0);
  };

  const getTotalOrders = () => {
    return sales.reduce((sum, sale) => sum + sale.total_orders, 0);
  };

  // تجميع المبيعات حسب الموظف
  const employeeSummary = sales.reduce((acc, sale) => {
    if (!acc[sale.employee_id]) {
      acc[sale.employee_id] = {
        name: sale.employee_name,
        totalOrders: 0,
        totalSales: 0,
      };
    }
    acc[sale.employee_id].totalOrders += sale.total_orders;
    acc[sale.employee_id].totalSales += Number(sale.total_sales);
    return acc;
  }, {} as Record<string, { name: string; totalOrders: number; totalSales: number }>);

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="text-center">جاري التحميل...</div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* الإحصائيات الإجمالية */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <TrendingUp className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">إجمالي المبيعات</p>
              <p className="text-2xl font-bold text-blue-600">
                {getTotalSales().toFixed(0)} د.ع
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
              <ShoppingCart className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">عدد الطلبات</p>
              <p className="text-2xl font-bold text-green-600">
                {getTotalOrders()}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <Calendar className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">الفترة</p>
              <p className="text-2xl font-bold text-purple-600">
                {selectedPeriod === 'week' ? '7 أيام' : 'كل السجلات'}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* أدوات التحكم */}
      <Card className="p-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex gap-2">
            <Button
              variant={selectedPeriod === 'week' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedPeriod('week')}
            >
              آخر 7 أيام
            </Button>
            <Button
              variant={selectedPeriod === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedPeriod('all')}
            >
              كل السجلات
            </Button>
          </div>

          <Button onClick={exportToCSV} size="sm" className="gap-2">
            <Download className="h-4 w-4" />
            تصدير CSV
          </Button>
        </div>
      </Card>

      {/* ملخص الموظفين */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">ملخص الموظفين</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(employeeSummary).map(([employeeId, summary]) => (
            <Card key={employeeId} className="p-4">
              <h4 className="font-semibold mb-2">{summary.name}</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">عدد الطلبات:</span>
                  <Badge variant="secondary">{summary.totalOrders}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">المبيعات:</span>
                  <span className="font-bold text-green-600">
                    {summary.totalSales.toFixed(0)} د.ع
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </Card>

      {/* السجلات التفصيلية */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">السجلات التفصيلية</h3>
        <ScrollArea className="h-[400px]">
          <div className="space-y-3 pr-4">
            {sales.map((sale) => (
              <Card key={sale.id} className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">
                        {format(new Date(sale.sale_date), 'EEEE، dd MMMM yyyy', { locale: ar })}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {sale.employee_name}
                    </p>
                  </div>

                  <div className="text-left space-y-2">
                    <div className="flex items-center gap-2">
                      <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                      <Badge variant="secondary">{sale.total_orders} طلب</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      <span className="font-bold text-green-600">
                        {Number(sale.total_sales).toFixed(0)} د.ع
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}

            {sales.length === 0 && (
              <div className="text-center py-12 text-muted-foreground space-y-3">
                <Calendar className="h-12 w-12 mx-auto opacity-50" />
                <p className="text-lg font-medium">لا توجد سجلات متاحة</p>
                <p className="text-sm">
                  {selectedPeriod === 'week' 
                    ? 'لا توجد مبيعات خلال آخر 7 أيام' 
                    : 'لم يتم تسجيل أي مبيعات بعد'}
                </p>
                <p className="text-xs bg-muted/50 p-3 rounded-lg inline-block">
                  💡 سيتم تسجيل المبيعات تلقائياً يومياً الساعة 3 صباحاً بتوقيت العراق
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
      </Card>

      <p className="text-xs text-muted-foreground text-center">
        ملاحظة: يتم تحديث البيانات تلقائياً يومياً الساعة 3 صباحاً بتوقيت العراق. 
        السجلات الأقدم من أسبوع يتم حذفها تلقائياً.
      </p>
    </div>
  );
};

export default EmployeeSalesReport;
