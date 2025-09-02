import { useParams, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { AnimatedBackground } from "@/components/auth/AnimatedBackground";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import FeedbackFormFields from "@/components/store/feedback/FeedbackFormFields";
import FeedbackSubmitButton from "@/components/store/feedback/FeedbackSubmitButton";
import { useFeedbackForm } from "@/hooks/feedback/useFeedbackForm";
import { useToast } from "@/hooks/use-toast";

const CustomerFeedback = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const {
    formData,
    updateFormData,
    resetForm,
    isSubmitting,
    submitFeedback,
    isFormValid
  } = useFeedbackForm({
    userId: userId || "",
    onSuccess: () => {
      toast({
        title: "تم إرسال ملاحظتك بنجاح",
        description: "شكراً لك على مشاركة رأيك معنا",
      });
      resetForm();
      // العودة إلى الصفحة السابقة بعد 2 ثانية
      setTimeout(() => {
        navigate(-1);
      }, 2000);
    }
  });

  useEffect(() => {
    if (!userId) {
      navigate("/404");
      return;
    }
  }, [userId, navigate]);

  const handleSubmit = async () => {
    await submitFeedback();
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen w-full overflow-hidden relative">
      {/* خلفية متحركة */}
      <AnimatedBackground />
      
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md mx-auto"
        >
          {/* البطاقة الرئيسية */}
          <motion.div
            className="bg-background/95 backdrop-blur-xl border border-border rounded-2xl shadow-2xl overflow-hidden"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            {/* الرأس */}
            <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 border-b border-border">
              <div className="flex items-center justify-between">
                <motion.h1 
                  className="text-2xl font-bold text-foreground"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  شاركنا رأيك
                </motion.h1>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleGoBack}
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
                >
                  <ArrowRight className="w-4 h-4" />
                  <span>العودة</span>
                </Button>
              </div>
              <motion.p 
                className="text-muted-foreground mt-2 text-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                نحن نقدر ملاحظاتك ونسعى لتحسين خدماتنا باستمرار
              </motion.p>
            </div>

            {/* محتوى النموذج */}
            <motion.div 
              className="p-6 space-y-6"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <FeedbackFormFields
                formData={formData}
                onFormDataChange={updateFormData}
              />

              {/* زر الإرسال */}
              <motion.div 
                className="pt-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                <FeedbackSubmitButton
                  onSubmit={handleSubmit}
                  isSubmitting={isSubmitting}
                  isDisabled={!isFormValid || isSubmitting}
                />
              </motion.div>
            </motion.div>
          </motion.div>

          {/* نص الشكر */}
          <motion.div 
            className="text-center mt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            <p className="text-sm text-muted-foreground">
              رأيك مهم لنا ويساعدنا على تقديم خدمة أفضل
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default CustomerFeedback;