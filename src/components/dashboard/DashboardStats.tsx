
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { BarChart3, Users, ShoppingBag, CircleDollarSign } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface DashboardStatsProps {
  stats: {
    totalViews: number;
    totalProducts: number;
    totalOrders: number;
    totalRevenue: number;
  };
  loading: boolean;
}

const DashboardStats = ({ stats, loading }: DashboardStatsProps) => {
  const statsItems = [
    {
      title: "المشاهدات",
      value: stats.totalViews,
      icon: BarChart3,
      color: "from-blue-600 to-indigo-600",
      bgLight: "bg-blue-50",
      bgDark: "dark:bg-blue-900/20",
      iconColor: "text-blue-600 dark:text-blue-400",
    },
    {
      title: "المنتجات",
      value: stats.totalProducts,
      icon: ShoppingBag,
      color: "from-purple-600 to-violet-600",
      bgLight: "bg-purple-50",
      bgDark: "dark:bg-purple-900/20",
      iconColor: "text-purple-600 dark:text-purple-400",
    },
    {
      title: "الطلبات",
      value: stats.totalOrders,
      icon: Users,
      color: "from-amber-500 to-orange-600",
      bgLight: "bg-amber-50",
      bgDark: "dark:bg-amber-900/20",
      iconColor: "text-amber-600 dark:text-amber-400",
    },
    {
      title: "الإيرادات",
      value: stats.totalRevenue.toLocaleString("ar-IQ") + " د.ع",
      icon: CircleDollarSign,
      color: "from-green-500 to-emerald-600",
      bgLight: "bg-green-50", 
      bgDark: "dark:bg-green-900/20",
      iconColor: "text-green-600 dark:text-green-400",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statsItems.map((item, index) => (
        <Card key={index} className="overflow-hidden border border-border/50">
          <CardContent className="p-6">
            {loading ? (
              <div className="space-y-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-8 w-3/4" />
              </div>
            ) : (
              <div className="flex flex-col space-y-2">
                <div className={`inline-flex rounded-full p-2.5 ${item.bgLight} ${item.bgDark}`}>
                  <item.icon className={`h-6 w-6 ${item.iconColor}`} />
                </div>
                <span className="text-sm text-muted-foreground font-medium">{item.title}</span>
                <span className="text-2xl font-bold bg-gradient-to-r bg-clip-text text-transparent transition-all duration-300 ease-in-out group-hover:opacity-100 group-hover:scale-105 tracking-tight ${item.color}">
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
