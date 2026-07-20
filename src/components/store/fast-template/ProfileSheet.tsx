import { useState, useEffect } from "react";
import { User, Trash2, AlertTriangle, Save } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import AvatarUpload from "@/components/profile/AvatarUpload";
import TelegramLinkSection from "@/components/profile/TelegramLinkSection";

interface ProfileSheetProps {
  colorTheme?: string | null;
  onBeforeOpen?: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  hideTrigger?: boolean;
}

const ProfileSheet = ({ colorTheme, onBeforeOpen, open, onOpenChange, hideTrigger }: ProfileSheetProps) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = open !== undefined;
  const isOpen = isControlled ? open! : internalOpen;
  const setIsOpen = (o: boolean) => {
    if (isControlled) onOpenChange?.(o);
    else setInternalOpen(o);
  };
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [callmebotApiKey, setCallmebotApiKey] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [userId, setUserId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const getThemeColor = () => {
    if (colorTheme?.startsWith('#')) return colorTheme;
    
    const themeColors: { [key: string]: string } = {
      coral: '#ff9178',
      purple: '#8b5cf6',
      blue: '#3b82f6',
      green: '#10b981',
      pink: '#ec4899',
      teal: '#14b8a6',
      amber: '#f59e0b',
      indigo: '#6366f1',
      rose: '#f43f5e',
    };
    
    return themeColors[colorTheme || ''] || '#3b82f6';
  };

  const themeColor = getThemeColor();

  useEffect(() => {
    if (isOpen) {
      fetchProfile();
    }
  }, [isOpen]);

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

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
    }
  };

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

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("يجب تسجيل الدخول أولاً");
      }

      const { data, error } = await supabase.functions.invoke('delete-user-account', {
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (error) throw error;

      toast({
        title: "تم حذف الحساب",
        description: "تم حذف حسابك وجميع بياناتك بنجاح",
        duration: 5000,
      });

      await supabase.auth.signOut();
      navigate("/");
    } catch (error: any) {
      console.error("Error deleting account:", error);
      toast({
        title: "خطأ في حذف الحساب",
        description: error.message || "حدث خطأ أثناء حذف الحساب",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={(o) => { if (o) onBeforeOpen?.(); setIsOpen(o); }}>
      <SheetTrigger asChild>
        <div
          className="flex items-center justify-between p-3 rounded-lg bg-background/50 backdrop-blur-sm cursor-pointer hover:bg-background/70 transition-colors"
        >
          <div className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span className="text-sm font-medium">الملف الشخصي</span>
          </div>
          <span className="text-xs text-muted-foreground">←</span>
        </div>
      </SheetTrigger>
      <SheetContent 
        side="bottom" 
        className="h-[90vh] overflow-y-auto rounded-t-3xl"
        style={{
          background: `linear-gradient(135deg, ${themeColor}08, ${themeColor}15)`,
        }}
      >
        <SheetHeader className="mb-6">
          <SheetTitle className="text-xl" style={{ color: themeColor }}>
            الملف الشخصي
          </SheetTitle>
        </SheetHeader>

        <div className="space-y-6">
          {/* Avatar */}
          <div className="flex justify-center">
            <AvatarUpload
              currentAvatarUrl={avatarUrl}
              userId={userId}
              userName={fullName}
              onAvatarUpdate={setAvatarUrl}
            />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-right block">
                الاسم الكامل
              </Label>
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
              <Label htmlFor="phoneNumber" className="text-right block">
                رقم الهاتف
              </Label>
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
              <Label htmlFor="callmebotApiKey" className="text-right block">
                مفتاح CallMeBot API
              </Label>
              <Input
                id="callmebotApiKey"
                type="text"
                value={callmebotApiKey}
                onChange={(e) => setCallmebotApiKey(e.target.value)}
                placeholder="أدخل مفتاح CallMeBot الخاص بك"
                className="text-right"
                dir="ltr"
              />
              <p className="text-xs text-muted-foreground text-right">
                لتفعيل إشعارات WhatsApp
              </p>
            </div>

            <Button 
              type="submit" 
              className="w-full gap-2"
              disabled={isLoading}
              style={{ background: themeColor }}
            >
              <Save className="h-4 w-4" />
              {isLoading ? "جاري الحفظ..." : "حفظ التغييرات"}
            </Button>
          </form>

          {/* Telegram Integration */}
          <TelegramLinkSection themeColor={themeColor} />



          {/* Danger Zone */}
          <div className="pt-6 border-t border-destructive/20">
            <h3 className="text-lg font-bold text-destructive mb-3 text-right">منطقة الخطر</h3>
            <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-lg">
              <div className="flex items-start gap-3 mb-4">
                <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
                <div className="text-right">
                  <p className="font-medium text-destructive">حذف الحساب نهائياً</p>
                  <p className="text-sm text-muted-foreground">
                    سيتم حذف حسابك وجميع بياناتك بشكل نهائي
                  </p>
                </div>
              </div>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="destructive" 
                    className="w-full gap-2"
                    disabled={isDeleting}
                  >
                    <Trash2 className="h-4 w-4" />
                    حذف الحساب نهائياً
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-right">
                      هل أنت متأكد من حذف حسابك؟
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-right">
                      هذا الإجراء لا يمكن التراجع عنه. سيتم حذف جميع بياناتك.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter className="flex-row-reverse gap-2">
                    <AlertDialogCancel>إلغاء</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteAccount}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      disabled={isDeleting}
                    >
                      {isDeleting ? "جاري الحذف..." : "نعم، احذف حسابي"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ProfileSheet;
