
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
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

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
      <div className="auth-container">
        <div className="auth-card">
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
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="text-center">
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
        </div>

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
                      <Input
                        {...field}
                        disabled={loading}
                        className="mt-1 text-right"
                        dir="rtl"
                      />
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
                      <Input
                        {...field}
                        type="email"
                        disabled={loading}
                        className="mt-1 text-right"
                        dir="rtl"
                      />
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
                      <Input
                        {...field}
                        type="tel"
                        disabled={loading}
                        className="mt-1 text-right"
                        dir="rtl"
                        placeholder="مثال: 07xxxxxxxx"
                      />
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
                      <Input
                        {...field}
                        type="password"
                        disabled={loading}
                        className="mt-1 text-right"
                        dir="rtl"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "جاري التحميل..." : "إنشاء حساب"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default Signup;
