
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { Spinner } from "@/components/ui/spinner";
import { AlertCircle, Send } from "lucide-react";
import { 
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";

const AdminNotificationsTab = () => {
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [sendToAll, setSendToAll] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSendNotification = async () => {
    if (!message.trim()) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "الرجاء كتابة نص الإشعار"
      });
      return;
    }

    try {
      setIsSending(true);
      
      if (sendToAll) {
        // إرسال إشعار لجميع المستخدمين
        console.log("إرسال إشعار لجميع المستخدمين");
        const response = await supabase.functions.invoke('manage-user', {
          body: { 
            action: 'message',
            messageAll: message
          }
        });
        
        if (response.error) {
          throw new Error(response.error);
        }
        
        toast({
          title: "تم بنجاح",
          description: "تم إرسال الإشعار إلى جميع المستخدمين"
        });
      } 
      else if (selectedUserId) {
        // إرسال إشعار لمستخدم محدد
        console.log(`إرسال إشعار للمستخدم ${selectedUserId}`);
        const response = await supabase.functions.invoke('manage-user', {
          body: { 
            action: 'message',
            userId: selectedUserId,
            message: message
          }
        });
        
        if (response.error) {
          throw new Error(response.error);
        }
        
        toast({
          title: "تم بنجاح",
          description: "تم إرسال الإشعار إلى المستخدم المحدد"
        });
      }
      
      // إعادة تعيين الحقول بعد الإرسال الناجح
      setMessage("");
      setSendToAll(false);
      setSelectedUserId(null);
      
    } catch (error: any) {
      console.error("خطأ في إرسال الإشعار:", error);
      toast({
        variant: "destructive",
        title: "خطأ",
        description: `فشل في إرسال الإشعار: ${error.message || "خطأ غير معروف"}`
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">إرسال إشعارات للمستخدمين</h3>
          
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>ملاحظة</AlertTitle>
            <AlertDescription>
              يمكنك إرسال إشعارات إلى جميع المستخدمين أو إلى مستخدمين محددين عند تحديدهم من قائمة المستخدمين
            </AlertDescription>
          </Alert>
          
          <div className="space-y-2">
            <Textarea
              placeholder="اكتب نص الإشعار هنا..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="min-h-[120px] resize-none"
            />
          </div>
          
          <div className="flex justify-end">
            <Button
              onClick={handleSendNotification}
              disabled={!message.trim() || isSending}
              className="flex items-center gap-2"
            >
              {isSending ? (
                <>
                  <Spinner className="h-4 w-4" />
                  جاري الإرسال...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  إرسال إشعار {sendToAll ? "للجميع" : selectedUserId ? "للمستخدم المحدد" : ""}
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminNotificationsTab;
