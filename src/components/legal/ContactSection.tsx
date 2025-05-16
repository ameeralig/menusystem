
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Send } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

// تحديد نموذج التحقق باستخدام Zod
const formSchema = z.object({
  name: z.string().min(2, { message: "الاسم يجب أن يكون أكثر من حرفين" }),
  email: z.string().email({ message: "يرجى إدخال بريد إلكتروني صحيح" }),
  message: z.string().min(10, { message: "الرسالة يجب أن تكون أكثر من 10 أحرف" })
});

type FormValues = z.infer<typeof formSchema>;

const ContactSection = () => {
  const { toast } = useToast();
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      message: ""
    },
  });

  // تكوين تأثيرات الانتقال
  const contentVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
  };

  const onSubmit = (data: FormValues) => {
    console.log("بيانات النموذج:", data);
    toast({
      title: "تم إرسال رسالتك بنجاح",
      description: "سنقوم بالرد عليك في أقرب وقت ممكن.",
    });
    form.reset();
  };

  return (
    <motion.div
      variants={contentVariants}
      initial="hidden"
      animate="visible"
      exit="hidden"
      className="p-6 bg-white/5 backdrop-blur-sm rounded-xl"
    >
      <h2 className="text-2xl font-bold mb-4 text-white text-center" style={{ textShadow: "0 0 10px rgba(255, 255, 255, 0.3)" }}>
        اتصل بنا
      </h2>
      <p className="text-white text-lg mb-6 text-center">
        نحن هنا للإجابة على أسئلتك واستفساراتك. يرجى ملء النموذج أدناه وسنعود إليك في أقرب وقت ممكن.
      </p>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 text-right">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel className="block text-lg font-medium text-white mb-2" style={{ textShadow: "0 0 5px rgba(255, 255, 255, 0.3)" }}>
                  الاسم
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    className="w-full bg-white/10 border-white/20 text-white text-lg placeholder:text-white/50 h-12 rounded-lg"
                    placeholder="أدخل اسمك الكامل"
                  />
                </FormControl>
                <FormMessage className="text-red-400 font-medium text-sm" />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel className="block text-lg font-medium text-white mb-2" style={{ textShadow: "0 0 5px rgba(255, 255, 255, 0.3)" }}>
                  البريد الإلكتروني
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="email"
                    className="w-full bg-white/10 border-white/20 text-white text-lg placeholder:text-white/50 h-12 rounded-lg"
                    placeholder="أدخل بريدك الإلكتروني"
                  />
                </FormControl>
                <FormMessage className="text-red-400 font-medium text-sm" />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="message"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel className="block text-lg font-medium text-white mb-2" style={{ textShadow: "0 0 5px rgba(255, 255, 255, 0.3)" }}>
                  الرسالة
                </FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    className="w-full min-h-[150px] bg-white/10 border-white/20 text-white text-lg placeholder:text-white/50 rounded-lg"
                    placeholder="أدخل رسالتك هنا..."
                  />
                </FormControl>
                <FormMessage className="text-red-400 font-medium text-sm" />
              </FormItem>
            )}
          />
          
          <motion.div
            whileHover={{ scale: 1.03, boxShadow: "0 8px 20px rgba(0, 0, 0, 0.2)" }}
            whileTap={{ scale: 0.97 }}
            className="mt-4"
          >
            <Button 
              type="submit" 
              className="w-full h-14 flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary text-white py-3 text-xl font-bold rounded-lg transition-all duration-300"
            >
              <span>إرسال الرسالة</span>
              <Send className="size-5" />
            </Button>
          </motion.div>
        </form>
      </Form>
    </motion.div>
  );
};

export default ContactSection;
