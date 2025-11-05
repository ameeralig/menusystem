import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft } from "lucide-react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import AvatarUpload from "@/components/profile/AvatarUpload";

const Profile = () => {
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [callmebotApiKey, setCallmebotApiKey] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [userId, setUserId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
      const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          toast({
            title: "خطأ في تحميل الملف الشخصي",
            description: "يجب تسجيل الدخول أولاً",
            variant: "destructive",
          });
          navigate("/login");
          return;
        }

        setUserId(user.id);

        const { data: profile, error } = await supabase
          .from("profiles")
          .select("full_name, phone_number, callmebot_api_key, avatar_url")
          .eq("id", user.id)
          .maybeSingle();

        if (error) throw error;
        
        if (profile) {
          setFullName(profile.full_name || "");
          setPhoneNumber(profile.phone_number || "");
          setCallmebotApiKey(profile.callmebot_api_key || "");
          setAvatarUrl(profile.avatar_url || null);
        }
      } catch (error: any) {
        console.error("Error fetching profile:", error);
        toast({
          title: "خطأ في تحميل الملف الشخصي",
          description: error.message,
          variant: "destructive",
        });
      }
    };

    fetchProfile();
  }, [navigate, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("يجب تسجيل الدخول أولاً");

      const { error } = await supabase
        .from("profiles")
        .update({ 
          full_name: fullName,
          phone_number: phoneNumber,
          callmebot_api_key: callmebotApiKey
        })
        .eq("id", user.id);

      if (error) throw error;

      toast({
        title: "تم الحفظ بنجاح",
        description: "تم تحديث الملف الشخصي",
        duration: 3000,
      });

      navigate("/dashboard");
    } catch (error: any) {
      console.error("Error saving profile:", error);
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

        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold mb-6 text-right">الملف الشخصي</h1>
          
          <div className="mb-8 flex justify-center">
            <AvatarUpload
              currentAvatarUrl={avatarUrl}
              userId={userId}
              userName={fullName}
              onAvatarUpdate={setAvatarUrl}
            />
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="fullName" className="block text-right">
                الاسم الكامل
              </label>
              <Input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="أدخل اسمك الكامل"
                className="text-right"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="phoneNumber" className="block text-right">
                رقم الهاتف
              </label>
              <Input
                id="phoneNumber"
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="أدخل رقم هاتفك"
                className="text-right"
                dir="ltr"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="callmebotApiKey" className="block text-right">
                مفتاح CallMeBot API
              </label>
              <Input
                id="callmebotApiKey"
                type="text"
                value={callmebotApiKey}
                onChange={(e) => setCallmebotApiKey(e.target.value)}
                placeholder="أدخل مفتاح CallMeBot الخاص بك"
                className="text-right"
                dir="ltr"
              />
              <p className="text-sm text-muted-foreground text-right">
                لتفعيل إشعارات WhatsApp، يجب الحصول على مفتاح من CallMeBot عبر إرسال "I allow callmebot to send me messages" للرقم +34 644 09 03 76
              </p>
            </div>

            <Button 
              type="submit" 
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "جاري الحفظ..." : "حفظ التغييرات"}
            </Button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default Profile;