import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Webhook, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface N8nWebhookSectionProps {
  webhookUrl: string;
  onWebhookSubmit: (url: string) => Promise<void>;
  isLoading: boolean;
}

const N8nWebhookSection = ({ 
  webhookUrl, 
  onWebhookSubmit, 
  isLoading 
}: N8nWebhookSectionProps) => {
  const [localWebhookUrl, setLocalWebhookUrl] = useState(webhookUrl);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!localWebhookUrl.trim()) {
      toast({
        title: "خطأ",
        description: "الرجاء إدخال رابط webhook",
        variant: "destructive",
      });
      return;
    }

    // التحقق من صحة الرابط
    try {
      new URL(localWebhookUrl);
    } catch {
      toast({
        title: "خطأ",
        description: "الرجاء إدخال رابط صحيح",
        variant: "destructive",
      });
      return;
    }

    await onWebhookSubmit(localWebhookUrl);
  };

  return (
    <Card className="mt-6 bg-card/50 backdrop-blur-sm border-border/60">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-right">
          <Webhook className="h-5 w-5" />
          ربط n8n
        </CardTitle>
        <CardDescription className="text-right">
          قم بربط متجرك مع n8n لإرسال إشعارات تلقائية عند إضافة أو تعديل المنتجات
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="n8n-webhook" className="text-right block">
            رابط Webhook الخاص بـ n8n
          </Label>
          <Input
            id="n8n-webhook"
            type="url"
            placeholder="https://your-n8n-instance.com/webhook/your-webhook-id"
            value={localWebhookUrl}
            onChange={(e) => setLocalWebhookUrl(e.target.value)}
            className="text-right"
            dir="ltr"
          />
          <p className="text-xs text-muted-foreground text-right">
            سيتم إرسال بيانات المنتج (الاسم، السعر، الوصف، الصورة) إلى هذا الرابط عند كل إضافة أو تعديل
          </p>
        </div>
        <Button 
          onClick={handleSubmit} 
          disabled={isLoading}
          className="w-full"
        >
          <Save className="ml-2 h-4 w-4" />
          حفظ رابط Webhook
        </Button>
      </CardContent>
    </Card>
  );
};

export default N8nWebhookSection;