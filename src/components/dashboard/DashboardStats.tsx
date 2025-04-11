
import { Card, CardContent } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface DashboardStatsProps {
  stats: {
    totalViews: number;
  };
  loading: boolean;
}

const DashboardStats = ({ stats, loading }: DashboardStatsProps) => {
  const statsItem = {
    title: "المشاهدات",
    value: stats.totalViews,
    icon: BarChart3,
    color: "from-[#ff9178] to-[#ffbcad]", // Changed to match coral theme
    bgLight: "bg-[#fff5f2]", // Changed to match coral theme
    bgDark: "dark:bg-[#ff9178]/20", // Changed to match coral theme
    iconColor: "text-[#ff9178] dark:text-[#ffbcad]", // Changed to match coral theme
  };

  return (
    <div className="flex justify-center">
      <Card className="overflow-hidden border border-[#ffbcad]/50 w-full max-w-md">
        <CardContent className="p-6">
          {loading ? (
            <div className="space-y-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-8 w-3/4" />
            </div>
          ) : (
            <div className="flex flex-col space-y-2">
              <div className={`inline-flex rounded-full p-2.5 ${statsItem.bgLight} ${statsItem.bgDark}`}>
                <statsItem.icon className={`h-6 w-6 ${statsItem.iconColor}`} />
              </div>
              <span className="text-sm text-muted-foreground font-medium">{statsItem.title}</span>
              <span className={`text-2xl font-bold bg-gradient-to-r bg-clip-text text-transparent transition-all duration-300 ease-in-out group-hover:opacity-100 group-hover:scale-105 tracking-tight ${statsItem.color}`}>
                {statsItem.value}
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardStats;
