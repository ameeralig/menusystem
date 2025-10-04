import { useParams, useNavigate } from "react-router-dom";
import { useUserDetails } from "@/hooks/admin/useUserDetails";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { Separator } from "@/components/ui/separator";
import {
  ArrowRight,
  Mail,
  Phone,
  Store,
  Package,
  Eye,
  Calendar,
  Users,
  Shield,
  TableProperties,
  ShoppingCart,
  MessageSquare,
  FolderOpen,
  Activity,
  CheckCircle,
  XCircle
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";

const UserDetailsPage = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { userDetails, isLoading } = useUserDetails(userId || "");

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Spinner className="h-8 w-8" />
          <p className="text-muted-foreground">جاري تحميل التفاصيل...</p>
        </div>
      </div>
    );
  }

  if (!userDetails) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <XCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">المستخدم غير موجود</h2>
            <p className="text-muted-foreground mb-4">
              لم نتمكن من العثور على المستخدم المطلوب
            </p>
            <Button onClick={() => navigate("/admin/dashboard")}>
              العودة للوحة التحكم
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const stats = [
    { label: "الزيارات", value: userDetails.visitsCount, icon: Eye, color: "text-blue-500" },
    { label: "المنتجات", value: userDetails.productsCount, icon: Package, color: "text-green-500" },
    { label: "الموظفين", value: userDetails.employeesCount, icon: Users, color: "text-purple-500" },
    { label: "الطاولات", value: userDetails.tablesCount, icon: TableProperties, color: "text-orange-500" },
    { label: "الطلبات", value: userDetails.ordersCount, icon: ShoppingCart, color: "text-pink-500" },
    { label: "الشكاوى", value: userDetails.feedbackCount, icon: MessageSquare, color: "text-red-500" },
    { label: "التصنيفات", value: userDetails.categoriesCount, icon: FolderOpen, color: "text-indigo-500" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/admin/dashboard")}
            className="mb-4"
          >
            <ArrowRight className="h-4 w-4 ml-2" />
            العودة للوحة التحكم
          </Button>

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">تفاصيل المستخدم</h1>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>{userDetails.email}</span>
              </div>
            </div>

            <div className="flex flex-col gap-2 items-end">
              {userDetails.status === "active" ? (
                <Badge className="bg-green-500 flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                  نشط
                </Badge>
              ) : userDetails.status === "banned" ? (
                <Badge variant="destructive">محظور</Badge>
              ) : (
                <Badge variant="outline">قيد المراجعة</Badge>
              )}

              {userDetails.role === "admin" && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Shield className="h-3 w-3" />
                  مسؤول
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Basic Info Card */}
          <Card className="md:col-span-2 lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                المعلومات الأساسية
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {userDetails.store_name && (
                <div className="flex items-start gap-3">
                  <Store className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">اسم المتجر</p>
                    <p className="font-medium">{userDetails.store_name}</p>
                  </div>
                </div>
              )}

              {userDetails.phone && (
                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">رقم الهاتف</p>
                    <p className="font-medium" dir="ltr">{userDetails.phone}</p>
                  </div>
                </div>
              )}

              <Separator />

              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">تاريخ التسجيل</p>
                  <p className="font-medium">
                    {formatDistanceToNow(new Date(userDetails.created_at), {
                      addSuffix: true,
                      locale: ar,
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Activity className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">آخر نشاط</p>
                  <p className="font-medium">
                    {formatDistanceToNow(new Date(userDetails.lastActivity), {
                      addSuffix: true,
                      locale: ar,
                    })}
                  </p>
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">نظام الموظفين</span>
                <Badge variant={userDetails.employee_system_enabled ? "default" : "secondary"}>
                  {userDetails.employee_system_enabled ? "مفعل" : "معطل"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Stats Cards */}
          {stats.map((stat, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                    <p className="text-3xl font-bold">{stat.value}</p>
                  </div>
                  <stat.icon className={`h-12 w-12 ${stat.color} opacity-70`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Activity Timeline */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>النشاط الأخير</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-center py-8">
              سيتم إضافة سجل النشاط قريباً
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserDetailsPage;
