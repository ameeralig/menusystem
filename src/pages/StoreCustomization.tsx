import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Instagram, Facebook, MessageSquare, MapPin, Phone, Wifi, Image } from "lucide-react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { motion } from "framer-motion";
import StoreNameEditor from "@/components/store/StoreNameEditor";
import ColorThemeSelector from "@/components/store/ColorThemeSelector";
import StoreSlugEditor from "@/components/store/StoreSlugEditor";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

type SocialLinks = {
  instagram: string;
  facebook: string;
  telegram: string;
};

type ContactInfo = {
  address: string;
  phone: string;
  wifi: string;
  description: string;
  cover_image: string;
};

const StoreCustomization = () => {
  const [storeName, setStoreName] = useState("");
  const [storeSlug, setStoreSlug] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [colorTheme, setColorTheme] = useState("default");
  const [socialLinks, setSocialLinks] = useState<SocialLinks>({
    instagram: "",
    facebook: "",
    telegram: "",
  });
  const [contactInfo, setContactInfo] = useState<ContactInfo>({
    address: "",
    phone: "",
    wifi: "",
    description: "",
    cover_image: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchStoreSettings = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: storeSettings, error } = await supabase
          .from("store_settings")
          .select("store_name, color_theme, slug, social_links, contact_info")
          .eq("user_id", user.id)
          .maybeSingle();

        if (error) {
          console.error("Error fetching store settings:", error);
          return;
        }

        if (storeSettings) {
          setStoreName(storeSettings.store_name || "");
          setColorTheme(storeSettings.color_theme || "default");
          setStoreSlug(storeSettings.slug || "");
          
          if (storeSettings.social_links) {
            setSocialLinks({
              instagram: (storeSettings.social_links as SocialLinks)?.instagram || "",
              facebook: (storeSettings.social_links as SocialLinks)?.facebook || "",
              telegram: (storeSettings.social_links as SocialLinks)?.telegram || "",
            });
          }
          
          if (storeSettings.contact_info) {
            setContactInfo({
              address: (storeSettings.contact_info as ContactInfo)?.address || "",
              phone: (storeSettings.contact_info as ContactInfo)?.phone || "",
              wifi: (storeSettings.contact_info as ContactInfo)?.wifi || "",
              description: (storeSettings.contact_info as ContactInfo)?.description || "",
              cover_image: (storeSettings.contact_info as ContactInfo)?.cover_image || "",
            });
          }
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
            contact_info: contactInfo,
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
            social_links: socialLinks,
            contact_info: contactInfo
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

  const handleContactInfoChange = (field: keyof ContactInfo) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setContactInfo(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("يجب تسجيل الدخول أولاً");

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-cover-${Date.now()}.${fileExt}`;
      const filePath = `store_covers/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('public')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('public')
        .getPublicUrl(filePath);

      setContactInfo(prev => ({
        ...prev,
        cover_image: publicUrl
      }));

      toast({
        title: "تم رفع الصورة بنجاح",
        description: "تم رفع صورة الغلاف بنجاح",
        duration: 3000,
      });
    } catch (error: any) {
      console.error("Error uploading image:", error);
      toast({
        title: "حدث خطأ",
        description: "فشل في رفع الصورة، حاول مرة أخرى",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setUploadingImage(false);
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
              <CardTitle className="text-right">معلومات الاتصال</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="cover-image" className="text-right block">صورة الغلاف</Label>
                    <div className="flex items-center gap-4">
                      <Input
                        id="cover-image"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="text-right"
                        dir="rtl"
                      />
                      <Image className="w-5 h-5 text-gray-500" />
                    </div>
                    {contactInfo.cover_image && (
                      <div className="mt-2">
                        <img 
                          src={contactInfo.cover_image} 
                          alt="غلاف المتجر" 
                          className="w-full h-40 object-cover rounded-md"
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-4">
                    <Input
                      placeholder="عنوان المتجر"
                      value={contactInfo.address}
                      onChange={handleContactInfoChange('address')}
                      className="text-right"
                      dir="rtl"
                    />
                    <MapPin className="w-5 h-5 text-red-500" />
                  </div>

                  <div className="flex items-center gap-4">
                    <Input
                      placeholder="رقم الهاتف"
                      value={contactInfo.phone}
                      onChange={handleContactInfoChange('phone')}
                      className="text-right"
                      dir="rtl"
                    />
                    <Phone className="w-5 h-5 text-green-500" />
                  </div>

                  <div className="flex items-center gap-4">
                    <Input
                      placeholder="كلمة مرور WiFi"
                      value={contactInfo.wifi}
                      onChange={handleContactInfoChange('wifi')}
                      className="text-right"
                      dir="rtl"
                    />
                    <Wifi className="w-5 h-5 text-blue-500" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-right block">معلومات إضافية</Label>
                    <Textarea
                      id="description"
                      placeholder="يمكنك إضافة معلومات إضافية هنا مثل ساعات العمل وغيرها"
                      value={contactInfo.description}
                      onChange={handleContactInfoChange('description')}
                      className="text-right min-h-20"
                      dir="rtl"
                    />
                  </div>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-purple-600 hover:bg-purple-700"
                  disabled={isLoading || uploadingImage}
                >
                  {isLoading ? "جاري الحفظ..." : "حفظ معلومات الاتصال"}
                </Button>
              </form>
            </CardContent>
          </Card>

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
                    <MessageSquare className="w-5 h-5 text-blue-400" />
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
