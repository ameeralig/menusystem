import { useParams, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
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
      {/* خلفية بسيطة */}
      <div className="fixed inset-0 bg-gradient-to-br from-background to-muted -z-10"></div>
      
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md mx-auto">
          {/* البطاقة الرئيسية */}
          <div className="bg-background/95 backdrop-blur-xl border border-border rounded-2xl shadow-2xl overflow-hidden">
            {/* الرأس */}
            <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 border-b border-border">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-foreground">
                  شاركنا رأيك
                </h1>
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
              <p className="text-muted-foreground mt-2 text-sm">
                نحن نقدر ملاحظاتك ونسعى لتحسين خدماتنا باستمرار
              </p>
            </div>

            {/* محتوى النموذج */}
            <div className="p-6 space-y-6">
              <FeedbackFormFields
                formData={formData}
                onFormDataChange={updateFormData}
              />

              {/* زر الإرسال */}
              <div className="pt-4">
                <FeedbackSubmitButton
                  onSubmit={handleSubmit}
                  isSubmitting={isSubmitting}
                  isDisabled={!isFormValid || isSubmitting}
                />
              </div>
            </div>
          </div>

          {/* نص الشكر */}
          <div className="text-center mt-6">
            <p className="text-sm text-muted-foreground">
              رأيك مهم لنا ويساعدنا على تقديم خدمة أفضل
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerFeedback;