
import { Card, CardContent } from "@/components/ui/card";
import { BarChart3, Package, Eye, TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface DashboardStatsProps {
  stats: {
    totalViews: number;
  };
  loading: boolean;
}

interface ExtendedStats {
  totalViews: number;
  totalProducts: number;
  activeProducts: number;
  popularProducts: number;
}

const DashboardStats = ({ stats, loading }: DashboardStatsProps) => {
  const [extendedStats, setExtendedStats] = useState<ExtendedStats>({
    totalViews: 0,
    totalProducts: 0,
    activeProducts: 0,
    popularProducts: 0,
  });
  const [extendedLoading, setExtendedLoading] = useState(true);

  useEffect(() => {
    const fetchExtendedStats = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          // Get products statistics
          const { data: productsData, error: productsError } = await supabase
            .from("products")
            .select("is_available, is_popular")
            .eq("user_id", user.id);
          
          if (productsError) {
            console.error("Error fetching products:", productsError);
            return;
          }
          
          const totalProducts = productsData?.length || 0;
          const activeProducts = productsData?.filter(product => product.is_available).length || 0;
          const popularProducts = productsData?.filter(product => product.is_popular).length || 0;
          
          setExtendedStats({
            totalViews: stats.totalViews,
            totalProducts,
            activeProducts,
            popularProducts,
          });
        }
      } catch (error) {
        console.error("Error fetching extended stats:", error);
      } finally {
        setExtendedLoading(false);
      }
    };

    if (!loading) {
      fetchExtendedStats();
    }
  }, [loading, stats.totalViews]);

  const statsItems = [
    {
      title: "إجمالي المشاهدات",
      value: extendedStats.totalViews,
      icon: Eye,
      color: "from-[#ff9178] to-[#ffbcad]",
      bgLight: "bg-[#fff5f2]",
      bgDark: "dark:bg-[#ff9178]/20",
      iconColor: "text-[#ff9178] dark:text-[#ffbcad]",
    },
    {
      title: "إجمالي المنتجات",
      value: extendedStats.totalProducts,
      icon: Package,
      color: "from-blue-500 to-blue-400",
      bgLight: "bg-blue-50",
      bgDark: "dark:bg-blue-500/20",
      iconColor: "text-blue-500 dark:text-blue-400",
    },
    {
      title: "المنتجات المتاحة",
      value: extendedStats.activeProducts,
      icon: TrendingUp,
      color: "from-green-500 to-green-400",
      bgLight: "bg-green-50",
      bgDark: "dark:bg-green-500/20",
      iconColor: "text-green-500 dark:text-green-400",
    },
    {
      title: "المنتجات الشائعة",
      value: extendedStats.popularProducts,
      icon: BarChart3,
      color: "from-purple-500 to-purple-400",
      bgLight: "bg-purple-50",
      bgDark: "dark:bg-purple-500/20",
      iconColor: "text-purple-500 dark:text-purple-400",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statsItems.map((item, index) => (
        <Card key={index} className="overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            {loading || extendedLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-8 w-3/4" />
              </div>
            ) : (
              <div className="flex flex-col space-y-3">
                <div className={`inline-flex rounded-full p-2.5 w-fit ${item.bgLight} ${item.bgDark}`}>
                  <item.icon className={`h-6 w-6 ${item.iconColor}`} />
                </div>
                <span className="text-sm text-muted-foreground font-medium">{item.title}</span>
                <span className={`text-2xl font-bold bg-gradient-to-r bg-clip-text text-transparent transition-all duration-300 ease-in-out tracking-tight ${item.color}`}>
                  {item.value}
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default DashboardStats;
