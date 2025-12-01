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
        await supabase.functions.invoke('send-whatsapp-notification', {
          body: {
            userId: storeOwnerId,
            message: `تم استلام ${formData.feedbackType} جديد من: ${formData.visitorName}`,
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
      }, 2500);

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
            className="text-center py-12"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.2, 1] }}
              transition={{ duration: 0.6, type: "spring", bounce: 0.5 }}
              className="mb-6"
            >
              <div 
                className="inline-flex items-center justify-center w-24 h-24 rounded-full mx-auto"
                style={{ backgroundColor: `${themeColor}20` }}
              >
                <CheckCircle className="w-16 h-16" style={{ color: themeColor }} />
              </div>
            </motion.div>
            
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <h2 className="text-2xl font-bold mb-3" style={{ color: themeColor }}>
                تم الإرسال بنجاح! ✨
              </h2>
              <p className="text-muted-foreground text-base">
                شكراً لك على مشاركة رأيك القيم معنا
              </p>
            </motion.div>

            <motion.div
              className="mt-8"
              animate={{ 
                rotate: [0, 10, -10, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                repeatDelay: 1
              }}
            >
              <Sparkles className="w-12 h-12 mx-auto" style={{ color: themeColor }} />
            </motion.div>
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
