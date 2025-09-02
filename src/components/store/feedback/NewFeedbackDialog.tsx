import { useState } from "react";
import { motion } from "framer-motion";
import FeedbackTrigger from "./FeedbackTrigger";
import FeedbackModal from "./FeedbackModal";
import FeedbackFormFields from "./FeedbackFormFields";
import FeedbackSubmitButton from "./FeedbackSubmitButton";
import { useFeedbackForm } from "@/hooks/feedback/useFeedbackForm";

interface NewFeedbackDialogProps {
  userId: string;
  colorTheme?: string;
}

const NewFeedbackDialog = ({ userId, colorTheme = "default" }: NewFeedbackDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const {
    formData,
    updateFormData,
    submitFeedback,
    isSubmitting,
    isFormValid
  } = useFeedbackForm({
    userId,
    onSuccess: () => {
      setIsOpen(false);
    }
  });

  const handleSubmit = async () => {
    await submitFeedback();
  };

  return (
    <>
      {/* زر فتح النموذج */}
      <div className="mt-8">
        <FeedbackTrigger 
          colorTheme={colorTheme}
          onClick={() => setIsOpen(true)}
        />
      </div>

      {/* النموذج المنبثق */}
      <FeedbackModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        colorTheme={colorTheme}
      >
          <motion.div
            className="space-y-4"
          >
            {/* رسالة ترحيب */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-center space-y-2"
            >
              <h3 className="text-lg font-semibold text-foreground">
                نحن نقدر آراءكم وملاحظاتكم
              </h3>
              <p className="text-sm text-muted-foreground">
                شاركونا تجربتكم وساعدونا على التطوير والتحسين
              </p>
            </motion.div>

            {/* حقول النموذج */}
            <FeedbackFormFields
              formData={formData}
              onFormDataChange={updateFormData}
              colorTheme={colorTheme}
            />

            {/* زر الإرسال */}
            <div className="pt-4 sticky bottom-0 bg-background/95 backdrop-blur-sm">
              <FeedbackSubmitButton
                isSubmitting={isSubmitting}
                isDisabled={!isFormValid || isSubmitting}
                onSubmit={handleSubmit}
                colorTheme={colorTheme}
              />
            </div>
          </motion.div>
      </FeedbackModal>
    </>
  );
};

export default NewFeedbackDialog;