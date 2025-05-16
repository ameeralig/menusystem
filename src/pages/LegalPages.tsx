
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { AnimatedBackground } from "@/components/auth/AnimatedBackground";

const LegalPages = () => {
  const [activeTab, setActiveTab] = useState("terms");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: ""
  });
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  // قراءة معلمة tab من عنوان URL عند تحميل الصفحة
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const tabParam = searchParams.get("tab");
    if (tabParam && ["terms", "privacy", "contact"].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [location]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "تم إرسال رسالتك بنجاح",
      description: "سنقوم بالرد عليك في أقرب وقت ممكن.",
    });
    setFormData({
      name: "",
      email: "",
      message: ""
    });
  };

  // تغيير عنوان URL عند تغيير التبويب النشط
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    navigate(`/legal?tab=${value}`, { replace: true });
  };

  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen w-full overflow-hidden relative flex items-center justify-center">
      {/* خلفية متحركة مثل صفحة تسجيل الدخول */}
      <AnimatedBackground />
      
      {/* تأثيرات نيون إضافية في الخلفية */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/30 blur-[100px] rounded-full"></div>
      <div className="absolute bottom-1/3 right-1/3 w-96 h-96 bg-primary/20 blur-[120px] rounded-full"></div>
      
      {/* البطاقة الرئيسية */}
      <motion.div
        className="auth-container z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <motion.div 
          className="auth-card backdrop-blur-xl bg-white/10 dark:bg-black/10 border border-white/20 dark:border-white/10 min-w-[350px] max-w-3xl w-[90%] mx-auto"
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          whileHover={{ boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)" }}
        >
          {/* زر العودة للصفحة الرئيسية */}
          <div className="flex justify-end mb-4">
            <Button
              variant="outline"
              onClick={() => navigate("/")}
              className="text-gray-600 backdrop-blur-sm bg-white/20 border border-white/30"
            >
              العودة للرئيسية
            </Button>
          </div>
          
          <h2 className="auth-title mb-6">معلومات المنصة</h2>

          {/* أزرار التبديل الثلاثية الأبعاد */}
          <Tabs 
            defaultValue="terms" 
            className="w-full" 
            value={activeTab}
            onValueChange={handleTabChange}
          >
            <div className="relative w-full mb-8 perspective-1000">
              <TabsList className="w-full h-14 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl overflow-hidden">
                {["terms", "privacy", "contact"].map((tab) => (
                  <TabsTrigger
                    key={tab}
                    value={tab}
                    className={`tab-3d relative w-1/3 h-full text-lg font-medium transition-all duration-300 z-10 ${
                      activeTab === tab 
                        ? "text-white active" 
                        : "text-gray-400 hover:text-gray-200"
                    }`}
                  >
                    {/* زر ثلاثي الأبعاد مع تأثيرات */}
                    {activeTab === tab && (
                      <motion.div
                        className="absolute inset-0 bg-primary/80 rounded-lg"
                        layoutId="activeTab"
                        initial={false}
                        transition={{
                          type: "spring",
                          stiffness: 500,
                          damping: 30
                        }}
                        style={{
                          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.15)",
                          transform: "translateZ(10px)"
                        }}
                      />
                    )}
                    <span className="relative z-10">
                      {tab === "terms" && "الشروط والأحكام"}
                      {tab === "privacy" && "سياسة الخصوصية"}
                      {tab === "contact" && "اتصل بنا"}
                    </span>
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            {/* محتوى التبويبات */}
            <div className="max-h-[70vh] overflow-y-auto custom-scrollbar px-2">
              <AnimatePresence mode="wait">
                <TabsContent 
                  value="terms" 
                  className="mt-0 focus-visible:outline-none focus-visible:ring-0"
                >
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4 text-right p-4"
                  >
                    <h2 className="text-xl font-semibold mb-3">1. مقدمة</h2>
                    <p className="mb-4 text-gray-300 text-sm">
                      مرحبًا بك في منصة متجرك الرقمي. باستخدامك لخدماتنا، فإنك توافق على الالتزام بهذه الشروط والأحكام. يرجى قراءتها بعناية.
                    </p>

                    <h2 className="text-xl font-semibold mb-3">2. استخدام الخدمة</h2>
                    <p className="mb-4 text-gray-300 text-sm">
                      تتيح لك منصتنا إنشاء وإدارة متجر رقمي خاص بك باستخدام تقنية رمز QR. يجب استخدام الخدمة وفقًا للقوانين المعمول بها وبطريقة لا تنتهك حقوق الآخرين.
                    </p>

                    <h2 className="text-xl font-semibold mb-3">3. الحسابات</h2>
                    <p className="mb-4 text-gray-300 text-sm">
                      عند إنشاء حساب، يجب عليك تقديم معلومات دقيقة وكاملة. أنت مسؤول عن الحفاظ على سرية كلمة المرور الخاصة بك وعن جميع الأنشطة التي تحدث تحت حسابك.
                    </p>

                    <h2 className="text-xl font-semibold mb-3">4. المحتوى</h2>
                    <p className="mb-4 text-gray-300 text-sm">
                      أنت تحتفظ بجميع حقوق الملكية للمحتوى الذي تقوم بتحميله إلى المنصة. ومع ذلك، فإنك تمنحنا ترخيصًا عالميًا لاستخدام هذا المحتوى فيما يتعلق بخدماتنا.
                    </p>

                    <h2 className="text-xl font-semibold mb-3">5. الإلغاء والإنهاء</h2>
                    <p className="mb-4 text-gray-300 text-sm">
                      يمكنك إلغاء اشتراكك في أي وقت. نحتفظ بالحق في إنهاء أو تعليق حسابك في حالة انتهاك هذه الشروط.
                    </p>

                    <h2 className="text-xl font-semibold mb-3">6. التغييرات في الشروط</h2>
                    <p className="mb-4 text-gray-300 text-sm">
                      قد نقوم بتحديث هذه الشروط من وقت لآخر. سنخطرك بأي تغييرات جوهرية عبر البريد الإلكتروني أو من خلال إشعار بارز على موقعنا.
                    </p>
                  </motion.div>
                </TabsContent>

                <TabsContent 
                  value="privacy" 
                  className="mt-0 focus-visible:outline-none focus-visible:ring-0"
                >
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4 text-right p-4"
                  >
                    <h2 className="text-xl font-semibold mb-3">1. جمع المعلومات</h2>
                    <p className="mb-4 text-gray-300 text-sm">
                      نحن نجمع معلومات عندما تسجل في موقعنا، تقوم بإنشاء متجر، أو تستخدم خدماتنا. المعلومات المجمعة تشمل اسمك، عنوان بريدك الإلكتروني، رقم الهاتف، وبيانات متجرك.
                    </p>

                    <h2 className="text-xl font-semibold mb-3">2. استخدام المعلومات</h2>
                    <p className="mb-4 text-gray-300 text-sm">
                      أي معلومات نجمعها منك قد تستخدم لتخصيص تجربتك، تحسين موقعنا، تحسين خدمة العملاء، معالجة المعاملات، وإرسال رسائل بريد إلكتروني دورية.
                    </p>

                    <h2 className="text-xl font-semibold mb-3">3. حماية المعلومات</h2>
                    <p className="mb-4 text-gray-300 text-sm">
                      نحن نستخدم مجموعة متنوعة من إجراءات الأمان للحفاظ على سلامة معلوماتك الشخصية. نحن نستخدم تقنيات التشفير المتقدمة لحماية المعلومات الحساسة المرسلة عبر الإنترنت.
                    </p>

                    <h2 className="text-xl font-semibold mb-3">4. ملفات تعريف الارتباط</h2>
                    <p className="mb-4 text-gray-300 text-sm">
                      نحن نستخدم ملفات تعريف الارتباط لفهم وحفظ تفضيلاتك لزيارات مستقبلية، وتجميع بيانات مجمعة حول حركة الموقع والتفاعل حتى نتمكن من تقديم تجارب وأدوات موقع أفضل في المستقبل.
                    </p>

                    <h2 className="text-xl font-semibold mb-3">5. الإفصاح لأطراف ثالثة</h2>
                    <p className="mb-4 text-gray-300 text-sm">
                      نحن لا نبيع أو نتاجر أو ننقل معلوماتك الشخصية إلى أطراف خارجية. هذا لا يشمل الأطراف الثالثة الموثوقة التي تساعدنا في تشغيل موقعنا، إدارة أعمالنا، أو خدمتك، طالما أن تلك الأطراف توافق على الحفاظ على سرية هذه المعلومات.
                    </p>
                  </motion.div>
                </TabsContent>

                <TabsContent 
                  value="contact" 
                  className="mt-0 focus-visible:outline-none focus-visible:ring-0"
                >
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="p-4"
                  >
                    <form onSubmit={handleSubmit} className="space-y-4 text-right">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-200 mb-1">
                          الاسم
                        </label>
                        <Input
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          className="w-full bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                          placeholder="أدخل اسمك الكامل"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-200 mb-1">
                          البريد الإلكتروني
                        </label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          className="w-full bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                          placeholder="أدخل بريدك الإلكتروني"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="message" className="block text-sm font-medium text-gray-200 mb-1">
                          الرسالة
                        </label>
                        <Textarea
                          id="message"
                          name="message"
                          value={formData.message}
                          onChange={handleChange}
                          required
                          className="w-full min-h-[120px] bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                          placeholder="أدخل رسالتك هنا..."
                        />
                      </div>
                      
                      <motion.div
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                      >
                        <Button 
                          type="submit" 
                          className="w-full bg-primary hover:bg-primary/80 text-white py-2"
                        >
                          إرسال الرسالة
                        </Button>
                      </motion.div>
                    </form>
                  </motion.div>
                </TabsContent>
              </AnimatePresence>
            </div>
          </Tabs>
          
          <div className="mt-8 text-center text-gray-400 text-sm">
            &copy; {currentYear} متجرك الرقمي. جميع الحقوق محفوظة.
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default LegalPages;
