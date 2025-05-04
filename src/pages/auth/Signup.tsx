
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Mail, User, Phone } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AnimatedBackground } from "@/components/auth/AnimatedBackground";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { motion } from "framer-motion";

// تعريف مخطط التحقق من البيانات باستخدام Zod
const signupSchema = z.object({
  username: z.string().min(3, { message: "يجب أن يكون اسم المستخدم 3 أحرف على الأقل" }),
  email: z.string().email({ message: "البريد الإلكتروني غير صالح" }),
  phone: z.string().min(10, { message: "رقم الهاتف غير صالح" }),
  password: z.string().min(6, { message: "يجب أن تكون كلمة المرور 6 أحرف على الأقل" })
});

type SignupFormValues = z.infer<typeof signupSchema>;

const Signup = () => {
  const [loading, setLoading] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // إعداد نموذج React Hook Form مع Zod
  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      username: "",
      email: "",
      phone: "",
      password: ""
    }
  });

  const handleSignup = async (values: SignupFormValues) => {
    setLoading(true);

    try {
      // إنشاء المستخدم في Supabase
      const { data, error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            username: values.username,
            phone: values.phone,
            // تعيين حالة المستخدم كمعلق حتى تتم مراجعته
            account_status: "pending",
          },
        },
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        // إضافة المستخدم إلى جدول الأدوار كمستخدم عادي
        const { error: roleError } = await supabase
          .from('user_roles')
          .insert({
            user_id: data.user.id,
            role: 'user'
          });

        if (roleError) {
          console.error("خطأ في إضافة دور المستخدم:", roleError);
        }

        // عرض رسالة نجاح
        setSignupSuccess(true);
      }
    } catch (error: any) {
      // معالجة الأخطاء المختلفة
      if (error.message === "User already registered") {
        toast({
          variant: "destructive",
          title: "البريد الإلكتروني مستخدم بالفعل",
          description: "الرجاء استخدام بريد إلكتروني آخر أو تسجيل الدخول",
        });
      } else {
        toast({
          variant: "destructive",
          title: "خطأ في إنشاء الحساب",
          description: error.message || "حدث خطأ غير متوقع",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // إذا تم إنشاء الحساب بنجاح، نعرض رسالة تأكيد
  if (signupSuccess) {
    return (
      <div className="min-h-screen w-full overflow-hidden relative flex items-center justify-center">
        <AnimatedBackground />
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-primary/30 blur-[100px] rounded-full"></div>
        <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-primary/20 blur-[120px] rounded-full"></div>
        
        <motion.div 
          className="auth-container z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div 
            className="auth-card"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Alert className="mb-6 bg-green-50 border-green-200">
              <AlertCircle className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-600">تم إنشاء الحساب بنجاح!</AlertTitle>
              <AlertDescription className="mt-2">
                شكراً لتسجيلك في منصتنا. سيتم مراجعة حسابك قريباً وسنتواصل معك عبر الهاتف لتفعيل حسابك.
                لن تتمكن من تسجيل الدخول حتى يتم تفعيل حسابك من قبل المشرفين.
              </AlertDescription>
            </Alert>
            <Button 
              onClick={() => navigate("/auth/login")} 
              variant="outline" 
              className="w-full"
            >
              العودة إلى صفحة تسجيل الدخول
            </Button>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full overflow-hidden relative flex items-center justify-center">
      {/* خلفية متحركة */}
      <AnimatedBackground />
      
      {/* تأثيرات نيون إضافية */}
      <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-primary/30 blur-[100px] rounded-full"></div>
      <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-primary/20 blur-[120px] rounded-full"></div>
      
      {/* بطاقة التسجيل */}
      <motion.div
        className="auth-container z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <motion.div 
          className="auth-card"
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          whileHover={{ boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)" }}
        >
          <motion.div 
            className="text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <h2 className="auth-title">إنشاء حساب جديد</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              لديك حساب بالفعل؟{" "}
              <button
                onClick={() => navigate("/auth/login")}
                className="font-medium text-primary hover:text-primary/80"
              >
                تسجيل الدخول
              </button>
            </p>
          </motion.div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSignup)} className="mt-8 space-y-6">
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>اسم المستخدم</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                            <User className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <Input
                            {...field}
                            disabled={loading}
                            className="ps-10 mt-1 text-right"
                            dir="rtl"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>البريد الإلكتروني</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <Input
                            {...field}
                            type="email"
                            disabled={loading}
                            className="ps-10 mt-1 text-right"
                            dir="rtl"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>رقم الهاتف</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <Input
                            {...field}
                            type="tel"
                            disabled={loading}
                            className="ps-10 mt-1 text-right"
                            dir="rtl"
                            placeholder="مثال: 07xxxxxxxx"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>كلمة المرور</FormLabel>
                      <FormControl>
                        <PasswordInput
                          {...field}
                          disabled={loading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.5 }}
              >
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <span className="mr-2">جاري التحميل...</span>
                      <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                    </>
                  ) : "إنشاء حساب"}
                </Button>
              </motion.div>
            </form>
          </Form>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Signup;
