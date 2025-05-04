
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { AlertCircle, Mail } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { PasswordInput } from "./PasswordInput";
import { getErrorMessage } from "@/utils/errorHandling";

const formSchema = z.object({
  email: z.string().email({
    message: "الرجاء إدخال بريد إلكتروني صحيح",
  }),
  password: z.string().min(1, {
    message: "الرجاء إدخال كلمة المرور",
  }),
});

export function LoginForm() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [accountPending, setAccountPending] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        console.log("معلومات المستخدم:", data.user);
        const userData = data.user.user_metadata;
        
        console.log("حالة الحساب:", userData?.account_status);
        
        if (userData?.account_status === "pending") {
          // تسجيل خروج المستخدم لأن حسابه لا يزال قيد المراجعة
          await supabase.auth.signOut();
          setUserEmail(values.email);
          setAccountPending(true);
          return;
        }

        // تسجيل الدخول بنجاح
        toast({
          title: "تم تسجيل الدخول بنجاح",
          description: "مرحباً بك مرة أخرى!",
        });
        
        navigate("/dashboard");
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "خطأ في تسجيل الدخول",
        description: getErrorMessage(error),
      });
    } finally {
      setLoading(false);
    }
  }

  if (accountPending) {
    return (
      <div className="space-y-6">
        <Alert className="bg-yellow-50 border-yellow-200">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <AlertTitle className="text-yellow-600">الحساب قيد المراجعة</AlertTitle>
          <AlertDescription className="mt-2">
            حسابك ({userEmail}) لا يزال قيد المراجعة من قبل المشرفين. سيتم الاتصال بك عبر رقم الهاتف المسجل لتفعيل حسابك.
            يرجى المحاولة مرة أخرى لاحقاً.
          </AlertDescription>
        </Alert>

        <Button 
          onClick={() => setAccountPending(false)} 
          variant="outline" 
          className="w-full"
        >
          العودة
        </Button>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                    placeholder="your@email.com"
                    {...field}
                    className="ps-10 text-right"
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
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>كلمة المرور</FormLabel>
              <FormControl>
                <PasswordInput
                  {...field}
                  placeholder="********"
                  disabled={loading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? (
            <>
              <span className="mr-2">جاري التحميل...</span>
              <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
            </>
          ) : "تسجيل الدخول"}
        </Button>
      </form>
    </Form>
  );
}
