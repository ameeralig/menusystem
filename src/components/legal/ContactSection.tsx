
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
      className="bg-white rounded-lg shadow-lg overflow-hidden mt-2" // تم إضافة mt-2 لزيادة المسافة
    >
      {/* عنوان القسم */}
      <div className="p-3 sm:p-4 bg-gradient-to-l from-primary/90 to-primary text-white text-center">
        <h2 className="text-xl sm:text-2xl font-bold">اتصل بنا</h2>
      </div>

      {/* المحتوى */}
      <div className="p-4 sm:p-6">
        <p className="text-gray-800 text-sm sm:text-base mb-4 sm:mb-6 text-center">
          نحن هنا للإجابة على أسئلتك واستفساراتك. يرجى ملء النموذج أدناه وسنعود إليك في أقرب وقت ممكن.
        </p>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3 sm:space-y-4 text-right">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="space-y-1 sm:space-y-2">
                  <FormLabel className="block text-sm sm:text-base font-medium text-gray-800">
                    الاسم
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      className="w-full border border-gray-300 text-gray-800 text-sm sm:text-base bg-white placeholder:text-gray-500 h-10 sm:h-12 rounded-md"
                      placeholder="أدخل اسمك الكامل"
                    />
                  </FormControl>
                  <FormMessage className="text-red-500 font-medium text-xs sm:text-sm" />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="space-y-1 sm:space-y-2">
                  <FormLabel className="block text-sm sm:text-base font-medium text-gray-800">
                    البريد الإلكتروني
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="email"
                      className="w-full border border-gray-300 text-gray-800 text-sm sm:text-base bg-white placeholder:text-gray-500 h-10 sm:h-12 rounded-md"
                      placeholder="أدخل بريدك الإلكتروني"
                    />
                  </FormControl>
                  <FormMessage className="text-red-500 font-medium text-xs sm:text-sm" />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem className="space-y-1 sm:space-y-2">
                  <FormLabel className="block text-sm sm:text-base font-medium text-gray-800">
                    الرسالة
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      className="w-full min-h-[100px] sm:min-h-[120px] border border-gray-300 text-gray-800 text-sm sm:text-base bg-white placeholder:text-gray-500 rounded-md"
                      placeholder="أدخل رسالتك هنا..."
                    />
                  </FormControl>
                  <FormMessage className="text-red-500 font-medium text-xs sm:text-sm" />
                </FormItem>
              )}
            />
            
            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="mt-3 sm:mt-4"
            >
              <Button 
                type="submit" 
                className="w-full h-10 sm:h-12 flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary text-white py-2 sm:py-3 text-sm sm:text-base font-bold rounded-md transition-all duration-300"
              >
                <span>إرسال الرسالة</span>
                <Send className="size-4 sm:size-5" />
              </Button>
            </motion.div>
          </form>
        </Form>
      </div>
    </motion.div>
  );
};

export default ContactSection;
