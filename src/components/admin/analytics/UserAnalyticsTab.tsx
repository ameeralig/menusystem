import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { Search, User, Activity, Eye, Heart, Share2, TrendingUp } from "lucide-react";
import { useUserActivityLogs } from "@/hooks/analytics/useUserActivityLogs";
import { useVisitorAnalytics } from "@/hooks/analytics/useVisitorAnalytics";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { Json } from "@/integrations/supabase/types";

interface UserOption {
  id: string;
  email: string;
  store_name: string | null;
}

const getJsonValue = (json: Json, key: string): string | undefined => {
  if (typeof json === 'object' && json !== null && !Array.isArray(json)) {
    const value = (json as Record<string, Json>)[key];
    return typeof value === 'string' ? value : undefined;
  }
  return undefined;
};

const UserAnalyticsTab = () => {
  const [users, setUsers] = useState<UserOption[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);

  const { logs: activityLogs, isLoading: isLoadingLogs } = useUserActivityLogs({ 
    userId: selectedUserId || undefined 
  });
  
  const { summary, analytics, isLoading: isLoadingAnalytics } = useVisitorAnalytics({ 
    storeOwnerId: selectedUserId || undefined 
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setIsLoadingUsers(true);
    try {
      // جلب المستخدمين من store_settings بدلاً من auth.admin
      const { data: storeSettings } = await supabase
        .from('store_settings')
        .select('user_id, store_name');

      if (!storeSettings) {
        setUsers([]);
        return;
      }

      const usersList: UserOption[] = storeSettings.map(s => ({
        id: s.user_id,
        email: s.store_name || 'بدون اسم',
        store_name: s.store_name
      }));

      setUsers(usersList);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const filteredUsers = users.filter(u => 
    u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (u.store_name && u.store_name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getActionTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'product_add': 'إضافة منتج',
      'product_edit': 'تعديل منتج',
      'product_delete': 'حذف منتج',
      'category_add': 'إضافة تصنيف',
      'category_edit': 'تعديل تصنيف',
      'category_delete': 'حذف تصنيف',
      'store_settings_update': 'تحديث إعدادات المتجر',
      'banner_update': 'تحديث البانر',
      'logo_update': 'تحديث الشعار',
      'employee_add': 'إضافة موظف',
      'employee_edit': 'تعديل موظف',
      'employee_delete': 'حذف موظف',
      'login': 'تسجيل دخول',
      'logout': 'تسجيل خروج',
      'page_view': 'عرض الصفحة',
      'product_view': 'عرض منتج',
      'product_click': 'النقر على منتج',
      'category_click': 'النقر على تصنيف',
      'add_to_favorites': 'إضافة للمفضلة',
      'remove_from_favorites': 'إزالة من المفضلة',
      'share_menu': 'مشاركة القائمة',
      'share_product': 'مشاركة منتج',
      'search': 'بحث',
      'ai_chat': 'محادثة ذكية',
      'add_to_cart': 'إضافة للسلة',
    };
    return labels[type] || type;
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      'products': 'المنتجات',
      'categories': 'التصنيفات',
      'store': 'المتجر',
      'employees': 'الموظفين',
      'tables': 'الطاولات',
      'orders': 'الطلبات',
      'auth': 'المصادقة',
      'profile': 'الملف الشخصي',
    };
    return labels[category] || category;
  };

  return (
    <div className="space-y-6">
      {/* اختيار المستخدم */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            اختر المتجر
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="ابحث باسم المتجر..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10"
            />
          </div>
          
          {isLoadingUsers ? (
            <div className="flex justify-center py-4">
              <Spinner className="h-6 w-6" />
            </div>
          ) : (
            <Select value={selectedUserId} onValueChange={setSelectedUserId}>
              <SelectTrigger>
                <SelectValue placeholder="اختر متجر لعرض تحليلاته" />
              </SelectTrigger>
              <SelectContent>
                {filteredUsers.map(user => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.store_name || 'بدون اسم'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </CardContent>
      </Card>

      {selectedUserId && (
        <Tabs defaultValue="visitor" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="visitor">تحليلات الزوار</TabsTrigger>
            <TabsTrigger value="owner">سجل صاحب المتجر</TabsTrigger>
          </TabsList>

          {/* تحليلات الزوار */}
          <TabsContent value="visitor" className="space-y-6">
            {isLoadingAnalytics ? (
              <div className="flex justify-center py-10">
                <Spinner className="h-8 w-8" />
              </div>
            ) : summary ? (
              <>
                {/* بطاقات الإحصائيات */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">الزيارات</p>
                          <p className="text-2xl font-bold">{summary.uniqueSessions}</p>
                        </div>
                        <Eye className="h-8 w-8 text-primary/20" />
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">مشاهدات المنتجات</p>
                          <p className="text-2xl font-bold">{summary.productViews}</p>
                        </div>
                        <TrendingUp className="h-8 w-8 text-green-500/20" />
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">المفضلة</p>
                          <p className="text-2xl font-bold">{summary.favorites}</p>
                        </div>
                        <Heart className="h-8 w-8 text-red-500/20" />
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">المشاركات</p>
                          <p className="text-2xl font-bold">{summary.shares}</p>
                        </div>
                        <Share2 className="h-8 w-8 text-blue-500/20" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* أكثر المنتجات مشاهدة */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">أكثر المنتجات مشاهدة</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {summary.topProducts.length > 0 ? (
                        <div className="space-y-3">
                          {summary.topProducts.map((product, index) => (
                            <div key={index} className="flex items-center justify-between">
                              <span className="text-sm">{product.name}</span>
                              <Badge variant="secondary">{product.views}</Badge>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted-foreground text-center py-4">لا توجد بيانات</p>
                      )}
                    </CardContent>
                  </Card>

                  {/* أكثر التصنيفات نقراً */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">أكثر التصنيفات نقراً</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {summary.topCategories.length > 0 ? (
                        <div className="space-y-3">
                          {summary.topCategories.map((category, index) => (
                            <div key={index} className="flex items-center justify-between">
                              <span className="text-sm">{category.name}</span>
                              <Badge variant="secondary">{category.clicks}</Badge>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted-foreground text-center py-4">لا توجد بيانات</p>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* توزيع الأنشطة */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">توزيع الأنشطة</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {summary.actionsByType.map((action, index) => (
                        <Badge key={index} variant="outline" className="py-2">
                          {getActionTypeLabel(action.type)}: {action.count}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* آخر الأنشطة */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">آخر أنشطة الزوار</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {analytics.slice(0, 50).map((activity) => (
                        <div key={activity.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                          <div className="flex items-center gap-3">
                            <Activity className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <span className="text-sm font-medium">
                                {getActionTypeLabel(activity.action_type)}
                              </span>
                              {getJsonValue(activity.action_data, 'product_name') && (
                                <span className="text-xs text-muted-foreground mr-2">
                                  - {getJsonValue(activity.action_data, 'product_name')}
                                </span>
                              )}
                            </div>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(activity.created_at), 'dd/MM HH:mm', { locale: ar })}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card>
                <CardContent className="py-10 text-center">
                  <p className="text-muted-foreground">لا توجد بيانات تحليلية لهذا المتجر</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* سجل صاحب المتجر */}
          <TabsContent value="owner" className="space-y-6">
            {isLoadingLogs ? (
              <div className="flex justify-center py-10">
                <Spinner className="h-8 w-8" />
              </div>
            ) : activityLogs.length > 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">سجل الأنشطة</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-[500px] overflow-y-auto">
                    {activityLogs.map((log) => (
                      <div key={log.id} className="flex items-center justify-between p-3 rounded-lg border">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline">{getCategoryLabel(log.action_category)}</Badge>
                          <div>
                            <span className="text-sm font-medium">
                              {getActionTypeLabel(log.action_type)}
                            </span>
                            {getJsonValue(log.details, 'name') && (
                              <span className="text-xs text-muted-foreground mr-2">
                                - {getJsonValue(log.details, 'name')}
                              </span>
                            )}
                          </div>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(log.created_at), 'dd/MM/yyyy HH:mm', { locale: ar })}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="py-10 text-center">
                  <p className="text-muted-foreground">لا توجد سجلات لهذا المستخدم</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default UserAnalyticsTab;
