import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Store, Package, Eye, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import AnimatedCounter from "./AnimatedCounter";

interface Stats {
  totalStores: number;
  totalProducts: number;
  totalViews: number;
  totalUsers: number;
}

const PlatformStats = () => {
  const [stats, setStats] = useState<Stats>({
    totalStores: 0,
    totalProducts: 0,
    totalViews: 0,
    totalUsers: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // جلب إحصائيات النظام
        const { data: systemStats } = await supabase
          .from('system_stats')
          .select('*')
          .limit(1)
          .single();

        // جلب عدد المنتجات
        const { count: productsCount } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true });

        setStats({
          totalStores: systemStats?.total_active_stores || 0,
          totalProducts: productsCount || 0,
          totalViews: systemStats?.total_page_views || 0,
          totalUsers: systemStats?.total_users || 0,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statsItems = [
    {
      label: "متجر نشط",
      value: stats.totalStores,
      icon: Store,
      color: "from-cyan-400 to-blue-500",
      bgColor: "bg-cyan-500/10",
    },
    {
      label: "منتج",
      value: stats.totalProducts,
      icon: Package,
      color: "from-purple-400 to-pink-500",
      bgColor: "bg-purple-500/10",
    },
    {
      label: "زيارة",
      value: stats.totalViews,
      icon: Eye,
      color: "from-orange-400 to-red-500",
      bgColor: "bg-orange-500/10",
    },
    {
      label: "مستخدم",
      value: stats.totalUsers,
      icon: Users,
      color: "from-green-400 to-emerald-500",
      bgColor: "bg-green-500/10",
    },
  ];

  if (isLoading) {
    return (
      <section className="py-12 sm:py-16 relative z-10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="p-6 backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl animate-pulse"
              >
                <div className="h-12 w-12 rounded-xl bg-white/10 mx-auto mb-4" />
                <div className="h-8 w-20 bg-white/10 rounded mx-auto mb-2" />
                <div className="h-4 w-16 bg-white/10 rounded mx-auto" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 sm:py-16 relative z-10 overflow-hidden">
      {/* خلفية متوهجة */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-pink-500/10 blur-3xl rounded-full" />
      </div>

      <div className="container mx-auto px-4 relative">
        {/* العنوان */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-10 sm:mb-12"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black mb-3">
            <span className="text-white">إحصائيات </span>
            <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">المنصة</span>
          </h2>
          <p className="text-white/60 text-sm sm:text-base font-bold">
            أرقام تتحدث عن نجاحنا
          </p>
        </motion.div>

        {/* البطاقات */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {statsItems.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              viewport={{ once: true }}
              whileHover={{ y: -5, scale: 1.02 }}
              className="group relative"
            >
              <div className="relative p-5 sm:p-6 backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 hover:border-white/20 transition-all duration-300 overflow-hidden">
                {/* توهج خلفي */}
                <div className={`absolute inset-0 ${item.bgColor} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                
                <div className="relative">
                  {/* الأيقونة */}
                  <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <item.icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                  </div>

                  {/* الرقم */}
                  <div className="text-center">
                    <div className="text-2xl sm:text-3xl md:text-4xl font-black text-white mb-1">
                      <AnimatedCounter end={item.value} duration={2.5} suffix="+" />
                    </div>
                    <p className="text-sm sm:text-base text-white/60 font-bold">{item.label}</p>
                  </div>
                </div>

                {/* خط متحرك في الأسفل */}
                <motion.div
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  transition={{ delay: index * 0.1 + 0.5, duration: 0.8 }}
                  viewport={{ once: true }}
                  className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${item.color} origin-left`}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PlatformStats;
