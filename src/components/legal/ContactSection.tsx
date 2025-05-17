
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
      className="bg-white rounded-lg shadow-lg overflow-hidden"
    >
      {/* عنوان القسم */}
      <div className="p-2.5 sm:p-3 md:p-4 bg-gradient-to-l from-primary/90 to-primary text-white text-center">
        <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold">اتصل بنا</h2>
      </div>

      {/* المحتوى */}
      <div className="p-3 sm:p-4 md:p-5 lg:p-6">
        <p className="text-xs sm:text-sm text-gray-800 mb-3 sm:mb-4 md:mb-5 text-center max-w-lg mx-auto">
          نحن هنا للإجابة على أسئلتك واستفساراتك. يرجى ملء النموذج أدناه وسنعود إليك في أقرب وقت ممكن.
        </p>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3 sm:space-y-4 text-right">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="space-y-1 sm:space-y-1.5">
                  <FormLabel className="block text-xs sm:text-sm font-medium text-gray-800">
                    الاسم
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      className="w-full border border-gray-300 text-gray-800 text-xs sm:text-sm bg-white placeholder:text-gray-500
                                h-9 sm:h-10 md:h-11 rounded-md px-3 text-right"
                      placeholder="أدخل اسمك الكامل"
                    />
                  </FormControl>
                  <FormMessage className="text-red-500 font-medium text-xs" />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="space-y-1 sm:space-y-1.5">
                  <FormLabel className="block text-xs sm:text-sm font-medium text-gray-800">
                    البريد الإلكتروني
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="email"
                      className="w-full border border-gray-300 text-gray-800 text-xs sm:text-sm bg-white placeholder:text-gray-500 
                                h-9 sm:h-10 md:h-11 rounded-md px-3 text-right"
                      placeholder="أدخل بريدك الإلكتروني"
                    />
                  </FormControl>
                  <FormMessage className="text-red-500 font-medium text-xs" />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem className="space-y-1 sm:space-y-1.5">
                  <FormLabel className="block text-xs sm:text-sm font-medium text-gray-800">
                    الرسالة
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      className="w-full min-h-[80px] sm:min-h-[100px] md:min-h-[120px] border border-gray-300 text-gray-800 
                               text-xs sm:text-sm bg-white placeholder:text-gray-500 rounded-md px-3 py-2 text-right"
                      placeholder="أدخل رسالتك هنا..."
                    />
                  </FormControl>
                  <FormMessage className="text-red-500 font-medium text-xs" />
                </FormItem>
              )}
            />
            
            <motion.div
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className="mt-3 sm:mt-4 md:mt-5"
            >
              <Button 
                type="submit" 
                className="w-full h-10 sm:h-11 md:h-12 flex items-center justify-center gap-2 
                          bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary 
                          text-white text-xs sm:text-sm font-medium rounded-md transition-all duration-300"
              >
                <span>إرسال الرسالة</span>
                <Send className="size-3.5 sm:size-4" />
              </Button>
            </motion.div>
          </form>
        </Form>
      </div>
    </motion.div>
  );
};

export default ContactSection;
