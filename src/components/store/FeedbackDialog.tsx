import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { MessageSquare } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface FeedbackDialogProps {
  userId: string;
}

const FeedbackDialog = ({ userId }: FeedbackDialogProps) => {
  const [visitorName, setVisitorName] = useState("");
  const [feedbackType, setFeedbackType] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!visitorName || !feedbackType || !description) {
      toast({
        title: "خطأ",
        description: "الرجاء تعبئة جميع الحقول",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("feedback").insert({
        store_owner_id: userId,
        visitor_name: visitorName,
        type: feedbackType,
        description: description,
      });

      if (error) throw error;

      toast({
        title: "تم الإرسال",
        description: "شكراً لك على ملاحظاتك",
      });
      
      setVisitorName("");
      setFeedbackType("");
      setDescription("");
      setIsOpen(false);
    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء إرسال الملاحظات",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 mx-auto mt-8">
          <MessageSquare className="w-4 h-4" />
          إرسال ملاحظات
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-right">إرسال ملاحظات</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label className="text-right">الاسم</Label>
            <Input
              value={visitorName}
              onChange={(e) => setVisitorName(e.target.value)}
              className="text-right"
              placeholder="أدخل اسمك"
            />
          </div>
          <div className="grid gap-2">
            <Label className="text-right">نوع الملاحظات</Label>
            <Select value={feedbackType} onValueChange={setFeedbackType}>
              <SelectTrigger className="text-right">
                <SelectValue placeholder="اختر نوع الملاحظات" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="complaint">شكوى</SelectItem>
                <SelectItem value="suggestion">اقتراح</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label className="text-right">الوصف</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="text-right"
              placeholder="اكتب ملاحظاتك هنا"
            />
          </div>
        </div>
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full"
        >
          {isSubmitting ? "جاري الإرسال..." : "إرسال"}
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default FeedbackDialog;