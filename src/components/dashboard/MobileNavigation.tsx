import { LayoutDashboard, Settings, Store } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

const MobileNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [employeeSystemEnabled, setEmployeeSystemEnabled] = useState(false);

  useEffect(() => {
    const checkEmployeeSystem = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data } = await supabase
          .from('store_settings')
          .select('employee_system_enabled')
          .eq('user_id', user.id)
          .maybeSingle();

        setEmployeeSystemEnabled(data?.employee_system_enabled || false);
      } catch (error) {
        console.error("Error checking employee system:", error);
      }
    };

    checkEmployeeSystem();
  }, []);

  const navItems = employeeSystemEnabled ? [
    {
      icon: LayoutDashboard,
      label: "الرئيسية",
      path: "/dashboard",
      action: () => navigate("/dashboard"),
    },
    {
      icon: Store,
      label: "إدارة المبيعات",
      path: "/sales-management", 
      action: () => {
        console.log("Navigating to sales management");
        navigate("/sales-management");
      },
    },
    {
      icon: Settings,
      label: "الإعدادات",
      path: "/store-customization",
      action: () => navigate("/store-customization"),
    },
  ] : [
    {
      icon: LayoutDashboard,
      label: "الرئيسية",
      path: "/dashboard",
      action: () => navigate("/dashboard"),
    },
    {
      icon: Settings,
      label: "الإعدادات",
      path: "/store-customization",
      action: () => navigate("/store-customization"),
    },
  ];

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-md">
      <div className="glass-morphism rounded-2xl px-6 py-3 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] border border-white/20">
        <div className="flex justify-around items-center">
          {navItems.map((item) => {
          const isActive = location.pathname === item.path || (item.path === "/dashboard" && location.pathname === "/dashboard");
          return (
            <button
              key={item.path}
              onClick={item.action}
              className={cn(
                "flex flex-col items-center justify-center px-3 py-2 rounded-xl transition-all duration-300",
                isActive && item.path === "/dashboard"
                  ? "text-primary bg-primary/10 shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <item.icon className={cn("h-5 w-5 mb-1", isActive && item.path === "/dashboard" && "animate-scale-in")} />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          );
        })}
        </div>
      </div>
    </div>
  );
};

export default MobileNavigation;