
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import StoreNameEditor from "@/components/store/StoreNameEditor";
import StoreSlugEditor from "@/components/store/StoreSlugEditor";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Palette, Upload, Instagram, Facebook, SendHorizonal, MapPin, Phone, Wifi, FileText } from "lucide-react";
import ColorThemeSelector from "@/components/store/ColorThemeSelector";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { Json } from "@/integrations/supabase/types";

// Define types for the JSON data to ensure proper type safety
type SocialLinks = {
  instagram?: string;
  facebook?: string;
  telegram?: string;
};

type ContactInfo = {
  address?: string;
  phone?: string;
  wifi?: string;
  description?: string;
  cover_image?: string;
};

const StoreCustomization = () => {
  const { toast } = useToast();
  const [storeName, setStoreName] = useState("");
  const [storeSlug, setStoreSlug] = useState("");
  const [colorTheme, setColorTheme] = useState("default");
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // Social Links State
  const [instagram, setInstagram] = useState("");
  const [facebook, setFacebook] = useState("");
  const [telegram, setTelegram] = useState("");
  
  // Contact Info State
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [wifi, setWifi] = useState("");
  const [description, setDescription] = useState("");
  const [coverImage, setCoverImage] = useState("");

  useEffect(() => {
    const fetchStoreSettings = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          toast({
            title: "يجب تسجيل الدخول أولاً",
            variant: "destructive",
          });
          return;
        }

        const { data, error } = await supabase
          .from("store_settings")
          .select("store_name, color_theme, slug, social_links, contact_info")
          .eq("user_id", user.id)
          .maybeSingle();

        if (error) {
          console.error("Error fetching store settings:", error);
          toast({
            title: "خطأ في جلب البيانات",
            description: error.message,
            variant: "destructive",
          });
          return;
        }

        if (data) {
          setStoreName(data.store_name || "");
          setColorTheme(data.color_theme || "default");
          setStoreSlug(data.slug || "");
          
          // Set social links with proper type checking
          if (data.social_links) {
            const socialLinks = data.social_links as SocialLinks;
            setInstagram(socialLinks.instagram || "");
            setFacebook(socialLinks.facebook || "");
            setTelegram(socialLinks.telegram || "");
          }
          
          // Set contact info with proper type checking
          if (data.contact_info) {
            const contactInfo = data.contact_info as ContactInfo;
            setAddress(contactInfo.address || "");
            setPhone(contactInfo.phone || "");
            setWifi(contactInfo.wifi || "");
            setDescription(contactInfo.description || "");
            setCoverImage(contactInfo.cover_image || "");
          }
        }
      } catch (error: any) {
        console.error("Error:", error);
        toast({
          title: "حدث خطأ",
          description: error.message,
          variant: "destructive",
        });
      }
    };

    fetchStoreSettings();
  }, [toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("يجب تسجيل الدخول أولاً");

      // Prepare social links object
      const socialLinks = {
        instagram,
        facebook,
        telegram
      };

      // Prepare contact info object
      const contactInfo = {
        address,
        phone,
        wifi,
        description,
        cover_image: coverImage
      };

      const { data: existingSettings, error: checkError } = await supabase
        .from("store_settings")
        .select("user_id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (checkError) {
        console.error("Error checking existing settings:", checkError);
        throw new Error("حدث خطأ أثناء التحقق من البيانات الحالية");
      }

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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsLoading(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("يجب تسجيل الدخول أولاً");

      // Create a unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `store-covers/${fileName}`;

      const { error: uploadError } = await supabase
        .storage
        .from('public')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data: publicUrl } = supabase
        .storage
        .from('public')
        .getPublicUrl(filePath);

      setCoverImage(publicUrl.publicUrl);

      toast({
        title: "تم رفع الصورة بنجاح",
        duration: 3000,
      });
    } catch (error: any) {
      console.error("Error uploading image:", error);
      toast({
        title: "حدث خطأ أثناء رفع الصورة",
        description: error.message,
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">تخصيص المتجر</h1>
        <p className="text-muted-foreground">قم بتخصيص مظهر متجرك وإضافة معلومات التواصل</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        {/* Store Name */}
        <StoreNameEditor 
          storeName={storeName}
          setStoreName={setStoreName}
          isEditing={isEditing}
          setIsEditing={setIsEditing}
          handleSubmit={handleSubmit}
          isLoading={isLoading}
        />

        {/* Store Slug */}
        <StoreSlugEditor 
          storeSlug={storeSlug}
          setStoreSlug={setStoreSlug}
          isEditing={isEditing}
          setIsEditing={setIsEditing}
          handleSubmit={handleSubmit}
          isLoading={isLoading}
        />

        {/* Theme Selection */}
        <Card className="border-2 border-purple-100 dark:border-purple-900">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <Palette className="h-5 w-5 text-purple-500" />
              <span>سمة المتجر</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <ColorThemeSelector 
                colorTheme={colorTheme} 
                setColorTheme={setColorTheme} 
                isLoading={isLoading}
                handleSubmit={handleSubmit}
              />

              {isEditing && (
                <Button 
                  type="submit" 
                  className="w-full bg-purple-600 hover:bg-purple-700"
                  disabled={isLoading}
                >
                  {isLoading ? "جاري الحفظ..." : "حفظ التغييرات"}
                </Button>
              )}
            </form>
          </CardContent>
        </Card>

        {/* Social Links */}
        <Card className="border-2 border-purple-100 dark:border-purple-900">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <Instagram className="h-5 w-5 text-purple-500" />
              <span>روابط التواصل الاجتماعي</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Instagram className="h-5 w-5 text-pink-500" />
                  <Input
                    type="text"
                    value={instagram}
                    onChange={(e) => setInstagram(e.target.value)}
                    placeholder="رابط انستغرام"
                    className="text-right"
                    disabled={!isEditing}
                  />
                </div>
                <div className="flex items-center gap-3">
                  <Facebook className="h-5 w-5 text-blue-500" />
                  <Input
                    type="text"
                    value={facebook}
                    onChange={(e) => setFacebook(e.target.value)}
                    placeholder="رابط فيسبوك"
                    className="text-right"
                    disabled={!isEditing}
                  />
                </div>
                <div className="flex items-center gap-3">
                  <SendHorizonal className="h-5 w-5 text-blue-400" />
                  <Input
                    type="text"
                    value={telegram}
                    onChange={(e) => setTelegram(e.target.value)}
                    placeholder="رابط تيليجرام"
                    className="text-right"
                    disabled={!isEditing}
                  />
                </div>
              </div>

              {isEditing && (
                <Button 
                  type="submit" 
                  className="w-full bg-purple-600 hover:bg-purple-700"
                  disabled={isLoading}
                >
                  {isLoading ? "جاري الحفظ..." : "حفظ التغييرات"}
                </Button>
              )}
            </form>
          </CardContent>
        </Card>

        {/* Contact Info */}
        <Card className="border-2 border-purple-100 dark:border-purple-900 md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <Phone className="h-5 w-5 text-purple-500" />
              <span>معلومات التواصل والموقع</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-red-500" />
                    <Input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="عنوان المتجر"
                      className="text-right"
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-green-500" />
                    <Input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="رقم الهاتف"
                      className="text-right"
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <Wifi className="h-5 w-5 text-blue-500" />
                    <Input
                      type="text"
                      value={wifi}
                      onChange={(e) => setWifi(e.target.value)}
                      placeholder="كلمة مرور الواي فاي"
                      className="text-right"
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <FileText className="h-5 w-5 mt-2 text-gray-500" />
                    <Textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="وصف المتجر"
                      className="text-right min-h-[100px]"
                      disabled={!isEditing}
                    />
                  </div>
                  
                  {isEditing && (
                    <div className="flex items-center gap-3">
                      <Upload className="h-5 w-5 text-purple-500" />
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="text-right"
                      />
                    </div>
                  )}
                  
                  {coverImage && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-500 mb-2 text-right">صورة الغلاف:</p>
                      <img 
                        src={coverImage} 
                        alt="صورة الغلاف" 
                        className="w-full h-32 object-cover rounded-md" 
                      />
                    </div>
                  )}
                </div>
              </div>

              {isEditing && (
                <Button 
                  type="submit" 
                  className="w-full bg-purple-600 hover:bg-purple-700"
                  disabled={isLoading}
                >
                  {isLoading ? "جاري الحفظ..." : "حفظ التغييرات"}
                </Button>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StoreCustomization;
