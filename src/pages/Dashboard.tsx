import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Settings, LogOut, Moon, Sun } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [theme, setTheme] = useState<"light" | "dark">("light");

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.classList.toggle("dark");
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast({
        title: "تم تسجيل الخروج بنجاح",
        duration: 3000,
      });
      
      navigate("/auth/login");
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: "حدث خطأ أثناء تسجيل الخروج",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header with Settings Button */}
      <header className="p-4 flex justify-between items-center border-b">
        <h1 className="text-2xl font-bold absolute left-1/2 -translate-x-1/2">لوحة التحكم</h1>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <Settings className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={toggleTheme}>
              {theme === "light" ? (
                <Moon className="ml-2 h-4 w-4" />
              ) : (
                <Sun className="ml-2 h-4 w-4" />
              )}
              {theme === "light" ? "الوضع المظلم" : "الوضع المضيء"}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="ml-2 h-4 w-4" />
              تسجيل الخروج
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      {/* Main Content */}
      <main className="container mx-auto p-6">
        <div className="grid gap-6">
          <div className="rounded-lg border p-4 text-center">
            <h2 className="text-xl font-semibold mb-4">مرحباً بك في لوحة التحكم</h2>
            <p className="text-muted-foreground">
              يمكنك إدارة حسابك وتغيير الإعدادات من هنا
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;