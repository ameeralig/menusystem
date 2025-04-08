
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import StoreNameEditor from "@/components/store/StoreNameEditor";
import StoreSlugEditor from "@/components/store/StoreSlugEditor";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Palette, Instagram, Phone } from "lucide-react";
import ColorThemeSelector from "@/components/store/ColorThemeSelector";
import StoreSocialLinksEditor from "@/components/store/StoreSocialLinksEditor";
import StoreContactInfoEditor from "@/components/store/StoreContactInfoEditor";
import StoreSettingsForm from "@/components/store/StoreSettingsForm";
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
            <StoreSettingsForm 
              isEditing={isEditing} 
              setIsEditing={setIsEditing}
              handleSubmit={handleSubmit}
              isLoading={isLoading}
            >
              <ColorThemeSelector 
                colorTheme={colorTheme} 
                setColorTheme={setColorTheme} 
                isLoading={isLoading}
                handleSubmit={handleSubmit}
              />
            </StoreSettingsForm>
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
            <StoreSettingsForm 
              isEditing={isEditing} 
              setIsEditing={setIsEditing}
              handleSubmit={handleSubmit}
              isLoading={isLoading}
            >
              <StoreSocialLinksEditor 
                instagram={instagram}
                setInstagram={setInstagram}
                facebook={facebook}
                setFacebook={setFacebook}
                telegram={telegram}
                setTelegram={setTelegram}
                isEditing={isEditing}
              />
            </StoreSettingsForm>
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
            <StoreSettingsForm 
              isEditing={isEditing} 
              setIsEditing={setIsEditing}
              handleSubmit={handleSubmit}
              isLoading={isLoading}
            >
              <StoreContactInfoEditor 
                address={address}
                setAddress={setAddress}
                phone={phone}
                setPhone={setPhone}
                wifi={wifi}
                setWifi={setWifi}
                description={description}
                setDescription={setDescription}
                coverImage={coverImage}
                setCoverImage={setCoverImage}
                isEditing={isEditing}
                isLoading={isLoading}
              />
            </StoreSettingsForm>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StoreCustomization;
