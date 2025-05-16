
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

  // تغيير عنوان URL عند تغيير التبويب النشط بدون إعادة تحميل الصفحة
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    // استخدام replace: true لتجنب إضافة إدخالات متعددة في تاريخ التصفح
    navigate(`/legal?tab=${value}`, { replace: true });
  };

  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen w-full overflow-hidden relative flex items-center justify-center">
      {/* خلفية متحركة */}
      <AnimatedBackground />
      
      {/* تأثيرات النيون في الخلفية */}
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
              className="text-white backdrop-blur-sm bg-white/10 border border-white/20 hover:bg-white/20 font-medium text-base"
            >
              العودة للرئيسية
            </Button>
          </div>
          
          <h2 className="text-3xl font-bold text-white mb-6 text-center">معلومات المنصة</h2>

          {/* نظام التبويبات المحسن مع تصميم ثلاثي الأبعاد */}
          <Tabs 
            defaultValue="terms" 
            className="w-full" 
            value={activeTab}
            onValueChange={handleTabChange}
          >
            <div className="relative w-full mb-8">
              <TabsList className="w-full h-16 bg-white/20 backdrop-blur-md border border-white/30 rounded-xl overflow-hidden">
                {[
                  { value: "terms", label: "الشروط والأحكام" },
                  { value: "privacy", label: "سياسة الخصوصية" },
                  { value: "contact", label: "اتصل بنا" }
                ].map((tab) => (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className={`relative w-1/3 h-full text-lg font-bold transition-all duration-300 z-10 ${
                      activeTab === tab.value 
                        ? "text-white" 
                        : "text-white/70 hover:text-white"
                    }`}
                    style={{
                      textShadow: activeTab === tab.value ? '0 0 10px rgba(255, 255, 255, 0.5)' : 'none'
                    }}
                  >
                    {activeTab === tab.value && (
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-primary/90 to-primary/70 rounded-lg"
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
                    <span className="relative z-10">{tab.label}</span>
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            {/* محتوى التبويبات مع تحسين الخطوط والتباعد */}
            <div className="max-h-[70vh] overflow-y-auto custom-scrollbar px-2">
              <AnimatePresence mode="wait">
                <TabsContent 
                  key={activeTab === "terms" ? "terms-content" : "terms-hidden"}
                  value="terms" 
                  className="mt-0 focus-visible:outline-none focus-visible:ring-0"
                >
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.4 }}
                    className="space-y-6 text-right p-6 bg-white/5 backdrop-blur-sm rounded-xl"
                  >
                    <h2 className="text-2xl font-bold mb-3 text-white">1. مقدمة</h2>
                    <p className="mb-4 text-white text-lg leading-relaxed">
                      مرحبًا بك في منصة متجرك الرقمي. باستخدامك لخدماتنا، فإنك توافق على الالتزام بهذه الشروط والأحكام. يرجى قراءتها بعناية.
                    </p>

                    <h2 className="text-2xl font-bold mb-3 text-white">2. استخدام الخدمة</h2>
                    <p className="mb-4 text-white text-lg leading-relaxed">
                      تتيح لك منصتنا إنشاء وإدارة متجر رقمي خاص بك باستخدام تقنية رمز QR. يجب استخدام الخدمة وفقًا للقوانين المعمول بها وبطريقة لا تنتهك حقوق الآخرين.
                    </p>

                    <h2 className="text-2xl font-bold mb-3 text-white">3. الحسابات</h2>
                    <p className="mb-4 text-white text-lg leading-relaxed">
                      عند إنشاء حساب، يجب عليك تقديم معلومات دقيقة وكاملة. أنت مسؤول عن الحفاظ على سرية كلمة المرور الخاصة بك وعن جميع الأنشطة التي تحدث تحت حسابك.
                    </p>

                    <h2 className="text-2xl font-bold mb-3 text-white">4. المحتوى</h2>
                    <p className="mb-4 text-white text-lg leading-relaxed">
                      أنت تحتفظ بجميع حقوق الملكية للمحتوى الذي تقوم بتحميله إلى المنصة. ومع ذلك، فإنك تمنحنا ترخيصًا عالميًا لاستخدام هذا المحتوى فيما يتعلق بخدماتنا.
                    </p>

                    <h2 className="text-2xl font-bold mb-3 text-white">5. الإلغاء والإنهاء</h2>
                    <p className="mb-4 text-white text-lg leading-relaxed">
                      يمكنك إلغاء اشتراكك في أي وقت. نحتفظ بالحق في إنهاء أو تعليق حسابك في حالة انتهاك هذه الشروط.
                    </p>

                    <h2 className="text-2xl font-bold mb-3 text-white">6. التغييرات في الشروط</h2>
                    <p className="mb-4 text-white text-lg leading-relaxed">
                      قد نقوم بتحديث هذه الشروط من وقت لآخر. سنخطرك بأي تغييرات جوهرية عبر البريد الإلكتروني أو من خلال إشعار بارز على موقعنا.
                    </p>
                  </motion.div>
                </TabsContent>

                <TabsContent 
                  key={activeTab === "privacy" ? "privacy-content" : "privacy-hidden"}
                  value="privacy" 
                  className="mt-0 focus-visible:outline-none focus-visible:ring-0"
                >
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.4 }}
                    className="space-y-6 text-right p-6 bg-white/5 backdrop-blur-sm rounded-xl"
                  >
                    <h2 className="text-2xl font-bold mb-3 text-white">1. جمع المعلومات</h2>
                    <p className="mb-4 text-white text-lg leading-relaxed">
                      نحن نجمع معلومات عندما تسجل في موقعنا، تقوم بإنشاء متجر، أو تستخدم خدماتنا. المعلومات المجمعة تشمل اسمك، عنوان بريدك الإلكتروني، رقم الهاتف، وبيانات متجرك.
                    </p>

                    <h2 className="text-2xl font-bold mb-3 text-white">2. استخدام المعلومات</h2>
                    <p className="mb-4 text-white text-lg leading-relaxed">
                      أي معلومات نجمعها منك قد تستخدم لتخصيص تجربتك، تحسين موقعنا، تحسين خدمة العملاء، معالجة المعاملات، وإرسال رسائل بريد إلكتروني دورية.
                    </p>

                    <h2 className="text-2xl font-bold mb-3 text-white">3. حماية المعلومات</h2>
                    <p className="mb-4 text-white text-lg leading-relaxed">
                      نحن نستخدم مجموعة متنوعة من إجراءات الأمان للحفاظ على سلامة معلوماتك الشخصية. نحن نستخدم تقنيات التشفير المتقدمة لحماية المعلومات الحساسة المرسلة عبر الإنترنت.
                    </p>

                    <h2 className="text-2xl font-bold mb-3 text-white">4. ملفات تعريف الارتباط</h2>
                    <p className="mb-4 text-white text-lg leading-relaxed">
                      نحن نستخدم ملفات تعريف الارتباط لفهم وحفظ تفضيلاتك لزيارات مستقبلية، وتجميع بيانات مجمعة حول حركة الموقع والتفاعل حتى نتمكن من تقديم تجارب وأدوات موقع أفضل في المستقبل.
                    </p>

                    <h2 className="text-2xl font-bold mb-3 text-white">5. الإفصاح لأطراف ثالثة</h2>
                    <p className="mb-4 text-white text-lg leading-relaxed">
                      نحن لا نبيع أو نتاجر أو ننقل معلوماتك الشخصية إلى أطراف خارجية. هذا لا يشمل الأطراف الثالثة الموثوقة التي تساعدنا في تشغيل موقعنا، إدارة أعمالنا، أو خدمتك، طالما أن تلك الأطراف توافق على الحفاظ على سرية هذه المعلومات.
                    </p>
                  </motion.div>
                </TabsContent>

                <TabsContent 
                  key={activeTab === "contact" ? "contact-content" : "contact-hidden"}
                  value="contact" 
                  className="mt-0 focus-visible:outline-none focus-visible:ring-0"
                >
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.4 }}
                    className="p-6 bg-white/5 backdrop-blur-sm rounded-xl"
                  >
                    <form onSubmit={handleSubmit} className="space-y-5 text-right">
                      <div>
                        <label htmlFor="name" className="block text-lg font-medium text-white mb-2">
                          الاسم
                        </label>
                        <Input
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          className="w-full bg-white/10 border-white/20 text-white text-lg placeholder:text-white/50 h-12 rounded-lg"
                          placeholder="أدخل اسمك الكامل"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="email" className="block text-lg font-medium text-white mb-2">
                          البريد الإلكتروني
                        </label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          className="w-full bg-white/10 border-white/20 text-white text-lg placeholder:text-white/50 h-12 rounded-lg"
                          placeholder="أدخل بريدك الإلكتروني"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="message" className="block text-lg font-medium text-white mb-2">
                          الرسالة
                        </label>
                        <Textarea
                          id="message"
                          name="message"
                          value={formData.message}
                          onChange={handleChange}
                          required
                          className="w-full min-h-[150px] bg-white/10 border-white/20 text-white text-lg placeholder:text-white/50 rounded-lg"
                          placeholder="أدخل رسالتك هنا..."
                        />
                      </div>
                      
                      <motion.div
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                      >
                        <Button 
                          type="submit" 
                          className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary text-white py-3 text-xl font-bold rounded-lg transition-all duration-300 shadow-md h-14"
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
          
          <div className="mt-8 text-center text-white text-base">
            &copy; {currentYear} متجرك الرقمي. جميع الحقوق محفوظة.
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default LegalPages;

