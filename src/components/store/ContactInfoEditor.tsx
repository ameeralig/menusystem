
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { 
  MapPin, 
  Phone, 
  Wifi, 
  Info, 
  Save, 
  Clock, 
  Plus, 
  Minus, 
  X 
} from "lucide-react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

type WorkDay = {
  day: string;
  isOpen: boolean;
  openTime: string;
  closeTime: string;
};

type ContactInfo = {
  description: string;
  address: string;
  phone: string;
  wifi: string;
  businessHours: string;
};

interface ContactInfoEditorProps {
  initialContactInfo: ContactInfo;
  onSave: (contactInfo: ContactInfo) => Promise<void>;
  isLoading: boolean;
}

const weekDays = [
  { id: "sunday", label: "الأحد" },
  { id: "monday", label: "الإثنين" },
  { id: "tuesday", label: "الثلاثاء" },
  { id: "wednesday", label: "الأربعاء" },
  { id: "thursday", label: "الخميس" },
  { id: "friday", label: "الجمعة" },
  { id: "saturday", label: "السبت" },
];

const ContactInfoEditor = ({ 
  initialContactInfo, 
  onSave, 
  isLoading 
}: ContactInfoEditorProps) => {
  const [contactInfo, setContactInfo] = useState<ContactInfo>({
    description: initialContactInfo.description || "",
    address: initialContactInfo.address || "",
    phone: initialContactInfo.phone || "",
    wifi: initialContactInfo.wifi || "",
    businessHours: initialContactInfo.businessHours || "",
  });

  const [workDays, setWorkDays] = useState<WorkDay[]>(() => {
    // إذا كان هناك ساعات عمل محفوظة سابقاً، حاول تحليلها
    if (initialContactInfo.businessHours) {
      try {
        const savedWorkDays = JSON.parse(initialContactInfo.businessHours);
        if (Array.isArray(savedWorkDays)) {
          return savedWorkDays;
        }
      } catch (e) {
        // إذا فشل التحليل، سنستخدم القيمة الافتراضية
      }
    }
    
    // القيمة الافتراضية: جميع أيام الأسبوع مغلقة
    return weekDays.map(day => ({
      day: day.id,
      isOpen: false,
      openTime: "09:00",
      closeTime: "18:00",
    }));
  });

  const handleChange = (field: keyof ContactInfo, value: string) => {
    setContactInfo(prev => ({ ...prev, [field]: value }));
  };

  const handleWorkDayChange = (index: number, field: keyof WorkDay, value: any) => {
    const updatedWorkDays = [...workDays];
    updatedWorkDays[index] = { ...updatedWorkDays[index], [field]: value };
    setWorkDays(updatedWorkDays);
    
    // تحويل أيام العمل إلى نص JSON وتخزينه في contactInfo
    const businessHoursJson = JSON.stringify(updatedWorkDays);
    handleChange("businessHours", businessHoursJson);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(contactInfo);
  };

  const formatBusinessHoursForDisplay = () => {
    const openDays = workDays.filter(day => day.isOpen);
    if (openDays.length === 0) {
      return "المتجر مغلق";
    }
    
    const daysInfo = openDays.map(day => {
      const dayLabel = weekDays.find(d => d.id === day.day)?.label || day.day;
      return `${dayLabel}: ${day.openTime} - ${day.closeTime}`;
    });
    
    return daysInfo.join(' | ');
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-end gap-2">
            <label htmlFor="description" className="text-sm font-medium">
              وصف المتجر
            </label>
            <Info className="w-4 h-4" />
          </div>
          <Textarea
            id="description"
            placeholder="أضف وصفاً موجزاً للمتجر"
            value={contactInfo.description}
            onChange={(e) => handleChange("description", e.target.value)}
            className="resize-none h-24 text-right"
          />
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-end gap-2">
            <label className="text-sm font-medium">
              ساعات العمل
            </label>
            <Clock className="w-4 h-4" />
          </div>
          
          <div className="space-y-3 border rounded-md p-3">
            <p className="text-sm text-right text-gray-600 dark:text-gray-400">
              ساعات العمل المعروضة: {formatBusinessHoursForDisplay()}
            </p>
            
            {workDays.map((workDay, index) => (
              <div key={workDay.day} className="flex items-center gap-2 border-b pb-2 last:border-0 last:pb-0 pt-2">
                <div className="flex-1 flex flex-col sm:flex-row gap-2 rtl">
                  <div className="flex-1 flex items-center justify-between">
                    <Select
                      value={workDay.isOpen ? "open" : "closed"}
                      onValueChange={(value) => handleWorkDayChange(index, "isOpen", value === "open")}
                    >
                      <SelectTrigger className="w-[100px] h-8">
                        <SelectValue placeholder="الحالة" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="open">مفتوح</SelectItem>
                        <SelectItem value="closed">مغلق</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <span className="text-sm font-medium text-right min-w-[80px]">
                      {weekDays.find(d => d.id === workDay.day)?.label}
                    </span>
                  </div>
                  
                  {workDay.isOpen && (
                    <div className="flex items-center gap-2 justify-end flex-wrap">
                      <div className="flex items-center gap-1">
                        <Input
                          type="time"
                          value={workDay.closeTime}
                          onChange={(e) => handleWorkDayChange(index, "closeTime", e.target.value)}
                          className="w-24 h-8 text-xs"
                        />
                        <span className="text-xs">إلى</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Input
                          type="time"
                          value={workDay.openTime}
                          onChange={(e) => handleWorkDayChange(index, "openTime", e.target.value)}
                          className="w-24 h-8 text-xs"
                        />
                        <span className="text-xs">من</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-end gap-2">
            <label htmlFor="address" className="text-sm font-medium">
              عنوان المتجر
            </label>
            <MapPin className="w-4 h-4" />
          </div>
          <Input
            id="address"
            placeholder="أضف عنوان المتجر (سيظهر كرابط لخرائط Google)"
            value={contactInfo.address}
            onChange={(e) => handleChange("address", e.target.value)}
            className="text-right"
          />
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-end gap-2">
            <label htmlFor="phone" className="text-sm font-medium">
              رقم الهاتف
            </label>
            <Phone className="w-4 h-4" />
          </div>
          <Input
            id="phone"
            type="tel"
            placeholder="أضف رقم هاتف المتجر"
            value={contactInfo.phone}
            onChange={(e) => handleChange("phone", e.target.value)}
            className="text-right"
          />
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-end gap-2">
            <label htmlFor="wifi" className="text-sm font-medium">
              رمز شبكة Wifi
            </label>
            <Wifi className="w-4 h-4" />
          </div>
          <Input
            id="wifi"
            placeholder="أضف رمز شبكة Wifi الخاصة بالمتجر"
            value={contactInfo.wifi}
            onChange={(e) => handleChange("wifi", e.target.value)}
            className="text-right"
          />
        </div>
        
        <Button 
          type="submit" 
          className="w-full mt-4"
          disabled={isLoading}
        >
          {isLoading ? "جاري الحفظ..." : "حفظ معلومات المتجر"}
          <Save className="mr-2 h-4 w-4" />
        </Button>
      </div>
    </form>
  );
};

export default ContactInfoEditor;
