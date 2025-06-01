
import { Card, CardContent } from "@/components/ui/card";
import { BarChart3, Package, Eye, TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface DashboardStatsProps {
  stats: {
    totalViews: number;
    totalProducts: number;
    activeProducts: number;
    popularProducts: number;
  };
  loading: boolean;
}

const DashboardStats = ({ stats, loading }: DashboardStatsProps) => {
  const statsItems = [
    {
      title: "إجمالي المشاهدات",
      value: stats.totalViews,
      icon: Eye,
      color: "from-[#ff9178] to-[#ffbcad]",
      bgLight: "bg-[#fff5f2]",
      bgDark: "dark:bg-[#ff9178]/20",
      iconColor: "text-[#ff9178] dark:text-[#ffbcad]",
    },
    {
      title: "إجمالي المنتجات",
      value: stats.totalProducts,
      icon: Package,
      color: "from-blue-500 to-blue-400",
      bgLight: "bg-blue-50",
      bgDark: "dark:bg-blue-500/20",
      iconColor: "text-blue-500 dark:text-blue-400",
    },
    {
      title: "المنتجات المتاحة",
      value: stats.activeProducts,
      icon: TrendingUp,
      color: "from-green-500 to-green-400",
      bgLight: "bg-green-50",
      bgDark: "dark:bg-green-500/20",
      iconColor: "text-green-500 dark:text-green-400",
    },
    {
      title: "المنتجات الشائعة",
      value: stats.popularProducts,
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
            {loading ? (
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
