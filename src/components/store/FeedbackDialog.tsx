
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import FeedbackButton from "./feedback/FeedbackButton";
import FeedbackDialogContent from "./feedback/FeedbackDialogContent";
import FeedbackDialogHeader from "./feedback/FeedbackDialogHeader";
import FeedbackForm from "./feedback/FeedbackForm";

interface FeedbackDialogProps {
  userId: string;
  colorTheme?: string;
}

const FeedbackDialog = ({ userId, colorTheme = "default" }: FeedbackDialogProps) => {
  const [visitorName, setVisitorName] = useState("");
  const [visitorPhone, setVisitorPhone] = useState("");
  const [feedbackType, setFeedbackType] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    console.log("محاولة إرسال الملاحظات:", {
      visitorName,
      feedbackType,
      description,
      userId
    });

    if (!visitorName || !feedbackType || !description) {
      toast({
        title: "خطأ",
        description: "الرجاء تعبئة جميع الحقول الإلزامية",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      console.log("إرسال البيانات إلى قاعدة البيانات...");
      const { error } = await supabase.from("feedback").insert({
        store_owner_id: userId,
        visitor_name: visitorName,
        visitor_phone: visitorPhone || null,
        type: feedbackType,
        description: description,
      });

      if (error) {
        console.error("خطأ في قاعدة البيانات:", error);
        throw error;
      }

      console.log("تم إرسال الملاحظات بنجاح");
      toast({
        title: "تم الإرسال بنجاح ✅",
        description: "شكراً لك على ملاحظاتك القيمة! سيتم مراجعتها قريباً.",
      });
      
      // إعادة تعيين النموذج
      setVisitorName("");
      setVisitorPhone("");
      setFeedbackType("");
      setDescription("");
      setIsOpen(false);
    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast({
        title: "فشل في الإرسال ❌",
        description: "لم نتمكن من إرسال ملاحظاتك. الرجاء المحاولة مرة أخرى.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <motion.div 
          className="flex justify-center mt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <FeedbackButton 
            onClick={() => setIsOpen(true)}
            colorTheme={colorTheme}
          />
        </motion.div>
      </DialogTrigger>
      
      <FeedbackDialogContent colorTheme={colorTheme}>
        <FeedbackDialogHeader colorTheme={colorTheme} />
        
        <motion.div
          className="py-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <FeedbackForm
            visitorName={visitorName}
            setVisitorName={setVisitorName}
            visitorPhone={visitorPhone}
            setVisitorPhone={setVisitorPhone}
            feedbackType={feedbackType}
            setFeedbackType={setFeedbackType}
            description={description}
            setDescription={setDescription}
            isSubmitting={isSubmitting}
            onSubmit={handleSubmit}
            colorTheme={colorTheme}
          />
        </motion.div>
      </FeedbackDialogContent>
    </Dialog>
  );
};

export default FeedbackDialog;
