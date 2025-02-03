import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { motion } from "framer-motion";
import StoreNameEditor from "@/components/store/StoreNameEditor";
import ColorThemeSelector from "@/components/store/ColorThemeSelector";

const StoreCustomization = () => {
  const [storeName, setStoreName] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [colorTheme, setColorTheme] = useState("default");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchStoreSettings = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: storeSettings } = await supabase
          .from("store_settings")
          .select("store_name, color_theme")
          .eq("user_id", user.id)
          .single();

        if (storeSettings) {
          setStoreName(storeSettings.store_name || "");
          setColorTheme(storeSettings.color_theme || "default");
        }
      } catch (error) {
        console.error("Error fetching store settings:", error);
      }
    };

    fetchStoreSettings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("يجب تسجيل الدخول أولاً");

      const { data: existingSettings } = await supabase
        .from("store_settings")
        .select("user_id")
        .eq("user_id", user.id)
        .single();

      let result;
      if (existingSettings) {
        result = await supabase
          .from("store_settings")
          .update({ 
            store_name: storeName,
            color_theme: colorTheme,
            updated_at: new Date().toISOString()
          })
          .eq("user_id", user.id);
      } else {
        result = await supabase
          .from("store_settings")
          .insert([{ 
            user_id: user.id, 
            store_name: storeName,
            color_theme: colorTheme
          }]);
      }

      if (result.error) throw result.error;

      toast({
        title: "تم الحفظ بنجاح",
        description: "تم تحديث إعدادات المتجر",
        duration: 3000,
      });

      setIsEditing(false);
    } catch (error: any) {
      console.error("Error saving store settings:", error);
      toast({
        title: "حدث خطأ",
        description: error.message,
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      <main className="container mx-auto p-6">
        <Button
          variant="ghost"
          onClick={() => navigate("/dashboard")}
          className="mb-6"
        >
          <ArrowLeft className="ml-2" />
          العودة للوحة التحكم
        </Button>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto space-y-6"
        >
          <h1 className="text-3xl font-bold mb-8 text-right">تخصيص المتجر</h1>
          
          <StoreNameEditor 
            storeName={storeName}
            setStoreName={setStoreName}
            isEditing={isEditing}
            setIsEditing={setIsEditing}
            handleSubmit={handleSubmit}
            isLoading={isLoading}
          />

          <ColorThemeSelector 
            colorTheme={colorTheme}
            setColorTheme={setColorTheme}
            isLoading={isLoading}
          />
        </motion.div>
      </main>
    </div>
  );
};

export default StoreCustomization;