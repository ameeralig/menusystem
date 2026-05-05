import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Mail, User, Phone, Globe, Check, Loader2, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { motion, AnimatePresence } from "framer-motion";
import SimpleBackground from "@/components/background/SimpleBackground";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PhoneAuthForm } from "@/components/auth/PhoneAuthForm";

// تعريف مخطط التحقق من البيانات باستخدام Zod
const signupSchema = z.object({
  username: z.string().min(3, { message: "يجب أن يكون اسم المستخدم 3 أحرف على الأقل" }),
  email: z.string().email({ message: "البريد الإلكتروني غير صالح" }),
  phone: z.string().min(10, { message: "رقم الهاتف غير صالح" }),
  password: z.string().min(6, { message: "يجب أن تكون كلمة المرور 6 أحرف على الأقل" }),
  slug: z.string()
    .min(3, { message: "يجب أن يكون النطاق 3 أحرف على الأقل" })
    .regex(/^[a-z0-9-]+$/, { message: "يُسمح فقط بالأحرف الإنجليزية الصغيرة والأرقام والشرطة (-)" })
    .refine(val => !val.includes("--"), { message: "لا يُسمح بشرطتين متتاليتين" })
});

type SignupFormValues = z.infer<typeof signupSchema>;

const Signup = () => {
  const [loading, setLoading] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [isCheckingSlug, setIsCheckingSlug] = useState(false);
  const [isSlugAvailable, setIsSlugAvailable] = useState<boolean | null>(null);
  const [slugError, setSlugError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  // إعداد نموذج React Hook Form مع Zod
  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      username: "",
      email: "",
      phone: "",
      password: "",
      slug: ""
    }
  });

  const slugValue = form.watch("slug");

  // التحقق من توفر النطاق
  const checkSlugAvailability = async (value: string) => {
    if (!value || value.length < 3) {
      setIsSlugAvailable(null);
      setSlugError(value.length > 0 ? "يجب أن يكون النطاق 3 أحرف على الأقل" : null);
      return;
    }

    const validPattern = /^[a-z0-9-]+$/;
    if (!validPattern.test(value)) {
      setIsSlugAvailable(false);
      setSlugError("يُسمح فقط بالأحرف الإنجليزية الصغيرة والأرقام والشرطة (-)");
      return;
    }

    if (value.includes("--")) {
      setIsSlugAvailable(false);
      setSlugError("لا يُسمح بشرطتين متتاليتين");
      return;
    }

    setIsCheckingSlug(true);
    setSlugError(null);

    try {
      const { data, error } = await supabase
        .from("store_settings")
        .select("slug")
        .eq("slug", value)
        .maybeSingle();

      if (error) throw error;
      
      setIsSlugAvailable(!data);
      if (data) {
        setSlugError("هذا النطاق مستخدم بالفعل");
      }
    } catch (err) {
      console.error("Error checking slug:", err);
      setSlugError("حدث خطأ أثناء التحقق");
    } finally {
      setIsCheckingSlug(false);
    }
  };

  // debounce للتحقق من النطاق
  useEffect(() => {
    const timer = setTimeout(() => {
      if (slugValue) {
        checkSlugAvailability(slugValue);
      } else {
        setIsSlugAvailable(null);
        setSlugError(null);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [slugValue]);

  const handleSignup = async (values: SignupFormValues) => {
    // التحقق من توفر النطاق قبل المتابعة
    if (!isSlugAvailable) {
      toast({
        variant: "destructive",
        title: "النطاق غير متاح",
        description: "الرجاء اختيار نطاق آخر متاح",
      });
      return;
    }

    setLoading(true);

    try {
      // إنشاء المستخدم في Supabase
      const { data, error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            username: values.username,
            phone: values.phone,
            account_status: "pending",
          },
        },
      });

      if (error) throw error;

      if (data.user) {
        // إضافة المستخدم إلى جدول الأدوار
        await supabase.from('user_roles').insert({
          user_id: data.user.id,
          role: 'user'
        });

        // إنشاء إعدادات المتجر مع النطاق
        await supabase.from('store_settings').insert({
          user_id: data.user.id,
          slug: values.slug
        });

        // عرض رسالة نجاح
        setSignupSuccess(true);
      }
    } catch (error: any) {
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

  // بعد نجاح التسجيل - الانتقال مباشرة للمعاينة
  if (signupSuccess) {
    const savedSlug = form.getValues("slug");
    
    return (
      <div className="min-h-screen w-full overflow-hidden relative flex items-center justify-center">
        <SimpleBackground />
        
        <motion.div 
          className="auth-container z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div 
            className="auth-card backdrop-blur-xl bg-white/5 border border-white/20"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Alert className="mb-6 backdrop-blur-xl bg-green-500/10 border border-green-400/30">
              <AlertCircle className="h-4 w-4 text-green-400" />
              <AlertTitle className="text-green-400 font-bold drop-shadow-lg">تم إنشاء الحساب بنجاح!</AlertTitle>
              <AlertDescription className="mt-2 text-white/90 drop-shadow-lg">
                سيتم مراجعة حسابك قريباً وسنتواصل معك عبر الهاتف لتفعيله.
                <br /><br />
                <span className="font-semibold">رابط متجرك:</span>
                <br />
                <code className="bg-white/10 px-2 py-1 rounded text-green-300 text-sm" dir="ltr">
                  qrmenuc.com/{savedSlug}
                </code>
              </AlertDescription>
            </Alert>
            
            <div className="space-y-3">
              <Button 
                onClick={() => navigate(`/${savedSlug}`)} 
                className="w-full"
              >
                الذهاب لصفحة المتجر
              </Button>
              <Button 
                onClick={() => navigate("/auth/login")} 
                variant="outline" 
                className="w-full"
              >
                العودة إلى صفحة تسجيل الدخول
              </Button>
            </div>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full overflow-hidden relative flex items-center justify-center py-8">
      <SimpleBackground />
      
      <motion.div
        className="auth-container z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <motion.div 
          className="auth-card backdrop-blur-xl bg-white/5 border border-white/20 max-w-md"
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <motion.div 
            className="text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <h2 className="text-3xl font-black text-white mb-2 font-cyber drop-shadow-[0_0_20px_rgba(59,170,255,0.8)]">
              <span className="bg-gradient-to-r from-[#3baaff] via-[#a78bfa] to-[#f0abfc] bg-clip-text text-transparent">
                إنشاء حساب جديد
              </span>
            </h2>
            <p className="mt-2 text-sm text-white/90 drop-shadow-[0_2px_10px_rgba(255,255,255,0.5)]">
              لديك حساب بالفعل؟{" "}
              <button
                onClick={() => navigate("/auth/login")}
                className="font-medium text-[#3baaff] hover:text-[#a78bfa] transition-colors"
              >
                تسجيل الدخول
              </button>
            </p>
          </motion.div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSignup)} className="mt-6 space-y-4">
              {/* حقل النطاق الفرعي - أولاً وبشكل بارز */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30"
              >
                <div className="flex items-start gap-2 mb-3">
                  <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-semibold text-amber-400">تنبيه مهم!</p>
                    <p className="text-white/70 text-xs">النطاق لا يمكن تغييره لاحقًا</p>
                  </div>
                </div>
                
                <FormField
                  control={form.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white/90">نطاق المتجر</FormLabel>
                      <FormControl>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 relative">
                            <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                              <Globe className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <Input
                              {...field}
                              onChange={(e) => field.onChange(e.target.value.toLowerCase())}
                              disabled={loading}
                              placeholder="my-store"
                              className="ps-10 text-left"
                              dir="ltr"
                            />
                            <div className="absolute left-3 top-1/2 -translate-y-1/2">
                              <AnimatePresence mode="wait">
                                {isCheckingSlug && (
                                  <motion.div
                                    key="checking"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                  >
                                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                  </motion.div>
                                )}
                                {!isCheckingSlug && isSlugAvailable === true && (
                                  <motion.div
                                    key="available"
                                    initial={{ opacity: 0, scale: 0.5 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0 }}
                                  >
                                    <Check className="h-4 w-4 text-green-500" />
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          </div>
                          <span className="text-white/60 text-xs whitespace-nowrap">.qrmenuc.com</span>
                        </div>
                      </FormControl>
                      {slugError && (
                        <p className="text-sm text-red-400 mt-1">{slugError}</p>
                      )}
                      {isSlugAvailable && slugValue && (
                        <p className="text-sm text-green-400 mt-1">✓ النطاق متاح</p>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </motion.div>

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
                        <PasswordInput {...field} disabled={loading} />
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
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={loading || !isSlugAvailable}
                >
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
