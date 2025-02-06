
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Instagram, Facebook, Telegram } from "lucide-react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { motion } from "framer-motion";
import StoreNameEditor from "@/components/store/StoreNameEditor";
import ColorThemeSelector from "@/components/store/ColorThemeSelector";
import StoreSlugEditor from "@/components/store/StoreSlugEditor";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const StoreCustomization = () => {
  const [storeName, setStoreName] = useState("");
  const [storeSlug, setStoreSlug] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [colorTheme, setColorTheme] = useState("default");
  const [socialLinks, setSocialLinks] = useState({
    instagram: "",
    facebook: "",
    telegram: "",
  });
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
          .select("store_name, color_theme, slug, social_links")
          .eq("user_id", user.id)
          .single();

        if (storeSettings) {
          setStoreName(storeSettings.store_name || "");
          setColorTheme(storeSettings.color_theme || "default");
          setStoreSlug(storeSettings.slug || "");
          setSocialLinks(storeSettings.social_links || {
            instagram: "",
            facebook: "",
            telegram: "",
          });
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
            slug: storeSlug,
            social_links: socialLinks,
            updated_at: new Date().toISOString()
          })
          .eq("user_id", user.id);
      } else {
        result = await supabase
          .from("store_settings")
          .insert([{ 
            user_id: user.id, 
            store_name: storeName,
            color_theme: colorTheme,
            slug: storeSlug,
            social_links: socialLinks
          }]);
      }

      if (result.error) {
        if (result.error.code === '23505') {
          throw new Error("هذا الرابط مستخدم بالفعل، الرجاء اختيار رابط آخر");
        }
        throw result.error;
      }

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

  const handleSocialLinkChange = (platform: keyof typeof socialLinks) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setSocialLinks(prev => ({
      ...prev,
      [platform]: e.target.value
    }));
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

          <StoreSlugEditor
            storeSlug={storeSlug}
            setStoreSlug={setStoreSlug}
            isEditing={isEditing}
            setIsEditing={setIsEditing}
            handleSubmit={handleSubmit}
            isLoading={isLoading}
          />

          <ColorThemeSelector 
            colorTheme={colorTheme}
            setColorTheme={setColorTheme}
            handleSubmit={handleSubmit}
            isLoading={isLoading}
          />

          <Card className="border-2 border-purple-100 dark:border-purple-900">
            <CardHeader>
              <CardTitle className="text-right">روابط التواصل الاجتماعي</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Input
                      type="url"
                      placeholder="رابط الإنستقرام"
                      value={socialLinks.instagram}
                      onChange={handleSocialLinkChange('instagram')}
                      className="text-right"
                      dir="rtl"
                    />
                    <Instagram className="w-5 h-5 text-pink-500" />
                  </div>

                  <div className="flex items-center gap-4">
                    <Input
                      type="url"
                      placeholder="رابط الفيسبوك"
                      value={socialLinks.facebook}
                      onChange={handleSocialLinkChange('facebook')}
                      className="text-right"
                      dir="rtl"
                    />
                    <Facebook className="w-5 h-5 text-blue-500" />
                  </div>

                  <div className="flex items-center gap-4">
                    <Input
                      type="url"
                      placeholder="رابط التليجرام"
                      value={socialLinks.telegram}
                      onChange={handleSocialLinkChange('telegram')}
                      className="text-right"
                      dir="rtl"
                    />
                    <Telegram className="w-5 h-5 text-blue-400" />
                  </div>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-purple-600 hover:bg-purple-700"
                  disabled={isLoading}
                >
                  {isLoading ? "جاري الحفظ..." : "حفظ الروابط"}
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
