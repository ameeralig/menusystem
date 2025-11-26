import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, Heart, MessageCircle, Star, Send, CheckCircle, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

interface FeedbackDialogProps {
  isOpen: boolean;
  onClose: () => void;
  storeOwnerId: string;
  colorTheme?: string;
}

const FeedbackDialog = ({ isOpen, onClose, storeOwnerId, colorTheme }: FeedbackDialogProps) => {
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    visitorName: "",
    visitorPhone: "",
    feedbackType: "",
    description: "",
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.visitorName.trim()) {
      toast({
        title: "خطأ في البيانات",
        description: "الرجاء إدخال الاسم",
        variant: "destructive",
      });
      return false;
    }

    if (formData.visitorPhone && (formData.visitorPhone.length < 8 || formData.visitorPhone.length > 20)) {
      toast({
        title: "خطأ في رقم الهاتف",
        description: "رقم الهاتف يجب أن يكون بين 8-20 رقم",
        variant: "destructive",
      });
      return false;
    }

    if (!formData.feedbackType) {
      toast({
        title: "خطأ في البيانات",
        description: "الرجاء اختيار نوع الملاحظات",
        variant: "destructive",
      });
      return false;
    }

    if (!formData.description.trim()) {
      toast({
        title: "خطأ في البيانات",
        description: "الرجاء كتابة وصف الملاحظات",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const { error } = await supabase.from("feedback").insert({
        store_owner_id: storeOwnerId,
        visitor_name: formData.visitorName.trim(),
        visitor_phone: formData.visitorPhone.trim() || null,
        type: formData.feedbackType,
        description: formData.description.trim(),
      });

      if (error) throw error;

      // إرسال إشعار WhatsApp
      try {
        const feedbackTypeText = formData.feedbackType === 'complaint' ? 'شكوى' :
                                 formData.feedbackType === 'suggestion' ? 'اقتراح' :
                                 formData.feedbackType === 'compliment' ? 'إطراء' :
                                 formData.feedbackType === 'question' ? 'استفسار' : 'ملاحظة';

        await supabase.functions.invoke('send-whatsapp-notification', {
          body: {
            userId: storeOwnerId,
            message: `تم استلام ${feedbackTypeText} جديد من: ${formData.visitorName}`,
            type: 'feedback'
          }
        });
      } catch (whatsappError) {
        console.error('خطأ في إرسال إشعار WhatsApp:', whatsappError);
      }
      
      toast({
        title: "تم الإرسال بنجاح! ✅",
        description: "شكراً لك على ملاحظاتك القيمة!",
      });

      setIsSubmitted(true);
      setFormData({
        visitorName: "",
        visitorPhone: "",
        feedbackType: "",
        description: "",
      });

      // إغلاق الـ Dialog بعد 2 ثانية
      setTimeout(() => {
        setIsSubmitted(false);
        onClose();
      }, 2000);

    } catch (error) {
      console.error("خطأ في إرسال الملاحظات:", error);
      
      toast({
        title: "فشل في الإرسال ❌",
        description: "عذراً، لم نتمكن من إرسال ملاحظاتك. الرجاء المحاولة مرة أخرى.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getThemeColor = () => {
    if (colorTheme?.startsWith('#')) return colorTheme;
    
    const themeColors: { [key: string]: string } = {
      coral: '#ff9178',
      purple: '#8B5CF6',
      blue: '#3B82F6',
      green: '#10B981',
      pink: '#EC4899',
      teal: '#14B8A6',
      amber: '#F59E0B',
      indigo: '#6366F1',
      rose: '#F43F5E'
    };
    
    return themeColors[colorTheme || ''] || '#3B82F6';
  };

  const themeColor = getThemeColor();
  const isFormValid = formData.visitorName.trim() && formData.feedbackType && formData.description.trim();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="max-w-[95vw] sm:max-w-md max-h-[90vh] overflow-y-auto"
        style={{
          background: `linear-gradient(135deg, ${themeColor}08, ${themeColor}15)`,
          borderColor: `${themeColor}40`,
        }}
      >
        {isSubmitted ? (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center py-8"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, type: "spring", bounce: 0.6 }}
            >
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            </motion.div>
            <h2 className="text-xl font-bold mb-2">تم إرسال ملاحظاتك بنجاح!</h2>
            <p className="text-muted-foreground text-sm">
              شكراً لك على مشاركة رأيك معنا
            </p>
          </motion.div>
        ) : (
          <>
            <DialogHeader>
              <div className="flex items-center justify-between">
                <DialogTitle className="text-xl" style={{ color: themeColor }}>شاركنا رأيك</DialogTitle>
              </div>
              <DialogDescription>
                نحن نقدر ملاحظاتك ونسعى لتحسين خدماتنا باستمرار
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* اسم الزائر */}
              <div className="space-y-2">
                <Label htmlFor="visitorName">الاسم *</Label>
                <Input
                  id="visitorName"
                  type="text"
                  value={formData.visitorName}
                  onChange={(e) => handleInputChange("visitorName", e.target.value)}
                  placeholder="الرجاء إدخال اسمك"
                  maxLength={100}
                  className="text-right"
                />
              </div>

              {/* رقم الهاتف */}
              <div className="space-y-2">
                <Label htmlFor="visitorPhone">رقم الهاتف (اختياري)</Label>
                <Input
                  id="visitorPhone"
                  type="tel"
                  value={formData.visitorPhone}
                  onChange={(e) => handleInputChange("visitorPhone", e.target.value)}
                  placeholder="رقم الهاتف للتواصل معك"
                  maxLength={20}
                  className="text-right"
                />
              </div>

              {/* نوع الملاحظة */}
              <div className="space-y-2">
                <Label htmlFor="feedbackType">نوع الملاحظة *</Label>
                <Select
                  value={formData.feedbackType}
                  onValueChange={(value) => handleInputChange("feedbackType", value)}
                >
                  <SelectTrigger className="text-right">
                    <SelectValue placeholder="اختر نوع الملاحظة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="complaint">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-red-500" />
                        شكوى
                      </div>
                    </SelectItem>
                    <SelectItem value="suggestion">
                      <div className="flex items-center gap-2">
                        <MessageCircle className="w-4 h-4 text-blue-500" />
                        اقتراح
                      </div>
                    </SelectItem>
                    <SelectItem value="compliment">
                      <div className="flex items-center gap-2">
                        <Heart className="w-4 h-4 text-pink-500" />
                        إعجاب
                      </div>
                    </SelectItem>
                    <SelectItem value="question">
                      <div className="flex items-center gap-2">
                        <MessageCircle className="w-4 h-4 text-yellow-600" />
                        استفسار
                      </div>
                    </SelectItem>
                    <SelectItem value="other">
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-purple-500" />
                        أخرى
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* وصف الملاحظة */}
              <div className="space-y-2">
                <Label htmlFor="description">تفاصيل الملاحظة *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="الرجاء كتابة ملاحظاتك بالتفصيل..."
                  maxLength={1000}
                  rows={4}
                  className="text-right resize-none"
                />
                <div className="text-sm text-muted-foreground text-left">
                  {formData.description.length}/1000
                </div>
              </div>

              {/* زر الإرسال */}
              <Button
                onClick={handleSubmit}
                disabled={!isFormValid || isSubmitting}
                className="w-full"
                style={{ 
                  background: themeColor,
                  opacity: (!isFormValid || isSubmitting) ? 0.5 : 1
                }}
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin">⏳</span>
                    جاري الإرسال...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Send className="w-4 h-4" />
                    إرسال الملاحظات
                  </span>
                )}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default FeedbackDialog;
