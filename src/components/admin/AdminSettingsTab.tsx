
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

const AdminSettingsTab = () => {
  const [systemSettings, setSystemSettings] = useState({
    autoUserApproval: false,
    notifyOnNewUser: true,
    notifyOnNewStore: true,
    dailyReports: true,
  });
  
  const [announcement, setAnnouncement] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  
  const handleSettingChange = (key: string, value: boolean) => {
    setSystemSettings({
      ...systemSettings,
      [key]: value,
    });
  };
  
  const handleSaveSettings = async () => {
    setIsSaving(true);
    
    try {
      // في تطبيق حقيقي، هنا يتم حفظ الإعدادات في قاعدة البيانات
      // لأغراض العرض، سنضيف تأخيراً وهمياً
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "تم حفظ الإعدادات",
        description: "تم حفظ إعدادات النظام بنجاح"
      });
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "حدث خطأ أثناء حفظ الإعدادات"
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleSendAnnouncement = async () => {
    if (!announcement.trim()) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "يرجى كتابة نص الإعلان"
      });
      return;
    }
    
    setIsSaving(true);
    
    try {
      // في تطبيق حقيقي، هنا يتم إرسال الإعلان لجميع المستخدمين
      // لأغراض العرض، سنضيف تأخيراً وهمياً
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "تم إرسال الإعلان",
        description: "تم إرسال الإعلان لجميع المستخدمين بنجاح"
      });
      
      setAnnouncement("");
    } catch (error) {
      console.error("Error sending announcement:", error);
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "حدث خطأ أثناء إرسال الإعلان"
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleUpdateSystemStats = async () => {
    setIsSaving(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('update-system-stats', {
        method: 'POST',
        body: {}
      });
      
      if (error) throw error;
      
      toast({
        title: "تم تحديث الإحصائيات",
        description: "تم تحديث إحصائيات النظام بنجاح"
      });
    } catch (error) {
      console.error("Error updating system stats:", error);
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "حدث خطأ أثناء تحديث إحصائيات النظام"
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>إعدادات النظام</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="auto-approval">الموافقة التلقائية على المستخدمين الجدد</Label>
                <p className="text-sm text-muted-foreground">
                  السماح بالتسجيل دون الحاجة لموافقة المسؤول
                </p>
              </div>
              <Switch
                id="auto-approval"
                checked={systemSettings.autoUserApproval}
                onCheckedChange={(checked) => handleSettingChange("autoUserApproval", checked)}
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="notify-new-user">إشعار عند تسجيل مستخدم جديد</Label>
                <p className="text-sm text-muted-foreground">
                  استلام إشعار عندما يقوم شخص بالتسجيل في النظام
                </p>
              </div>
              <Switch
                id="notify-new-user"
                checked={systemSettings.notifyOnNewUser}
                onCheckedChange={(checked) => handleSettingChange("notifyOnNewUser", checked)}
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="notify-new-store">إشعار عند إنشاء متجر جديد</Label>
                <p className="text-sm text-muted-foreground">
                  استلام إشعار عندما يقوم مستخدم بإنشاء متجر جديد
                </p>
              </div>
              <Switch
                id="notify-new-store"
                checked={systemSettings.notifyOnNewStore}
                onCheckedChange={(checked) => handleSettingChange("notifyOnNewStore", checked)}
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="daily-reports">تقارير يومية</Label>
                <p className="text-sm text-muted-foreground">
                  استلام تقرير يومي عن نشاط النظام عبر البريد الإلكتروني
                </p>
              </div>
              <Switch
                id="daily-reports"
                checked={systemSettings.dailyReports}
                onCheckedChange={(checked) => handleSettingChange("dailyReports", checked)}
              />
            </div>
            
            <Button 
              className="mt-4 w-full"
              onClick={handleSaveSettings}
              disabled={isSaving}
            >
              {isSaving ? "جارِ الحفظ..." : "حفظ الإعدادات"}
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>إرسال إعلان لجميع المستخدمين</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="announcement">نص الإعلان</Label>
              <Textarea
                id="announcement"
                placeholder="اكتب نص الإعلان هنا..."
                value={announcement}
                onChange={(e) => setAnnouncement(e.target.value)}
                rows={4}
                className="mt-1"
              />
            </div>
            
            <Button 
              className="w-full"
              onClick={handleSendAnnouncement}
              disabled={isSaving || !announcement.trim()}
            >
              {isSaving ? "جارِ الإرسال..." : "إرسال الإعلان لجميع المستخدمين"}
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>تحديث إحصائيات النظام</CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <p className="text-sm text-muted-foreground mb-4">
              يمكنك تحديث إحصائيات النظام يدوياً للحصول على أحدث البيانات
            </p>
            
            <Button 
              className="w-full"
              onClick={handleUpdateSystemStats}
              disabled={isSaving}
            >
              {isSaving ? "جارِ التحديث..." : "تحديث إحصائيات النظام"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSettingsTab;
