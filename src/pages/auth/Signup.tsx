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
import { AlertCircle, Mail, User, Phone, Globe, Check, Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { AnimatePresence, motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PhoneAuthForm } from "@/components/auth/PhoneAuthForm";
import { AuthShell } from "@/components/auth/AuthShell";

const signupSchema = z.object({
  username: z.string().min(3, { message: "يجب أن يكون اسم المستخدم 3 أحرف على الأقل" }),
  email: z.string().email({ message: "البريد الإلكتروني غير صالح" }),
  phone: z.string().min(10, { message: "رقم الهاتف غير صالح" }),
  password: z.string().min(6, { message: "يجب أن تكون كلمة المرور 6 أحرف على الأقل" }),
  slug: z.string()
    .min(3, { message: "يجب أن يكون النطاق 3 أحرف على الأقل" })
    .regex(/^[a-z0-9-]+$/, { message: "أحرف إنجليزية صغيرة وأرقام وشرطة فقط" })
    .refine(v => !v.includes("--"), { message: "لا يُسمح بشرطتين متتاليتين" }),
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

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { username: "", email: "", phone: "", password: "", slug: "" },
  });

  const slugValue = form.watch("slug");

  const checkSlugAvailability = async (value: string) => {
    if (!value || value.length < 3) {
      setIsSlugAvailable(null);
      setSlugError(value.length > 0 ? "3 أحرف على الأقل" : null);
      return;
    }
    if (!/^[a-z0-9-]+$/.test(value)) {
      setIsSlugAvailable(false);
      setSlugError("أحرف إنجليزية صغيرة وأرقام فقط");
      return;
    }
    setIsCheckingSlug(true);
    setSlugError(null);
    try {
      const { data } = await supabase.from("store_settings").select("slug").eq("slug", value).maybeSingle();
      setIsSlugAvailable(!data);
      if (data) setSlugError("هذا النطاق مستخدم بالفعل");
    } finally {
      setIsCheckingSlug(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(() => slugValue ? checkSlugAvailability(slugValue) : (setIsSlugAvailable(null), setSlugError(null)), 500);
    return () => clearTimeout(t);
  }, [slugValue]);

  const handleSignup = async (values: SignupFormValues) => {
    if (!isSlugAvailable) {
      toast({ variant: "destructive", title: "النطاق غير متاح" });
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: { username: values.username, phone: values.phone, account_status: "pending" },
        },
      });
      if (error) throw error;
      if (data.user) {
        await supabase.from("user_roles").insert({ user_id: data.user.id, role: "user" });
        await supabase.from("store_settings").insert({ user_id: data.user.id, slug: values.slug });
        setSignupSuccess(true);
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: error.message === "User already registered" ? "البريد الإلكتروني مستخدم بالفعل" : "خطأ في إنشاء الحساب",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  if (signupSuccess) {
    const savedSlug = form.getValues("slug");
    return (
      <AuthShell title="تم إنشاء الحساب">
        <Alert className="border-emerald-500/30 bg-emerald-500/10">
          <AlertCircle className="h-4 w-4 text-emerald-500" />
          <AlertTitle className="text-emerald-600 dark:text-emerald-400 font-bold">تم بنجاح!</AlertTitle>
          <AlertDescription className="mt-2 space-y-2">
            <p>سيتم مراجعة حسابك وتفعيله قريباً.</p>
            <p className="font-mono text-xs bg-background/60 px-2 py-1 rounded inline-block" dir="ltr">
              qrmenuc.com/{savedSlug}
            </p>
          </AlertDescription>
        </Alert>
        <div className="mt-4 space-y-2">
          <Button onClick={() => navigate(`/${savedSlug}`)} className="w-full h-11">الذهاب إلى المتجر</Button>
          <Button onClick={() => navigate("/auth/login")} variant="outline" className="w-full h-11">تسجيل الدخول</Button>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="إنشاء حساب جديد"
      subtitle="ابدأ متجرك الإلكتروني في دقائق"
      footer={
        <span className="text-muted-foreground">
          لديك حساب؟{" "}
          <button onClick={() => navigate("/auth/login")} className="font-medium text-primary hover:underline">
            سجّل الدخول
          </button>
        </span>
      }
    >
      <Tabs defaultValue="phone" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-5 h-11 bg-muted/50 backdrop-blur">
          <TabsTrigger value="phone" className="gap-1.5"><Phone className="h-4 w-4" /> الهاتف</TabsTrigger>
          <TabsTrigger value="email" className="gap-1.5"><Mail className="h-4 w-4" /> البريد</TabsTrigger>
        </TabsList>

        <TabsContent value="phone" className="mt-0">
          <PhoneAuthForm mode="signup" />
        </TabsContent>

        <TabsContent value="email" className="mt-0">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSignup)} className="space-y-4">
              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>نطاق المتجر</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Globe className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          {...field}
                          onChange={(e) => field.onChange(e.target.value.toLowerCase())}
                          disabled={loading}
                          placeholder="my-store"
                          className="pr-10 pl-9 h-11 text-left bg-background/40 border-border/50"
                          dir="ltr"
                        />
                        <div className="absolute left-3 top-1/2 -translate-y-1/2">
                          <AnimatePresence mode="wait">
                            {isCheckingSlug && (
                              <motion.div key="c" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                              </motion.div>
                            )}
                            {!isCheckingSlug && isSlugAvailable && (
                              <motion.div key="ok" initial={{ scale: 0 }} animate={{ scale: 1 }}>
                                <Check className="h-4 w-4 text-emerald-500" />
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    </FormControl>
                    {slugError && <p className="text-xs text-destructive mt-1">{slugError}</p>}
                    {isSlugAvailable && <p className="text-xs text-emerald-500 mt-1">✓ النطاق متاح</p>}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField control={form.control} name="username" render={({ field }) => (
                <FormItem>
                  <FormLabel>اسم المستخدم</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <User className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input {...field} disabled={loading} className="pr-10 h-11 bg-background/40 border-border/50" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem>
                  <FormLabel>البريد الإلكتروني</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Mail className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input {...field} type="email" disabled={loading} className="pr-10 h-11 bg-background/40 border-border/50" dir="ltr" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="phone" render={({ field }) => (
                <FormItem>
                  <FormLabel>رقم الهاتف</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Phone className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input {...field} type="tel" disabled={loading} className="pr-10 h-11 bg-background/40 border-border/50" dir="ltr" placeholder="07xxxxxxxx" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="password" render={({ field }) => (
                <FormItem>
                  <FormLabel>كلمة المرور</FormLabel>
                  <FormControl><PasswordInput {...field} disabled={loading} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <Button type="submit" className="w-full h-12 font-semibold" disabled={loading || !isSlugAvailable}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "إنشاء الحساب"}
              </Button>
            </form>
          </Form>
        </TabsContent>
      </Tabs>
    </AuthShell>
  );
};

export default Signup;
