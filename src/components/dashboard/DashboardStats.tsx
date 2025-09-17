
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
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      {statsItems.map((item, index) => (
        <Card 
          key={index} 
          className="relative overflow-hidden bg-card/50 backdrop-blur-sm border-border/60 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-1 group"
        >
          <CardContent className="p-4 md:p-6">
            {loading ? (
              <div className="space-y-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-8 w-3/4" />
              </div>
            ) : (
              <div className="flex flex-col space-y-3">
                {/* Icon Container */}
                <div className={`inline-flex rounded-xl p-3 w-fit transition-all duration-300 group-hover:scale-110 ${item.bgLight} ${item.bgDark}`}>
                  <item.icon className={`h-5 w-5 md:h-6 md:w-6 ${item.iconColor} transition-all duration-300`} />
                </div>
                
                {/* Title */}
                <span className="text-xs md:text-sm text-muted-foreground font-medium leading-tight">
                  {item.title}
                </span>
                
                {/* Value */}
                <div className="flex items-baseline gap-1">
                  <span className={`text-xl md:text-2xl lg:text-3xl font-bold bg-gradient-to-r bg-clip-text text-transparent transition-all duration-300 ease-in-out tracking-tight ${item.color}`}>
                    {item.value.toLocaleString('ar-SA')}
                  </span>
                </div>
              </div>
            )}
            
            {/* Decorative Background */}
            <div className="absolute -top-2 -right-2 w-16 h-16 rounded-full bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default DashboardStats;
