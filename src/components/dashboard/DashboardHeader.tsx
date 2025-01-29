import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Settings, LogOut, Moon, Sun, User } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const DashboardHeader = () => {
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
    <header className="p-6 flex justify-center items-center border-b relative bg-white/80 backdrop-blur-sm shadow-lg">
      <h1 className="text-3xl font-bold bg-gradient-to-r from-[#9b87f5] to-[#7E69AB] bg-clip-text text-transparent">
        مرحباً بك في لوحة التحكم
      </h1>
      <div className="absolute right-6">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="hover:bg-[#E5DEFF] transition-colors duration-200"
            >
              <Settings className="h-5 w-5 text-[#6E59A5]" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-white/95 backdrop-blur-sm">
            <DropdownMenuItem 
              onClick={() => navigate("/profile")} 
              className="gap-2 hover:bg-[#E5DEFF] cursor-pointer"
            >
              <User className="h-4 w-4 text-[#7E69AB]" />
              الملف الشخصي
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={toggleTheme} 
              className="gap-2 hover:bg-[#E5DEFF] cursor-pointer"
            >
              {theme === "light" ? (
                <Moon className="h-4 w-4 text-[#7E69AB]" />
              ) : (
                <Sun className="h-4 w-4 text-[#7E69AB]" />
              )}
              {theme === "light" ? "الوضع المظلم" : "الوضع المضيء"}
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={handleLogout} 
              className="gap-2 text-red-600 hover:bg-red-50 hover:text-red-700 cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
              تسجيل الخروج
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default DashboardHeader;