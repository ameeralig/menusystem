import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { CheckCircle, ChevronRight, ChevronLeft, Send, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import FeedbackWizardSteps from "./FeedbackWizardSteps";

interface FeedbackDialogProps {
  isOpen: boolean;
  onClose: () => void;
  storeOwnerId: string;
  colorTheme?: string;
}

const FeedbackDialog = ({ isOpen, onClose, storeOwnerId, colorTheme }: FeedbackDialogProps) => {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    visitorName: "",
    visitorPhone: "",
    feedbackType: "",
    description: "",
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const totalSteps = 4;

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

  const canGoNext = () => {
    if (currentStep === 1) return formData.visitorName.trim().length > 0;
    if (currentStep === 2) return true; // رقم الهاتف اختياري
    if (currentStep === 3) return formData.feedbackType.length > 0;
    if (currentStep === 4) return formData.description.trim().length > 0;
    return false;
  };

  const handleNext = () => {
    if (canGoNext() && currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      console.log('إرسال البيانات:', {
        store_owner_id: storeOwnerId,
        ...formData
      });
      
      // ترجمة نوع التقييم للعرض
      const feedbackTypeText = formData.feedbackType === 'complaint' ? 'شكوى' :
                              formData.feedbackType === 'suggestion' ? 'اقتراح' :
                              formData.feedbackType === 'compliment' ? 'إطراء' :
                              formData.feedbackType === 'question' ? 'استفسار' : 'ملاحظة';
      
      const { error } = await supabase.from("feedback").insert({
        store_owner_id: storeOwnerId,
        visitor_name: formData.visitorName.trim(),
        visitor_phone: formData.visitorPhone.trim() || null,
        type: formData.feedbackType,
        description: formData.description.trim(),
      });

      if (error) {
        console.error('خطأ في الإدراج:', error);
        throw error;
      }

      console.log('تم إدراج التقييم بنجاح');

      // إرسال إشعار WhatsApp (اختياري - لا يوقف العملية)
      try {
        console.log('إرسال إشعار WhatsApp...');
        const { data: whatsappData, error: whatsappError } = await supabase.functions.invoke('send-whatsapp-notification', {
          body: {
            userId: storeOwnerId,
            message: `تم استلام ${feedbackTypeText} جديد من: ${formData.visitorName}`,
            type: 'feedback'
          }
        });
        
        if (whatsappError) {
          console.log('فشل إرسال WhatsApp (لا يؤثر على التقييم):', whatsappError);
        } else {
          console.log('نتيجة WhatsApp:', whatsappData);
        }
      } catch (whatsappError) {
        console.log('خطأ في إرسال إشعار WhatsApp (لا يؤثر على التقييم):', whatsappError);
      }
      
      toast({
        title: "تم الإرسال بنجاح! ✅",
        description: "شكراً لك على ملاحظاتك القيمة! سيتم مراجعتها والرد عليها قريباً.",
      });

      setIsSubmitted(true);
      
      // إعادة تعيين النموذج والخطوات
      setTimeout(() => {
        setIsSubmitted(false);
        setCurrentStep(1);
        setFormData({
          visitorName: "",
          visitorPhone: "",
          feedbackType: "",
          description: "",
        });
        onClose();
      }, 3000);

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

  const handleClose = () => {
    setCurrentStep(1);
    setFormData({
      visitorName: "",
      visitorPhone: "",
      feedbackType: "",
      description: "",
    });
    onClose();
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

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent 
        className="max-w-[95vw] sm:max-w-lg backdrop-blur-2xl border-2 shadow-2xl overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${themeColor}05, ${themeColor}12)`,
          borderColor: `${themeColor}50`,
          backdropFilter: 'blur(20px)',
        }}
      >
        {isSubmitted ? (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center py-8 px-4"
          >
            {/* أيقونة النجاح المتحركة */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ 
                duration: 0.8, 
                type: "spring", 
                bounce: 0.5,
                delay: 0.1 
              }}
              className="mb-6 relative"
            >
              <motion.div 
                className="inline-flex items-center justify-center w-28 h-28 rounded-full mx-auto relative"
                style={{ 
                  background: `linear-gradient(135deg, ${themeColor}30, ${themeColor}10)`,
                  boxShadow: `0 0 40px ${themeColor}40`
                }}
                animate={{
                  boxShadow: [
                    `0 0 40px ${themeColor}40`,
                    `0 0 60px ${themeColor}60`,
                    `0 0 40px ${themeColor}40`
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <CheckCircle className="w-16 h-16" style={{ color: themeColor }} />
              </motion.div>
              
              {/* نجوم متناثرة حول الأيقونة */}
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute"
                  style={{
                    top: '50%',
                    left: '50%',
                  }}
                  initial={{ scale: 0, x: 0, y: 0 }}
                  animate={{ 
                    scale: [0, 1, 0],
                    x: Math.cos((i * 60) * Math.PI / 180) * 60,
                    y: Math.sin((i * 60) * Math.PI / 180) * 60,
                  }}
                  transition={{ 
                    duration: 1.5,
                    delay: 0.3 + (i * 0.1),
                    repeat: Infinity,
                    repeatDelay: 2
                  }}
                >
                  <Sparkles className="w-4 h-4" style={{ color: themeColor }} />
                </motion.div>
              ))}
            </motion.div>
            
            {/* النص الرئيسي */}
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="space-y-3"
            >
              <h2 className="text-2xl font-bold" style={{ color: themeColor }}>
                شكراً لك! 🎉
              </h2>
              <p className="text-muted-foreground text-lg font-medium">
                تم استلام رأيك بنجاح
              </p>
              <p className="text-muted-foreground/80 text-sm">
                نقدّر وقتك ومشاركتك الثمينة معنا
              </p>
              <p className="text-muted-foreground/70 text-xs mt-2">
                سيتم مراجعة ملاحظاتك والرد عليها في أقرب وقت
              </p>
            </motion.div>

            {/* شريط تقدم للإغلاق التلقائي */}
            <motion.div 
              className="mt-8 mx-auto w-48 h-1 rounded-full overflow-hidden"
              style={{ backgroundColor: `${themeColor}20` }}
            >
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: themeColor }}
                initial={{ width: "100%" }}
                animate={{ width: "0%" }}
                transition={{ duration: 2.5, ease: "linear" }}
              />
            </motion.div>
            <p className="text-xs text-muted-foreground/60 mt-2">
              سيتم الإغلاق تلقائياً...
            </p>
          </motion.div>
        ) : (
          <>
            <DialogHeader className="space-y-3">
              <div className="flex items-center justify-between">
                <DialogTitle className="text-2xl font-bold" style={{ color: themeColor }}>
                  شاركنا رأيك
                </DialogTitle>
                <motion.div
                  className="text-sm font-medium px-4 py-2 rounded-full backdrop-blur-sm"
                  style={{
                    backgroundColor: `${themeColor}15`,
                    color: themeColor,
                  }}
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {currentStep} / {totalSteps}
                </motion.div>
              </div>

              {/* مؤشر التقدم */}
              <div className="relative w-full h-2 rounded-full overflow-hidden bg-muted">
                <motion.div
                  className="absolute top-0 right-0 h-full rounded-full"
                  style={{ backgroundColor: themeColor }}
                  initial={{ width: "0%" }}
                  animate={{ width: `${(currentStep / totalSteps) * 100}%` }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                />
              </div>
            </DialogHeader>

            <div className="py-6">
              <AnimatePresence mode="wait">
                <FeedbackWizardSteps
                  currentStep={currentStep}
                  formData={formData}
                  onFormDataChange={handleInputChange}
                  colorTheme={colorTheme}
                />
              </AnimatePresence>
            </div>

            {/* أزرار التنقل */}
            <div className="flex gap-3">
              {currentStep > 1 && (
                <Button
                  onClick={handleBack}
                  variant="outline"
                  className="flex-1"
                  disabled={isSubmitting}
                >
                  <ChevronRight className="w-5 h-5 ml-2" />
                  السابق
                </Button>
              )}

              {currentStep < totalSteps ? (
                <Button
                  onClick={handleNext}
                  disabled={!canGoNext()}
                  className="flex-1"
                  style={{
                    backgroundColor: canGoNext() ? themeColor : undefined,
                    opacity: canGoNext() ? 1 : 0.5,
                  }}
                >
                  التالي
                  <ChevronLeft className="w-5 h-5 mr-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={!canGoNext() || isSubmitting}
                  className="flex-1"
                  style={{
                    backgroundColor: canGoNext() ? themeColor : undefined,
                    opacity: (canGoNext() && !isSubmitting) ? 1 : 0.5,
                  }}
                >
                  {isSubmitting ? (
                    <>
                      <motion.span
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="inline-block ml-2"
                      >
                        ⏳
                      </motion.span>
                      جاري الإرسال...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5 ml-2" />
                      إرسال الملاحظات
                    </>
                  )}
                </Button>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default FeedbackDialog;
