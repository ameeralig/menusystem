
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { LogOut, Moon, Sun, User, Bell } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

const DashboardHeader = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof window !== "undefined") {
      return document.documentElement.classList.contains("dark") ? "dark" : "light";
    }
    return "light";
  });
  const [userName, setUserName] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [notificationCount, setNotificationCount] = useState<number>(0);
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [theme]);

  useEffect(() => {
    const getUserInfo = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email);
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', user.id)
          .maybeSingle();
        
        if (profile && profile.full_name) {
          setUserName(profile.full_name);
        } else {
          // Use email as fallback
          setUserName(user.email?.split('@')[0] || 'مستخدم');
        }

        // Fetch new feedback notifications (pending status)
        const { data: feedbackData, error: feedbackError } = await supabase
          .from('feedback')
          .select('*')
          .eq('store_owner_id', user.id)
          .eq('status', 'pending')
          .order('created_at', { ascending: false });
          
        if (feedbackError) {
          console.error("Error fetching feedback:", feedbackError);
        } else {
          setNotificationCount(feedbackData?.length || 0);
          setNotifications(feedbackData || []);
        }
      }
    };

    getUserInfo();

    // Set up real-time listener for new feedback
    const channel = supabase
      .channel('public:feedback')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'feedback',
      }, async (payload) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user && payload.new && payload.new.store_owner_id === user.id) {
          // Refresh notifications when new feedback is received
          getUserInfo();
          
          // Show toast notification
          toast({
            title: "تنبيه جديد",
            description: "لديك شكوى أو اقتراح جديد",
            duration: 5000,
          });
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [toast]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === "light" ? "dark" : "light");
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

  const getAvatarInitials = (name: string | null) => {
    if (!name) return "U";
    return name.charAt(0).toUpperCase();
  };

  const handleNotificationClick = () => {
    navigate("/feedback");
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ar-SA", { 
      year: 'numeric', 
      month: 'numeric', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-border/50 shadow-sm">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <div className="flex gap-4 items-center">
            <h2 className="font-bold text-xl bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              لوحة التحكم
            </h2>
          </div>

          <div className="flex items-center gap-1 md:gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="rounded-full relative">
                  <Bell className="h-5 w-5" />
                  {notificationCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center bg-primary text-[10px]">
                      {notificationCount}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <div className="p-2 border-b border-border">
                  <h3 className="font-medium text-sm">الإشعارات</h3>
                </div>
                {notifications.length > 0 ? (
                  <div className="max-h-[300px] overflow-y-auto">
                    {notifications.map((notification) => (
                      <div 
                        key={notification.id} 
                        className="p-3 border-b last:border-0 hover:bg-muted/50 cursor-pointer"
                        onClick={() => navigate('/feedback')}
                      >
                        <div className="flex justify-between items-start">
                          <span className="text-sm font-medium">
                            {notification.visitor_name}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(notification.created_at)}
                          </span>
                        </div>
                        <p className="text-xs mt-1 text-muted-foreground line-clamp-2">
                          {notification.type === 'complaint' ? 'شكوى' : 'اقتراح'}: {notification.description}
                        </p>
                      </div>
                    ))}
                    <div className="p-2 text-center">
                      <Button 
                        variant="link" 
                        className="text-xs text-primary w-full"
                        onClick={handleNotificationClick}
                      >
                        عرض جميع الإشعارات
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    لا توجد إشعارات جديدة
                  </div>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="outline"
              size="icon"
              className="rounded-full"
              onClick={toggleTheme}
            >
              {theme === "light" ? (
                <Moon className="h-5 w-5" />
              ) : (
                <Sun className="h-5 w-5" />
              )}
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="rounded-full pl-3 gap-2 border-muted"
                >
                  <Avatar className="h-6 w-6">
                    <AvatarImage src="" alt={userName || ""} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {getAvatarInitials(userName)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium hidden md:inline-block max-w-[100px] truncate">
                    {userName || "مستخدم"}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="flex flex-col gap-1 p-2 border-b border-border mb-1">
                  <p className="text-sm font-medium">{userName || "مستخدم"}</p>
                  {userEmail && (
                    <p className="text-xs text-muted-foreground">{userEmail}</p>
                  )}
                </div>
                <DropdownMenuItem 
                  onClick={() => navigate("/profile")} 
                  className="cursor-pointer"
                >
                  <User className="h-4 w-4 ml-2" />
                  الملف الشخصي
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={handleLogout} 
                  className="text-destructive focus:text-destructive cursor-pointer"
                >
                  <LogOut className="h-4 w-4 ml-2" />
                  تسجيل الخروج
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
