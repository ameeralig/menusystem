import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface FormData {
  visitorName: string;
  visitorPhone: string;
  feedbackType: string;
  description: string;
}

interface UseFeedbackFormProps {
  userId: string;
  onSuccess?: () => void;
}

export const useFeedbackForm = ({ userId, onSuccess }: UseFeedbackFormProps) => {
  const [formData, setFormData] = useState<FormData>({
    visitorName: "",
    visitorPhone: "",
    feedbackType: "",
    description: "",
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const resetForm = () => {
    setFormData({
      visitorName: "",
      visitorPhone: "",
      feedbackType: "",
      description: "",
    });
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

    if (formData.visitorName.length > 100) {
      toast({
        title: "خطأ في البيانات",
        description: "الاسم يجب أن يكون أقل من 100 حرف",
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

    if (formData.description.length > 1000) {
      toast({
        title: "خطأ في البيانات",
        description: "وصف الملاحظات يجب أن يكون أقل من 1000 حرف",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const submitFeedback = async (): Promise<void> => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      console.log("إرسال ملاحظات جديدة:", {
        store_owner_id: userId,
        visitor_name: formData.visitorName.trim(),
        visitor_phone: formData.visitorPhone.trim() || null,
        type: formData.feedbackType,
        description: formData.description.trim(),
      });

      const { error } = await supabase.from("feedback").insert({
        store_owner_id: userId,
        visitor_name: formData.visitorName.trim(),
        visitor_phone: formData.visitorPhone.trim() || null,
        type: formData.feedbackType,
        description: formData.description.trim(),
      });

      if (error) {
        console.error("خطأ في قاعدة البيانات:", error);
        throw error;
      }

      console.log("تم إرسال الملاحظات بنجاح");

      toast({
        title: "تم الإرسال بنجاح! ✅",
        description: "شكراً لك على ملاحظاتك القيمة! سيتم مراجعتها والرد عليها قريباً.",
      });

      resetForm();
      onSuccess?.();

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

  const isFormValid = formData.visitorName.trim() && formData.feedbackType && formData.description.trim();

  return {
    formData,
    updateFormData,
    submitFeedback,
    isSubmitting,
    isFormValid,
    resetForm
  };
};