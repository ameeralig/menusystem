import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { CheckCircle, ChevronRight, ChevronLeft, Send, Sparkles, X, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import FeedbackWizardSteps from "./FeedbackWizardSteps";
import { logVisitorActivity } from "@/hooks/analytics/useActivityLogger";

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
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = (): boolean => {
    if (!formData.visitorName.trim()) {
      toast({ title: "خطأ في البيانات", description: "الرجاء إدخال الاسم", variant: "destructive" });
      return false;
    }
    if (formData.visitorPhone && (formData.visitorPhone.length < 8 || formData.visitorPhone.length > 20)) {
      toast({ title: "خطأ في رقم الهاتف", description: "رقم الهاتف يجب أن يكون بين 8-20 رقم", variant: "destructive" });
      return false;
    }
    if (!formData.feedbackType) {
      toast({ title: "خطأ في البيانات", description: "الرجاء اختيار نوع الملاحظات", variant: "destructive" });
      return false;
    }
    if (!formData.description.trim()) {
      toast({ title: "خطأ في البيانات", description: "الرجاء كتابة وصف الملاحظات", variant: "destructive" });
      return false;
    }
    return true;
  };

  const canGoNext = () => {
    if (currentStep === 1) return formData.visitorName.trim().length > 0;
    if (currentStep === 2) return true;
    if (currentStep === 3) return formData.feedbackType.length > 0;
    if (currentStep === 4) return formData.description.trim().length > 0;
    return false;
  };

  const handleNext = () => {
    if (canGoNext() && currentStep < totalSteps) setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setIsSubmitting(true);

    try {
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

      if (error) throw error;

      try {
        await supabase.functions.invoke('send-whatsapp-notification', {
          body: {
            userId: storeOwnerId,
            message: `تم استلام ${feedbackTypeText} جديد من: ${formData.visitorName}`,
            type: 'feedback'
          }
        });
      } catch {}
      
      toast({ title: "تم الإرسال بنجاح! ✅", description: "شكراً لك على ملاحظاتك القيمة!" });
      setIsSubmitted(true);
      
      setTimeout(() => {
        setIsSubmitted(false);
        setCurrentStep(1);
        setFormData({ visitorName: "", visitorPhone: "", feedbackType: "", description: "" });
        onClose();
      }, 3000);

    } catch (error) {
      toast({ title: "فشل في الإرسال ❌", description: "الرجاء المحاولة مرة أخرى.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setCurrentStep(1);
    setFormData({ visitorName: "", visitorPhone: "", feedbackType: "", description: "" });
    onClose();
  };

  const getThemeColor = () => {
    if (colorTheme?.startsWith('#')) return colorTheme;
    const themeColors: { [key: string]: string } = {
      coral: '#ff9178', purple: '#8B5CF6', blue: '#3B82F6', green: '#10B981',
      pink: '#EC4899', teal: '#14B8A6', amber: '#F59E0B', indigo: '#6366F1', rose: '#F43F5E'
    };
    return themeColors[colorTheme || ''] || '#3B82F6';
  };

  const themeColor = getThemeColor();

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* الخلفية الضبابية */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 z-50 backdrop-blur-md bg-black/40"
          />

          {/* النافذة العائمة */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="pointer-events-auto w-full max-w-md">
              {/* زر الإغلاق */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleClose}
                className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/20 backdrop-blur-lg border border-white/30 flex items-center justify-center text-white shadow-lg"
              >
                <X className="w-5 h-5" />
              </motion.button>

              {/* البطاقة الزجاجية */}
              <div 
                className="rounded-3xl overflow-hidden shadow-2xl border border-white/20"
                style={{
                  background: `linear-gradient(135deg, ${themeColor}ee, ${themeColor}cc)`,
                  backdropFilter: 'blur(20px)',
                }}
              >
                {/* تأثير الإضاءة */}
                <div 
                  className="absolute top-0 left-0 right-0 h-32 opacity-30 pointer-events-none"
                  style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.4) 0%, transparent 100%)' }}
                />

                <div className="relative p-6 text-white">
                  {isSubmitted ? (
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="text-center py-8"
                    >
                      <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ duration: 0.8, type: "spring", bounce: 0.5 }}
                        className="mb-6"
                      >
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/20 backdrop-blur-lg mx-auto">
                          <CheckCircle className="w-12 h-12 text-white" />
                        </div>
                      </motion.div>
                      
                      <h2 className="text-2xl font-bold mb-2">شكراً لك! 🎉</h2>
                      <p className="text-white/80">تم استلام رأيك بنجاح</p>
                      
                      <motion.div 
                        className="mt-6 mx-auto w-32 h-1 rounded-full bg-white/30 overflow-hidden"
                      >
                        <motion.div
                          className="h-full bg-white"
                          initial={{ width: "100%" }}
                          animate={{ width: "0%" }}
                          transition={{ duration: 2.5, ease: "linear" }}
                        />
                      </motion.div>
                    </motion.div>
                  ) : (
                    <>
                      {/* العنوان */}
                      <motion.div 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.1, type: "spring" }}
                        className="text-center mb-4"
                      >
                        <div className="mx-auto mb-3 w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-lg border border-white/30 flex items-center justify-center">
                          <MessageSquare className="w-8 h-8 text-white" />
                        </div>
                        <h2 className="text-xl font-bold drop-shadow-lg">شاركنا رأيك</h2>
                        <div className="flex items-center justify-center gap-2 mt-2">
                          <span className="text-white/80 text-sm">{currentStep} / {totalSteps}</span>
                        </div>
                      </motion.div>

                      {/* مؤشر التقدم */}
                      <div className="relative w-full h-2 rounded-full overflow-hidden bg-white/20 mb-4">
                        <motion.div
                          className="absolute top-0 right-0 h-full bg-white rounded-full"
                          animate={{ width: `${(currentStep / totalSteps) * 100}%` }}
                          transition={{ duration: 0.5 }}
                        />
                      </div>

                      {/* المحتوى */}
                      <div className="bg-white/95 dark:bg-gray-800/95 rounded-2xl p-4">
                        <AnimatePresence mode="wait">
                          <FeedbackWizardSteps
                            currentStep={currentStep}
                            formData={formData}
                            onFormDataChange={handleInputChange}
                            colorTheme={colorTheme}
                          />
                        </AnimatePresence>

                        {/* أزرار التنقل */}
                        <div className="flex gap-3 mt-4">
                          {currentStep > 1 && (
                            <Button onClick={handleBack} variant="outline" className="flex-1" disabled={isSubmitting}>
                              <ChevronRight className="w-4 h-4 ml-1" />
                              السابق
                            </Button>
                          )}

                          {currentStep < totalSteps ? (
                            <Button
                              onClick={handleNext}
                              disabled={!canGoNext()}
                              className="flex-1"
                              style={{ backgroundColor: canGoNext() ? themeColor : undefined }}
                            >
                              التالي
                              <ChevronLeft className="w-4 h-4 mr-1" />
                            </Button>
                          ) : (
                            <Button
                              onClick={handleSubmit}
                              disabled={!canGoNext() || isSubmitting}
                              className="flex-1"
                              style={{ backgroundColor: canGoNext() ? themeColor : undefined }}
                            >
                              {isSubmitting ? (
                                <>جاري الإرسال...</>
                              ) : (
                                <>
                                  <Send className="w-4 h-4 ml-1" />
                                  إرسال
                                </>
                              )}
                            </Button>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default FeedbackDialog;
