import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Send, CheckCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const CustomerFeedback = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    visitorName: "",
    visitorPhone: "",
    feedbackType: "",
    description: "",
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    if (!userId) {
      navigate("/404");
      return;
    }
  }, [userId, navigate]);

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

  const handleSubmit = async () => {
    if (!validateForm()) return;

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

      setIsSubmitted(true);
      setFormData({
        visitorName: "",
        visitorPhone: "",
        feedbackType: "",
        description: "",
      });

      // العودة إلى الصفحة السابقة بعد 3 ثواني
      setTimeout(() => {
        navigate(-1);
      }, 3000);

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

  const handleGoBack = () => {
    navigate(-1);
  };

  const isFormValid = formData.visitorName.trim() && formData.feedbackType && formData.description.trim();

  if (isSubmitted) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center p-4 bg-gradient-to-br from-background to-muted">
        <Card className="w-full max-w-md mx-auto text-center">
          <CardContent className="pt-8 pb-8">
            <div className="flex flex-col items-center space-y-4">
              <CheckCircle className="w-16 h-16 text-green-500" />
              <h2 className="text-2xl font-bold text-foreground">
                تم إرسال ملاحظاتك بنجاح!
              </h2>
              <p className="text-muted-foreground">
                شكراً لك على مشاركة رأيك معنا. سيتم مراجعة ملاحظاتك والرد عليها في أقرب وقت ممكن.
              </p>
              <div className="text-sm text-muted-foreground">
                سيتم إعادة توجيهك تلقائياً خلال 3 ثواني...
              </div>
              <Button onClick={handleGoBack} variant="outline">
                العودة الآن
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-gradient-to-br from-background to-muted">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold">شاركنا رأيك</CardTitle>
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
          <CardDescription>
            نحن نقدر ملاحظاتك ونسعى لتحسين خدماتنا باستمرار
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* اسم الزائر */}
          <div className="space-y-2">
            <Label htmlFor="visitorName">الاسم *</Label>
            <Input
              id="visitorName"
              type="text"
              value={formData.visitorName}
              onChange={(e) => handleInputChange("visitorName", e.target.value)}
              placeholder="الرجاء إدخال اسمك"
              maxLength={100}
              className="text-right"
            />
          </div>

          {/* رقم الهاتف */}
          <div className="space-y-2">
            <Label htmlFor="visitorPhone">رقم الهاتف (اختياري)</Label>
            <Input
              id="visitorPhone"
              type="tel"
              value={formData.visitorPhone}
              onChange={(e) => handleInputChange("visitorPhone", e.target.value)}
              placeholder="رقم الهاتف للتواصل معك"
              maxLength={20}
              className="text-right"
            />
          </div>

          {/* نوع الملاحظة */}
          <div className="space-y-2">
            <Label htmlFor="feedbackType">نوع الملاحظة *</Label>
            <Select
              value={formData.feedbackType}
              onValueChange={(value) => handleInputChange("feedbackType", value)}
            >
              <SelectTrigger className="text-right">
                <SelectValue placeholder="اختر نوع الملاحظة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="complaint">شكوى</SelectItem>
                <SelectItem value="suggestion">اقتراح</SelectItem>
                <SelectItem value="compliment">إعجاب</SelectItem>
                <SelectItem value="question">استفسار</SelectItem>
                <SelectItem value="other">أخرى</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* وصف الملاحظة */}
          <div className="space-y-2">
            <Label htmlFor="description">تفاصيل الملاحظة *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="الرجاء كتابة ملاحظاتك بالتفصيل..."
              maxLength={1000}
              rows={5}
              className="text-right resize-none"
            />
            <div className="text-sm text-muted-foreground text-left">
              {formData.description.length}/1000
            </div>
          </div>

          {/* زر الإرسال */}
          <Button
            onClick={handleSubmit}
            disabled={!isFormValid || isSubmitting}
            className="w-full flex items-center justify-center gap-2"
            size="lg"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-background"></div>
                <span>جاري الإرسال...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>إرسال الملاحظة</span>
              </>
            )}
          </Button>

          {/* رسالة تشجيعية */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              رأيك مهم لنا ويساعدنا على تقديم خدمة أفضل 💙
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomerFeedback;