import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Palette, Store, Save } from "lucide-react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const colorThemes = [
  { id: "default", name: "الافتراضي", value: "default" },
  { id: "purple", name: "بنفسجي", value: "purple" },
  { id: "blue", name: "أزرق", value: "blue" },
  { id: "green", name: "أخضر", value: "green" },
  { id: "pink", name: "وردي", value: "pink" },
];

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
          
          <Card className="border-2 border-purple-100 dark:border-purple-900">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <Store className="h-5 w-5 text-purple-500" />
                <span>اسم المتجر</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex items-center gap-4">
                  <Input
                    type="text"
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    placeholder="أدخل اسم المتجر"
                    className="text-right flex-1"
                    disabled={!isEditing}
                  />
                  <Button
                    type="button"
                    variant={isEditing ? "destructive" : "outline"}
                    onClick={() => setIsEditing(!isEditing)}
                  >
                    {isEditing ? "إلغاء" : "تعديل"}
                  </Button>
                </div>

                {isEditing && (
                  <Button 
                    type="submit" 
                    className="w-full bg-purple-600 hover:bg-purple-700"
                    disabled={isLoading}
                  >
                    <Save className="ml-2 h-4 w-4" />
                    {isLoading ? "جاري الحفظ..." : "حفظ التغييرات"}
                  </Button>
                )}
              </form>
            </CardContent>
          </Card>

          <Card className="border-2 border-purple-100 dark:border-purple-900">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <Palette className="h-5 w-5 text-purple-500" />
                <span>مظهر المتجر</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-right text-sm text-gray-600 dark:text-gray-400">
                    اختر لون المتجر
                  </label>
                  <Select
                    value={colorTheme}
                    onValueChange={setColorTheme}
                  >
                    <SelectTrigger className="w-full text-right">
                      <SelectValue placeholder="اختر لون المتجر" />
                    </SelectTrigger>
                    <SelectContent>
                      {colorThemes.map((theme) => (
                        <SelectItem
                          key={theme.id}
                          value={theme.value}
                          className="text-right"
                        >
                          {theme.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-purple-600 hover:bg-purple-700"
                  disabled={isLoading}
                >
                  <Save className="ml-2 h-4 w-4" />
                  {isLoading ? "جاري الحفظ..." : "حفظ التغييرات"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
};

export default StoreCustomization;