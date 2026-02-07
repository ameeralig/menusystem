import { useParams, useNavigate } from "react-router-dom";
import { useUserDetails } from "@/hooks/admin/useUserDetails";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import SimpleBackground from "@/components/background/SimpleBackground";
import GlassCard from "@/components/admin/GlassCard";
import StatCard from "@/components/admin/StatCard";
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
  XCircle,
  Clock
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";

const UserDetailsPage = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { userDetails, isLoading } = useUserDetails(userId || "");

  if (isLoading) {
    return (
      <div className="min-h-screen relative font-arabic">
        <SimpleBackground />
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="flex flex-col items-center gap-4">
            <Spinner className="h-10 w-10 text-cyan-400" />
            <p className="text-white/70 font-bold">جاري تحميل التفاصيل...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!userDetails) {
    return (
      <div className="min-h-screen relative font-arabic">
        <SimpleBackground />
        <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
          <GlassCard className="max-w-md p-8 text-center">
            <div className="w-20 h-20 rounded-2xl bg-red-500/20 flex items-center justify-center mx-auto mb-6">
              <XCircle className="h-10 w-10 text-red-400" />
            </div>
            <h2 className="text-2xl font-black text-white mb-3">المستخدم غير موجود</h2>
            <p className="text-white/60 mb-6 font-bold">
              لم نتمكن من العثور على المستخدم المطلوب
            </p>
            <Button 
              onClick={() => navigate("/admin/dashboard")}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold rounded-xl"
            >
              العودة للوحة التحكم
            </Button>
          </GlassCard>
        </div>
      </div>
    );
  }

  const stats = [
    { label: "الزيارات", value: userDetails.visitsCount, icon: Eye, color: "from-blue-400 to-cyan-500" },
    { label: "المنتجات", value: userDetails.productsCount, icon: Package, color: "from-green-400 to-emerald-500" },
    { label: "الموظفين", value: userDetails.employeesCount, icon: Users, color: "from-purple-400 to-pink-500" },
    { label: "الطاولات", value: userDetails.tablesCount, icon: TableProperties, color: "from-orange-400 to-red-500" },
    { label: "الطلبات", value: userDetails.ordersCount, icon: ShoppingCart, color: "from-pink-400 to-rose-500" },
    { label: "الشكاوى", value: userDetails.feedbackCount, icon: MessageSquare, color: "from-red-400 to-orange-500" },
    { label: "التصنيفات", value: userDetails.categoriesCount, icon: FolderOpen, color: "from-indigo-400 to-blue-500" },
  ];

  return (
    <div className="min-h-screen relative font-arabic">
      <SimpleBackground />
      
      <div className="relative z-10">
        {/* Header */}
        <motion.header 
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="sticky top-0 z-50 px-3 sm:px-6 py-3 sm:py-4"
        >
          <div className="container mx-auto">
            <div className="backdrop-blur-xl bg-white/5 rounded-2xl p-4 border border-white/10 shadow-2xl shadow-black/20">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    variant="ghost"
                    onClick={() => navigate("/admin/dashboard")}
                    className="h-10 px-4 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 font-bold"
                  >
                    <ArrowRight className="h-4 w-4 ml-2" />
                    العودة للوحة التحكم
                  </Button>
                </motion.div>

                <div className="flex items-center gap-3">
                  {userDetails.status === "active" ? (
                    <Badge className="bg-green-500/20 text-green-400 border border-green-500/30 flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" />
                      نشط
                    </Badge>
                  ) : userDetails.status === "suspended" ? (
                    <Badge className="bg-orange-500/20 text-orange-400 border border-orange-500/30 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      موقف مؤقتاً
                    </Badge>
                  ) : userDetails.status === "banned" ? (
                    <Badge className="bg-red-500/20 text-red-400 border border-red-500/30">محظور</Badge>
                  ) : (
                    <Badge className="bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">قيد المراجعة</Badge>
                  )}

                  {userDetails.role === "admin" && (
                    <Badge className="bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center gap-1">
                      <Shield className="h-3 w-3" />
                      مسؤول
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.header>

        <div className="container mx-auto px-4 py-6">
          {/* User Info Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <GlassCard className="p-6 mb-6">
              <div className="flex items-center gap-4 flex-wrap">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-400/20 to-blue-500/20 border border-white/10 flex items-center justify-center">
                  <Store className="w-8 h-8 text-cyan-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="text-2xl font-black text-white mb-1">
                    {userDetails.store_name || 'بدون اسم متجر'}
                  </h1>
                  <div className="flex items-center gap-4 flex-wrap text-white/60 text-sm">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      <span>{userDetails.email}</span>
                    </div>
                    {userDetails.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        <span dir="ltr">{userDetails.phone}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </GlassCard>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
            {stats.map((stat, index) => (
              <StatCard
                key={stat.label}
                title={stat.label}
                value={stat.value}
                icon={stat.icon}
                color={stat.color}
                delay={0.1 + index * 0.05}
              />
            ))}
          </div>

          {/* Activity Info */}
          <div className="grid md:grid-cols-2 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <GlassCard className="p-6">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-cyan-400" />
                  معلومات النشاط
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                    <div className="flex items-center gap-2 text-white/60">
                      <Calendar className="w-4 h-4" />
                      تاريخ التسجيل
                    </div>
                    <span className="text-white font-bold text-sm">
                      {formatDistanceToNow(new Date(userDetails.created_at), {
                        addSuffix: true,
                        locale: ar,
                      })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                    <div className="flex items-center gap-2 text-white/60">
                      <Clock className="w-4 h-4" />
                      آخر نشاط
                    </div>
                    <span className="text-white font-bold text-sm">
                      {formatDistanceToNow(new Date(userDetails.lastActivity), {
                        addSuffix: true,
                        locale: ar,
                      })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                    <div className="flex items-center gap-2 text-white/60">
                      <Users className="w-4 h-4" />
                      نظام الموظفين
                    </div>
                    <Badge className={userDetails.employee_system_enabled 
                      ? "bg-green-500/20 text-green-400 border border-green-500/30" 
                      : "bg-white/10 text-white/50 border border-white/10"
                    }>
                      {userDetails.employee_system_enabled ? "مفعل" : "معطل"}
                    </Badge>
                  </div>
                </div>
              </GlassCard>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <GlassCard className="p-6 h-full">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-purple-400" />
                  النشاط الأخير
                </h3>
                <div className="flex items-center justify-center h-32 text-white/40 text-sm font-bold">
                  سيتم إضافة سجل النشاط قريباً
                </div>
              </GlassCard>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetailsPage;
