import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Send, CheckCircle, AlertCircle, Heart, MessageCircle, Star } from "lucide-react";
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

  // خلفية متحركة
  const AnimatedBackground = () => (
    <>
      <div className="fixed inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/10 -z-10" />
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="fixed rounded-full bg-primary/10 blur-xl -z-5"
          initial={{
            width: Math.random() * 200 + 50,
            height: Math.random() * 200 + 50,
            x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
            y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800),
            opacity: 0.1
          }}
          animate={{
            x: [
              Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
              Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
              Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000)
            ],
            y: [
              Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800),
              Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800),
              Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800)
            ],
            opacity: [0.1, 0.3, 0.1]
          }}
          transition={{
            duration: Math.random() * 20 + 20,
            repeat: Infinity,
            repeatType: "reverse"
          }}
        />
      ))}
    </>
  );

  if (isSubmitted) {
    return (
      <>
        <AnimatedBackground />
        <div className="min-h-screen w-full flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <Card className="w-full max-w-md mx-auto text-center shadow-xl border-0 bg-background/80 backdrop-blur-sm">
              <CardContent className="pt-8 pb-8">
                <motion.div 
                  className="flex flex-col items-center space-y-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5, duration: 0.5, type: "spring", bounce: 0.6 }}
                  >
                    <CheckCircle className="w-16 h-16 text-green-500" />
                  </motion.div>
                  <motion.h2 
                    className="text-2xl font-bold text-foreground"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.7, duration: 0.5 }}
                  >
                    تم إرسال ملاحظاتك بنجاح!
                  </motion.h2>
                  <motion.p 
                    className="text-muted-foreground"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.9, duration: 0.5 }}
                  >
                    شكراً لك على مشاركة رأيك معنا. سيتم مراجعة ملاحظاتك والرد عليها في أقرب وقت ممكن.
                  </motion.p>
                  <motion.div 
                    className="text-sm text-muted-foreground"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.1, duration: 0.5 }}
                  >
                    سيتم إعادة توجيهك تلقائياً خلال 3 ثواني...
                  </motion.div>
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 1.3, duration: 0.5 }}
                  >
                    <Button 
                      onClick={handleGoBack} 
                      variant="outline"
                      className="hover:scale-105 transition-transform duration-200"
                    >
                      العودة الآن
                    </Button>
                  </motion.div>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </>
    );
  }

  return (
    <>
      <AnimatedBackground />
      <div className="min-h-screen w-full flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <Card className="w-full max-w-md mx-auto shadow-xl border-0 bg-background/80 backdrop-blur-sm">
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <CardHeader className="text-center">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl font-bold">شاركنا رأيك</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleGoBack}
                    className="flex items-center gap-2 text-muted-foreground hover:text-foreground hover:scale-105 transition-all duration-200"
                  >
                    <ArrowRight className="w-4 h-4" />
                    <span>العودة</span>
                  </Button>
                </div>
                <CardDescription>
                  نحن نقدر ملاحظاتك ونسعى لتحسين خدماتنا باستمرار
                </CardDescription>
              </CardHeader>
            </motion.div>

            <CardContent className="space-y-6">
              {/* اسم الزائر */}
              <motion.div 
                className="space-y-2"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                <Label htmlFor="visitorName">الاسم *</Label>
                <Input
                  id="visitorName"
                  type="text"
                  value={formData.visitorName}
                  onChange={(e) => handleInputChange("visitorName", e.target.value)}
                  placeholder="الرجاء إدخال اسمك"
                  maxLength={100}
                  className="text-right transition-all duration-200 focus:scale-105"
                />
              </motion.div>

              {/* رقم الهاتف */}
              <motion.div 
                className="space-y-2"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                <Label htmlFor="visitorPhone">رقم الهاتف (اختياري)</Label>
                <Input
                  id="visitorPhone"
                  type="tel"
                  value={formData.visitorPhone}
                  onChange={(e) => handleInputChange("visitorPhone", e.target.value)}
                  placeholder="رقم الهاتف للتواصل معك"
                  maxLength={20}
                  className="text-right transition-all duration-200 focus:scale-105"
                />
              </motion.div>

              {/* نوع الملاحظة */}
              <motion.div 
                className="space-y-2"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
              >
                <Label htmlFor="feedbackType">نوع الملاحظة *</Label>
                <Select
                  value={formData.feedbackType}
                  onValueChange={(value) => handleInputChange("feedbackType", value)}
                >
                  <SelectTrigger className="text-right transition-all duration-200 hover:scale-105 focus:scale-105">
                    <SelectValue placeholder="اختر نوع الملاحظة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="complaint" className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-red-500" />
                      شكوى
                    </SelectItem>
                    <SelectItem value="suggestion" className="flex items-center gap-2">
                      <MessageCircle className="w-4 h-4 text-blue-500" />
                      اقتراح
                    </SelectItem>
                    <SelectItem value="compliment" className="flex items-center gap-2">
                      <Heart className="w-4 h-4 text-pink-500" />
                      إعجاب
                    </SelectItem>
                    <SelectItem value="question" className="flex items-center gap-2">
                      <MessageCircle className="w-4 h-4 text-yellow-600" />
                      استفسار
                    </SelectItem>
                    <SelectItem value="other" className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-purple-500" />
                      أخرى
                    </SelectItem>
                  </SelectContent>
                </Select>
              </motion.div>

              {/* وصف الملاحظة */}
              <motion.div 
                className="space-y-2"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.5 }}
              >
                <Label htmlFor="description">تفاصيل الملاحظة *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="الرجاء كتابة ملاحظاتك بالتفصيل..."
                  maxLength={1000}
                  rows={5}
                  className="text-right resize-none transition-all duration-200 focus:scale-105"
                />
                <div className="text-sm text-muted-foreground text-left">
                  {formData.description.length}/1000
                </div>
              </motion.div>

              {/* زر الإرسال */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.7, duration: 0.5 }}
              >
                <Button
                  onClick={handleSubmit}
                  disabled={!isFormValid || isSubmitting}
                  className="w-full flex items-center justify-center gap-2 hover:scale-105 transition-all duration-200"
                  size="lg"
                >
                  {isSubmitting ? (
                    <>
                      <motion.div 
                        className="animate-spin rounded-full h-4 w-4 border-b-2 border-background"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      />
                      <span>جاري الإرسال...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>إرسال الملاحظة</span>
                    </>
                  )}
                </Button>
              </motion.div>

              {/* رسالة تشجيعية */}
              <motion.div 
                className="text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.5 }}
              >
                <p className="text-sm text-muted-foreground">
                  رأيك مهم لنا ويساعدنا على تقديم خدمة أفضل 💙
                </p>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </>
  );
};

export default CustomerFeedback;