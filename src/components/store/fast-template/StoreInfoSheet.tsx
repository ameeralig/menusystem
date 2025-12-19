import React, { useState, useEffect } from "react";
import { MapPin, Phone, Wifi, Clock, Copy, ExternalLink, Instagram, Facebook, Send, Edit2, Save, X } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Product } from "@/types/product";
import { supabase } from "@/integrations/supabase/client";
import MenuDownloader from "../menu-download/MenuDownloader";

type WorkDay = {
  day: string;
  isOpen: boolean;
  openTime: string;
  closeTime: string;
};

type ContactInfo = {
  description?: string | null;
  address?: string | null;
  phone?: string | null;
  wifi?: string | null;
  businessHours?: string | null;
};

interface StoreInfoSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  contactInfo?: ContactInfo;
  colorTheme?: string | null;
  socialLinks?: {
    instagram?: string;
    facebook?: string;
    telegram?: string;
  };
  storeName?: string;
  products?: Product[];
  isStoreOwner?: boolean;
  storeOwnerId?: string;
}

const StoreInfoSheet: React.FC<StoreInfoSheetProps> = ({
  isOpen,
  onOpenChange,
  contactInfo,
  colorTheme,
  socialLinks,
  storeName,
  products = [],
  isStoreOwner = false,
  storeOwnerId,
}) => {
  const [isWifiVisible, setIsWifiVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // حالات التعديل
  const [editedInfo, setEditedInfo] = useState<ContactInfo>({
    description: "",
    address: "",
    phone: "",
    wifi: "",
    businessHours: "",
  });
  
  const [editedSocialLinks, setEditedSocialLinks] = useState({
    instagram: "",
    facebook: "",
    telegram: "",
  });

  // تفعيل وضع التعديل تلقائياً عند فتح البطاقة للمالك
  useEffect(() => {
    if (isOpen && isStoreOwner) {
      setIsEditing(true);
      setEditedInfo({
        description: contactInfo?.description || "",
        address: contactInfo?.address || "",
        phone: contactInfo?.phone || "",
        wifi: contactInfo?.wifi || "",
        businessHours: contactInfo?.businessHours || "",
      });
      setEditedSocialLinks({
        instagram: socialLinks?.instagram || "",
        facebook: socialLinks?.facebook || "",
        telegram: socialLinks?.telegram || "",
      });
    } else if (!isOpen) {
      setIsEditing(false);
    }
  }, [isOpen, isStoreOwner, contactInfo, socialLinks]);

  const handleSave = async () => {
    if (!storeOwnerId) return;
    
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("store_settings")
        .update({
          contact_info: editedInfo,
          social_links: editedSocialLinks,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", storeOwnerId);

      if (error) throw error;

      toast.success("تم حفظ التغييرات بنجاح");
      setIsEditing(false);
      onOpenChange(false);
      window.location.reload();
    } catch (error) {
      console.error("خطأ في حفظ التغييرات:", error);
      toast.error("فشل في حفظ التغييرات");
    } finally {
      setIsSaving(false);
    }
  };

  if (!contactInfo || Object.values(contactInfo).every(value => !value)) {
    return null;
  }

  const getThemeColor = () => {
    if (colorTheme?.startsWith('#')) {
      return colorTheme;
    }
    
    const themeColors: { [key: string]: string } = {
      coral: '#ff9178',
      purple: '#a855f7',
      blue: '#3b82f6',
      green: '#22c55e',
      red: '#ef4444',
      pink: '#ec4899',
      teal: '#14b8a6',
      amber: '#f59e0b',
      indigo: '#6366f1',
      rose: '#f43f5e',
    };
    
    return themeColors[colorTheme || ''] || '#3b82f6';
  };

  const themeColor = getThemeColor();

  const convertTo12Hour = (time24: string) => {
    if (!time24) return time24;
    
    const [hours, minutes] = time24.split(':');
    const hour24 = parseInt(hours);
    
    if (hour24 === 0) {
      return `12:${minutes} ص`;
    } else if (hour24 < 12) {
      return `${hour24}:${minutes} ص`;
    } else if (hour24 === 12) {
      return `12:${minutes} م`;
    } else {
      return `${hour24 - 12}:${minutes} م`;
    }
  };

  const formatBusinessHours = () => {
    if (!contactInfo.businessHours) return null;
    
    try {
      const workDays = JSON.parse(contactInfo.businessHours) as WorkDay[];
      if (!Array.isArray(workDays) || workDays.length === 0) return null;
      
      const weekDays = [
        { id: "sunday", label: "الأحد" },
        { id: "monday", label: "الإثنين" },
        { id: "tuesday", label: "الثلاثاء" },
        { id: "wednesday", label: "الأربعاء" },
        { id: "thursday", label: "الخميس" },
        { id: "friday", label: "الجمعة" },
        { id: "saturday", label: "السبت" },
      ];
      
      return (
        <div className="space-y-2">
          {workDays.map((day, index) => {
            const dayLabel = weekDays.find(wd => wd.id === day.day)?.label || day.day;
            
            return (
              <div key={index} className="flex items-center gap-3">
                <div
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{
                    backgroundColor: day.isOpen ? themeColor : '#9ca3af'
                  }}
                />
                <div className="flex-1 flex justify-between items-center text-sm">
                  <span className="font-medium">{dayLabel}</span>
                  {day.isOpen ? (
                    <span className="text-muted-foreground">
                      {convertTo12Hour(day.openTime)} - {convertTo12Hour(day.closeTime)}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">مغلق</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      );
    } catch (error) {
      return null;
    }
  };

  const handleGoogleMapsClick = () => {
    if (contactInfo.address) {
      window.open(`https://maps.google.com/maps?q=${encodeURIComponent(contactInfo.address)}`, "_blank");
    }
  };

  const handlePhoneCall = () => {
    if (contactInfo.phone) {
      window.location.href = `tel:${contactInfo.phone}`;
    }
  };

  const handleCopyWifi = () => {
    if (contactInfo.wifi) {
      navigator.clipboard.writeText(contactInfo.wifi);
      toast.success("تم نسخ كلمة مرور الواي فاي");
    }
  };

  const normalizeUrl = (provider: "instagram" | "facebook" | "telegram", value?: string) => {
    if (!value) return undefined;
    const v = value.trim();
    if (/^https?:\/\//i.test(v)) return v;

    if (provider === "instagram") {
      const handle = v.startsWith("@") ? v.slice(1) : v.replace(/^instagram\.com\//i, "");
      return `https://instagram.com/${handle}`;
    }

    if (provider === "facebook") {
      const path = v.replace(/^facebook\.com\//i, "").replace(/^fb\.com\//i, "");
      return `https://facebook.com/${path}`;
    }

    const handle = v.startsWith("@") ? v.slice(1) : v.replace(/^t\.me\//i, "");
    return `https://t.me/${handle}`;
  };

  const instagramUrl = normalizeUrl("instagram", socialLinks?.instagram);
  const facebookUrl = normalizeUrl("facebook", socialLinks?.facebook);
  const telegramUrl = normalizeUrl("telegram", socialLinks?.telegram);

  const hasSocialLinks = instagramUrl || facebookUrl || telegramUrl;

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[85vh] overflow-y-auto">
        <SheetHeader>
          <div className="flex items-center justify-between">
            <SheetTitle className="text-right text-xl">
              {isEditing ? "تعديل معلومات المتجر" : "معلومات المتجر"}
            </SheetTitle>
            {isStoreOwner && isEditing && (
              <Button 
                onClick={handleSave} 
                disabled={isSaving}
                size="sm"
                className="gap-2"
                style={{ backgroundColor: themeColor }}
              >
                <Save className="h-4 w-4" />
                {isSaving ? "جاري الحفظ..." : "حفظ"}
              </Button>
            )}
          </div>
          <SheetDescription className="text-right">
            {isEditing ? "قم بتعديل معلومات متجرك" : "تفاصيل الاتصال وساعات العمل"}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          {/* الوصف */}
          {isEditing ? (
            <Card className="p-4 border bg-card dark:bg-card" style={{ borderColor: `${themeColor}30` }}>
              <Label className="text-foreground mb-2 block">وصف المتجر</Label>
              <Textarea
                value={editedInfo.description || ""}
                onChange={(e) => setEditedInfo({ ...editedInfo, description: e.target.value })}
                placeholder="أدخل وصف المتجر..."
                className="bg-background text-foreground border-border"
                dir="rtl"
              />
            </Card>
          ) : contactInfo?.description && (
            <Card 
              className="p-4 border bg-card dark:bg-card"
              style={{
                background: `linear-gradient(135deg, ${themeColor}08, ${themeColor}15)`,
                borderColor: `${themeColor}30`,
                borderRightWidth: '4px',
                borderRightColor: themeColor
              }}
            >
              <p className="text-sm leading-relaxed text-right text-foreground">{contactInfo.description}</p>
            </Card>
          )}

          {/* ساعات العمل */}
          {contactInfo.businessHours && (
            <>
              <Separator />
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="h-5 w-5" style={{ color: themeColor }} />
                  <h3 className="font-semibold">ساعات العمل</h3>
                </div>
                <Card 
                  className="p-4 border bg-card dark:bg-card"
                  style={{
                    background: `linear-gradient(135deg, ${themeColor}08, ${themeColor}15)`,
                    borderColor: `${themeColor}30`,
                  }}
                >
                  {formatBusinessHours()}
                </Card>
              </div>
            </>
          )}

          {/* العنوان */}
          {isEditing ? (
            <>
              <Separator />
              <Card className="p-4 border bg-card dark:bg-card" style={{ borderColor: `${themeColor}30` }}>
                <div className="flex items-center gap-2 mb-3">
                  <MapPin className="h-5 w-5" style={{ color: themeColor }} />
                  <Label className="text-foreground font-semibold">العنوان</Label>
                </div>
                <Input
                  value={editedInfo.address || ""}
                  onChange={(e) => setEditedInfo({ ...editedInfo, address: e.target.value })}
                  placeholder="أدخل عنوان المتجر..."
                  className="bg-background text-foreground border-border"
                  dir="rtl"
                />
              </Card>
            </>
          ) : contactInfo?.address && (
            <>
              <Separator />
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <MapPin className="h-5 w-5" style={{ color: themeColor }} />
                  <h3 className="font-semibold">العنوان</h3>
                </div>
                <Card 
                  className="p-4 border bg-card dark:bg-card"
                  style={{
                    background: `linear-gradient(135deg, ${themeColor}08, ${themeColor}15)`,
                    borderColor: `${themeColor}30`,
                  }}
                >
                  <p className="text-sm text-right mb-3 text-foreground">{contactInfo.address}</p>
                  <Button
                    onClick={handleGoogleMapsClick}
                    className="w-full shadow-md hover:shadow-lg transition-shadow"
                    style={{
                      backgroundColor: themeColor,
                      color: 'white'
                    }}
                  >
                    <ExternalLink className="h-4 w-4 ml-2" />
                    فتح في خرائط جوجل
                  </Button>
                </Card>
              </div>
            </>
          )}

          {/* الهاتف */}
          {isEditing ? (
            <>
              <Separator />
              <Card className="p-4 border bg-card dark:bg-card" style={{ borderColor: `${themeColor}30` }}>
                <div className="flex items-center gap-2 mb-3">
                  <Phone className="h-5 w-5" style={{ color: themeColor }} />
                  <Label className="text-foreground font-semibold">رقم الهاتف</Label>
                </div>
                <Input
                  value={editedInfo.phone || ""}
                  onChange={(e) => setEditedInfo({ ...editedInfo, phone: e.target.value })}
                  placeholder="أدخل رقم الهاتف..."
                  className="bg-background text-foreground border-border"
                  dir="ltr"
                />
              </Card>
            </>
          ) : contactInfo?.phone && (
            <>
              <Separator />
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Phone className="h-5 w-5" style={{ color: themeColor }} />
                  <h3 className="font-semibold">الهاتف</h3>
                </div>
                <Card 
                  className="p-4 border bg-card dark:bg-card"
                  style={{
                    background: `linear-gradient(135deg, ${themeColor}08, ${themeColor}15)`,
                    borderColor: `${themeColor}30`,
                  }}
                >
                  <p className="text-sm text-right mb-3 font-mono text-foreground" dir="ltr">{contactInfo.phone}</p>
                  <Button
                    onClick={handlePhoneCall}
                    className="w-full shadow-md hover:shadow-lg transition-shadow"
                    style={{
                      backgroundColor: themeColor,
                      color: 'white'
                    }}
                  >
                    <Phone className="h-4 w-4 ml-2" />
                    اتصال الآن
                  </Button>
                </Card>
              </div>
            </>
          )}

          {/* الواي فاي */}
          {isEditing ? (
            <>
              <Separator />
              <Card className="p-4 border bg-card dark:bg-card" style={{ borderColor: `${themeColor}30` }}>
                <div className="flex items-center gap-2 mb-3">
                  <Wifi className="h-5 w-5" style={{ color: themeColor }} />
                  <Label className="text-foreground font-semibold">كلمة مرور الواي فاي</Label>
                </div>
                <Input
                  value={editedInfo.wifi || ""}
                  onChange={(e) => setEditedInfo({ ...editedInfo, wifi: e.target.value })}
                  placeholder="أدخل كلمة مرور الواي فاي..."
                  className="bg-background text-foreground border-border"
                />
              </Card>
            </>
          ) : contactInfo?.wifi && (
            <>
              <Separator />
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Wifi className="h-5 w-5" style={{ color: themeColor }} />
                  <h3 className="font-semibold">الواي فاي</h3>
                </div>
                <Card 
                  className="p-4 border bg-card dark:bg-card"
                  style={{
                    background: `linear-gradient(135deg, ${themeColor}08, ${themeColor}15)`,
                    borderColor: `${themeColor}30`,
                  }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-mono text-foreground" dir="ltr">
                      {isWifiVisible ? contactInfo.wifi : "••••••••"}
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsWifiVisible(!isWifiVisible)}
                      style={{ color: themeColor }}
                    >
                      {isWifiVisible ? "إخفاء" : "عرض"}
                    </Button>
                  </div>
                  <Button
                    onClick={handleCopyWifi}
                    variant="outline"
                    className="w-full hover:bg-transparent"
                    style={{ borderColor: themeColor, color: themeColor }}
                  >
                    <Copy className="h-4 w-4 ml-2" />
                    نسخ كلمة المرور
                  </Button>
                </Card>
              </div>
            </>
          )}

          {/* حسابات التواصل الاجتماعي */}
          {isEditing ? (
            <>
              <Separator />
              <Card className="p-4 border bg-card dark:bg-card" style={{ borderColor: `${themeColor}30` }}>
                <div className="flex items-center gap-2 mb-3">
                  <Send className="h-5 w-5" style={{ color: themeColor }} />
                  <Label className="text-foreground font-semibold">روابط التواصل الاجتماعي</Label>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Instagram className="h-5 w-5" style={{ color: themeColor }} />
                    <Input
                      value={editedSocialLinks.instagram}
                      onChange={(e) => setEditedSocialLinks({ ...editedSocialLinks, instagram: e.target.value })}
                      placeholder="اسم المستخدم أو الرابط"
                      className="bg-background text-foreground border-border flex-1"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Facebook className="h-5 w-5" style={{ color: themeColor }} />
                    <Input
                      value={editedSocialLinks.facebook}
                      onChange={(e) => setEditedSocialLinks({ ...editedSocialLinks, facebook: e.target.value })}
                      placeholder="اسم المستخدم أو الرابط"
                      className="bg-background text-foreground border-border flex-1"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Send className="h-5 w-5" style={{ color: themeColor }} />
                    <Input
                      value={editedSocialLinks.telegram}
                      onChange={(e) => setEditedSocialLinks({ ...editedSocialLinks, telegram: e.target.value })}
                      placeholder="اسم المستخدم أو الرابط"
                      className="bg-background text-foreground border-border flex-1"
                    />
                  </div>
                </div>
              </Card>
            </>
          ) : hasSocialLinks && (
            <>
              <Separator />
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Send className="h-5 w-5" style={{ color: themeColor }} />
                  <h3 className="font-semibold">تابعنا على</h3>
                </div>
                <Card 
                  className="p-4 border bg-card dark:bg-card"
                  style={{
                    background: `linear-gradient(135deg, ${themeColor}08, ${themeColor}15)`,
                    borderColor: `${themeColor}30`,
                  }}
                >
                  <div className="flex items-center justify-center gap-4">
                    {instagramUrl && (
                      <a
                        href={instagramUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex flex-col items-center gap-2 p-3 rounded-xl transition-all hover:scale-110 bg-background/50 dark:bg-background/30"
                        style={{
                          borderWidth: '1px',
                          borderColor: `${themeColor}20`,
                        }}
                      >
                        <Instagram 
                          className="h-8 w-8"
                          style={{ color: themeColor }}
                        />
                        <span className="text-xs font-medium text-foreground">Instagram</span>
                      </a>
                    )}

                    {facebookUrl && (
                      <a
                        href={facebookUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex flex-col items-center gap-2 p-3 rounded-xl transition-all hover:scale-110 bg-background/50 dark:bg-background/30"
                        style={{
                          borderWidth: '1px',
                          borderColor: `${themeColor}20`,
                        }}
                      >
                        <Facebook 
                          className="h-8 w-8"
                          style={{ color: themeColor }}
                        />
                        <span className="text-xs font-medium text-foreground">Facebook</span>
                      </a>
                    )}

                    {telegramUrl && (
                      <a
                        href={telegramUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex flex-col items-center gap-2 p-3 rounded-xl transition-all hover:scale-110 bg-background/50 dark:bg-background/30"
                        style={{
                          borderWidth: '1px',
                          borderColor: `${themeColor}20`,
                        }}
                      >
                        <Send 
                          className="h-8 w-8"
                          style={{ color: themeColor }}
                        />
                        <span className="text-xs font-medium text-foreground">Telegram</span>
                      </a>
                    )}
                  </div>
                </Card>
              </div>
            </>
          )}

          {/* قسم تحميل المنيو */}
          {storeName && products.length > 0 && (
            <MenuDownloader
              storeName={storeName}
              products={products}
              colorTheme={colorTheme}
            />
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default StoreInfoSheet;
