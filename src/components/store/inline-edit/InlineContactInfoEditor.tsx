import { useState } from "react";
import { MapPin, Phone, Wifi, Info, Clock, Edit2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger, 
} from "@/components/ui/collapsible";

type ContactInfo = {
  description?: string | null;
  address?: string | null;
  phone?: string | null;
  wifi?: string | null;
  businessHours?: string | null;
};

interface InlineContactInfoEditorProps {
  contactInfo?: ContactInfo;
  colorTheme: string | null;
  storeOwnerId: string;
  onUpdate: () => void;
}

const InlineContactInfoEditor = ({
  contactInfo,
  colorTheme,
  storeOwnerId,
  onUpdate,
}: InlineContactInfoEditorProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isWifiCodeVisible, setIsWifiCodeVisible] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const [editedInfo, setEditedInfo] = useState<ContactInfo>({
    description: contactInfo?.description || "",
    address: contactInfo?.address || "",
    phone: contactInfo?.phone || "",
    wifi: contactInfo?.wifi || "",
    businessHours: contactInfo?.businessHours || "",
  });

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("store_settings")
        .update({
          contact_info: editedInfo,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", storeOwnerId);

      if (error) throw error;

      toast.success("تم حفظ معلومات المتجر");
      setIsEditing(false);
      onUpdate();
    } catch (error) {
      console.error("خطأ في حفظ معلومات المتجر:", error);
      toast.error("فشل حفظ معلومات المتجر");
    } finally {
      setIsSaving(false);
    }
  };

  const getThemeClasses = (theme: string | null) => {
    if (theme && theme.startsWith('#')) {
      return '';
    }
    
    switch (theme) {
      case 'coral':
        return 'text-[#ff9178] dark:text-[#ffbcad]';
      case 'purple':
        return 'text-purple-700 dark:text-purple-300';
      case 'blue':
        return 'text-blue-700 dark:text-blue-300';
      case 'green':
        return 'text-green-700 dark:text-green-300';
      case 'pink':
        return 'text-pink-700 dark:text-pink-300';
      case 'teal':
        return 'text-teal-700 dark:text-teal-300';
      case 'amber':
        return 'text-amber-700 dark:text-amber-300';
      case 'indigo':
        return 'text-indigo-700 dark:text-indigo-300';
      case 'rose':
        return 'text-rose-700 dark:text-rose-300';
      default:
        return 'text-gray-700 dark:text-gray-300';
    }
  };

  const themeIconClasses = getThemeClasses(colorTheme);

  if (isEditing) {
    return (
      <div className="mt-2 mb-6 space-y-4 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">تعديل معلومات المتجر</h3>
          <Button onClick={handleSave} disabled={isSaving} size="sm">
            <Save className="h-4 w-4 ml-2" />
            {isSaving ? "جاري الحفظ..." : "حفظ"}
          </Button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium mb-1 block">الوصف</label>
            <Textarea
              value={editedInfo.description || ""}
              onChange={(e) => setEditedInfo({ ...editedInfo, description: e.target.value })}
              placeholder="وصف المتجر"
              className="text-right"
              dir="rtl"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">العنوان</label>
            <Input
              value={editedInfo.address || ""}
              onChange={(e) => setEditedInfo({ ...editedInfo, address: e.target.value })}
              placeholder="عنوان المتجر"
              className="text-right"
              dir="rtl"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">رقم الهاتف</label>
            <Input
              value={editedInfo.phone || ""}
              onChange={(e) => setEditedInfo({ ...editedInfo, phone: e.target.value })}
              placeholder="رقم الهاتف"
              dir="ltr"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">رمز Wifi</label>
            <Input
              value={editedInfo.wifi || ""}
              onChange={(e) => setEditedInfo({ ...editedInfo, wifi: e.target.value })}
              placeholder="رمز شبكة Wifi"
            />
          </div>
        </div>
      </div>
    );
  }

  if (!contactInfo || Object.values(contactInfo).every(value => !value)) {
    return (
      <div className="mt-2 mb-6 text-center">
        <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
          <Edit2 className="h-4 w-4 ml-2" />
          إضافة معلومات المتجر
        </Button>
      </div>
    );
  }

  const handleGoogleMapsClick = () => {
    if (contactInfo.address) {
      window.open(`https://maps.google.com/maps?q=${encodeURIComponent(contactInfo.address)}`, "_blank");
    }
  };

  const toggleWifiCode = () => {
    setIsWifiCodeVisible(!isWifiCodeVisible);
  };

  const hasCollapsibleDetails = contactInfo.businessHours || contactInfo.address || contactInfo.phone || contactInfo.wifi;

  return (
    <div className="mt-2 mb-6 text-left space-y-3">
      <div className="flex justify-center mb-3">
        <Button
          onClick={() => setIsEditing(true)}
          size="sm"
          variant="outline"
          className="bg-primary/10 hover:bg-primary/20 border-primary/30"
        >
          <Edit2 className="h-4 w-4 ml-2" />
          تعديل المعلومات
        </Button>
      </div>

      {contactInfo.description && (
        <div className="flex items-center justify-start gap-2 text-gray-700 dark:text-gray-300">
          <Info className={`w-4 h-4 ${themeIconClasses}`} />
          <p className="text-sm">{contactInfo.description}</p>
        </div>
      )}

      {hasCollapsibleDetails && (
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
          <Collapsible 
            open={isDetailsOpen} 
            onOpenChange={setIsDetailsOpen}
          >
            <CollapsibleTrigger className="flex items-center justify-between w-full group cursor-pointer">
              <div className="flex items-center gap-2">
                <Info className={`w-4 h-4 ${themeIconClasses}`} />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  اضغط لمعرفة تفاصيل مهمة
                </span>
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {isDetailsOpen ? 'إخفاء' : 'عرض'}
              </span>
            </CollapsibleTrigger>
            
            <CollapsibleContent className="mt-3 space-y-3">
              {contactInfo.address && (
                <div 
                  className="flex items-center justify-start gap-2 text-gray-700 dark:text-gray-300 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md p-2 transition-colors" 
                  onClick={handleGoogleMapsClick}
                >
                  <MapPin className={`w-4 h-4 ${themeIconClasses}`} />
                  <p className="text-sm">انقر هنا لمعرفة موقع المتجر</p>
                </div>
              )}

              {contactInfo.phone && (
                <div className="flex items-center justify-start gap-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md p-2 transition-colors border-t border-gray-200 dark:border-gray-700 pt-3">
                  <Phone className={`w-4 h-4 ${themeIconClasses}`} />
                  <a href={`tel:${contactInfo.phone}`} className="text-sm" dir="ltr">
                    {contactInfo.phone}
                  </a>
                </div>
              )}

              {contactInfo.wifi && (
                <div className="flex flex-col items-start border-t border-gray-200 dark:border-gray-700 pt-3">
                  <div 
                    className="flex items-center justify-start gap-2 text-gray-700 dark:text-gray-300 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md p-2 transition-colors w-full"
                    onClick={toggleWifiCode}
                  >
                    <Wifi className={`w-4 h-4 ${themeIconClasses}`} />
                    <p className="text-sm">رمز شبكة Wifi (اضغط للعرض)</p>
                  </div>
                  
                  {isWifiCodeVisible && (
                    <div className="mt-2 p-3 bg-gray-100 dark:bg-gray-800 rounded-md text-center w-full">
                      <p className="font-mono text-sm">{contactInfo.wifi}</p>
                    </div>
                  )}
                </div>
              )}
            </CollapsibleContent>
          </Collapsible>
        </div>
      )}
    </div>
  );
};

export default InlineContactInfoEditor;
