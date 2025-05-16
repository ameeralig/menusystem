
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { AnimatedBackground } from "@/components/auth/AnimatedBackground";
import { FileText, Shield, Mail, Send } from "lucide-react";

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

  // تكوينات الأزرار وتأثيراتها
  const tabButtons = [
    { 
      id: "terms", 
      label: "الشروط والأحكام", 
      icon: <FileText className="mb-1 size-5" />
    },
    { 
      id: "privacy", 
      label: "سياسة الخصوصية", 
      icon: <Shield className="mb-1 size-5" />
    },
    { 
      id: "contact", 
      label: "اتصل بنا", 
      icon: <Mail className="mb-1 size-5" />
    }
  ];

  // تكوين تأثيرات الانتقال
  const contentVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
  };

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
          
          <h2 className="text-3xl font-bold text-white mb-8 text-center" style={{ textShadow: "0 0 15px rgba(255, 255, 255, 0.5)" }}>
            معلومات المنصة
          </h2>

          {/* أزرار التنقل ثلاثية الأبعاد */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
            {tabButtons.map((button) => (
              <motion.button
                key={button.id}
                onClick={() => handleTabChange(button.id)}
                className={`relative flex flex-col items-center justify-center p-6 rounded-xl overflow-hidden transition-all duration-300 ${
                  activeTab === button.id
                    ? "text-white shadow-lg"
                    : "text-white/80 hover:text-white"
                }`}
                whileHover={{ 
                  scale: 1.05, 
                  boxShadow: "0 10px 25px rgba(0, 0, 0, 0.2)" 
                }}
                whileTap={{ scale: 0.98 }}
                style={{
                  transformStyle: "preserve-3d",
                  transform: activeTab === button.id ? "translateY(-5px)" : "none",
                  textShadow: activeTab === button.id ? "0 0 10px rgba(255, 255, 255, 0.5)" : "none"
                }}
              >
                {/* خلفية الزر */}
                <motion.div 
                  className="absolute inset-0 rounded-xl z-0"
                  animate={{
                    background: activeTab === button.id 
                      ? "linear-gradient(135deg, rgba(255,145,120,0.9), rgba(255,99,55,0.8))" 
                      : "rgba(255, 255, 255, 0.1)"
                  }}
                  transition={{ duration: 0.3 }}
                  style={{ backdropFilter: "blur(8px)" }}
                />
                
                {/* أيقونة وعنوان الزر */}
                <div className="relative z-10 flex flex-col items-center">
                  {button.icon}
                  <span className="mt-2 font-semibold text-lg">{button.label}</span>
                </div>
                
                {/* تأثير الضوء عند التحويم */}
                <motion.div
                  className="absolute inset-0 bg-white/20 z-0 opacity-0 rounded-xl"
                  whileHover={{ opacity: 0.15 }}
                  transition={{ duration: 0.2 }}
                />
              </motion.button>
            ))}
          </div>

          {/* محتوى التبويبات مع تحسين الخطوط والتباعد */}
          <div className="max-h-[60vh] overflow-y-auto custom-scrollbar px-2">
            <AnimatePresence mode="wait">
              {activeTab === "terms" && (
                <motion.div
                  key="terms-content"
                  variants={contentVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  className="space-y-6 text-right p-6 bg-white/5 backdrop-blur-sm rounded-xl"
                >
                  <h2 className="text-2xl font-bold mb-4 text-white" style={{ textShadow: "0 0 10px rgba(255, 255, 255, 0.3)" }}>
                    الشروط والأحكام
                  </h2>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-bold mb-3 text-white" style={{ textShadow: "0 0 8px rgba(255, 255, 255, 0.3)" }}>
                        1. مقدمة
                      </h3>
                      <p className="mb-4 text-white text-lg leading-relaxed">
                        مرحبًا بك في منصة متجرك الرقمي. باستخدامك لخدماتنا، فإنك توافق على الالتزام بهذه الشروط والأحكام. يرجى قراءتها بعناية.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-xl font-bold mb-3 text-white" style={{ textShadow: "0 0 8px rgba(255, 255, 255, 0.3)" }}>
                        2. استخدام الخدمة
                      </h3>
                      <p className="mb-4 text-white text-lg leading-relaxed">
                        تتيح لك منصتنا إنشاء وإدارة متجر رقمي خاص بك باستخدام تقنية رمز QR. يجب استخدام الخدمة وفقًا للقوانين المعمول بها وبطريقة لا تنتهك حقوق الآخرين.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-xl font-bold mb-3 text-white" style={{ textShadow: "0 0 8px rgba(255, 255, 255, 0.3)" }}>
                        3. الحسابات
                      </h3>
                      <p className="mb-4 text-white text-lg leading-relaxed">
                        عند إنشاء حساب، يجب عليك تقديم معلومات دقيقة وكاملة. أنت مسؤول عن الحفاظ على سرية كلمة المرور الخاصة بك وعن جميع الأنشطة التي تحدث تحت حسابك.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-xl font-bold mb-3 text-white" style={{ textShadow: "0 0 8px rgba(255, 255, 255, 0.3)" }}>
                        4. المحتوى
                      </h3>
                      <p className="mb-4 text-white text-lg leading-relaxed">
                        أنت تحتفظ بجميع حقوق الملكية للمحتوى الذي تقوم بتحميله إلى المنصة. ومع ذلك، فإنك تمنحنا ترخيصًا عالميًا لاستخدام هذا المحتوى فيما يتعلق بخدماتنا.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-xl font-bold mb-3 text-white" style={{ textShadow: "0 0 8px rgba(255, 255, 255, 0.3)" }}>
                        5. الإلغاء والإنهاء
                      </h3>
                      <p className="mb-4 text-white text-lg leading-relaxed">
                        يمكنك إلغاء اشتراكك في أي وقت. نحتفظ بالحق في إنهاء أو تعليق حسابك في حالة انتهاك هذه الشروط.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-xl font-bold mb-3 text-white" style={{ textShadow: "0 0 8px rgba(255, 255, 255, 0.3)" }}>
                        6. التغييرات في الشروط
                      </h3>
                      <p className="mb-4 text-white text-lg leading-relaxed">
                        قد نقوم بتحديث هذه الشروط من وقت لآخر. سنخطرك بأي تغييرات جوهرية عبر البريد الإلكتروني أو من خلال إشعار بارز على موقعنا.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === "privacy" && (
                <motion.div
                  key="privacy-content"
                  variants={contentVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  className="space-y-6 text-right p-6 bg-white/5 backdrop-blur-sm rounded-xl"
                >
                  <h2 className="text-2xl font-bold mb-4 text-white" style={{ textShadow: "0 0 10px rgba(255, 255, 255, 0.3)" }}>
                    سياسة الخصوصية
                  </h2>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-bold mb-3 text-white" style={{ textShadow: "0 0 8px rgba(255, 255, 255, 0.3)" }}>
                        1. جمع المعلومات
                      </h3>
                      <p className="mb-4 text-white text-lg leading-relaxed">
                        نحن نجمع معلومات عندما تسجل في موقعنا، تقوم بإنشاء متجر، أو تستخدم خدماتنا. المعلومات المجمعة تشمل اسمك، عنوان بريدك الإلكتروني، رقم الهاتف، وبيانات متجرك.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-xl font-bold mb-3 text-white" style={{ textShadow: "0 0 8px rgba(255, 255, 255, 0.3)" }}>
                        2. استخدام المعلومات
                      </h3>
                      <p className="mb-4 text-white text-lg leading-relaxed">
                        أي معلومات نجمعها منك قد تستخدم لتخصيص تجربتك، تحسين موقعنا، تحسين خدمة العملاء، معالجة المعاملات، وإرسال رسائل بريد إلكتروني دورية.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-xl font-bold mb-3 text-white" style={{ textShadow: "0 0 8px rgba(255, 255, 255, 0.3)" }}>
                        3. حماية المعلومات
                      </h3>
                      <p className="mb-4 text-white text-lg leading-relaxed">
                        نحن نستخدم مجموعة متنوعة من إجراءات الأمان للحفاظ على سلامة معلوماتك الشخصية. نحن نستخدم تقنيات التشفير المتقدمة لحماية المعلومات الحساسة المرسلة عبر الإنترنت.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-xl font-bold mb-3 text-white" style={{ textShadow: "0 0 8px rgba(255, 255, 255, 0.3)" }}>
                        4. ملفات تعريف الارتباط
                      </h3>
                      <p className="mb-4 text-white text-lg leading-relaxed">
                        نحن نستخدم ملفات تعريف الارتباط لفهم وحفظ تفضيلاتك لزيارات مستقبلية، وتجميع بيانات مجمعة حول حركة الموقع والتفاعل حتى نتمكن من تقديم تجارب وأدوات موقع أفضل في المستقبل.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-xl font-bold mb-3 text-white" style={{ textShadow: "0 0 8px rgba(255, 255, 255, 0.3)" }}>
                        5. الإفصاح لأطراف ثالثة
                      </h3>
                      <p className="mb-4 text-white text-lg leading-relaxed">
                        نحن لا نبيع أو نتاجر أو ننقل معلوماتك الشخصية إلى أطراف خارجية. هذا لا يشمل الأطراف الثالثة الموثوقة التي تساعدنا في تشغيل موقعنا، إدارة أعمالنا، أو خدمتك، طالما أن تلك الأطراف توافق على الحفاظ على سرية هذه المعلومات.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === "contact" && (
                <motion.div
                  key="contact-content"
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
                  
                  <form onSubmit={handleSubmit} className="space-y-6 text-right">
                    <div className="space-y-2">
                      <label htmlFor="name" className="block text-lg font-medium text-white mb-2" style={{ textShadow: "0 0 5px rgba(255, 255, 255, 0.3)" }}>
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
                    
                    <div className="space-y-2">
                      <label htmlFor="email" className="block text-lg font-medium text-white mb-2" style={{ textShadow: "0 0 5px rgba(255, 255, 255, 0.3)" }}>
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
                    
                    <div className="space-y-2">
                      <label htmlFor="message" className="block text-lg font-medium text-white mb-2" style={{ textShadow: "0 0 5px rgba(255, 255, 255, 0.3)" }}>
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
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          <div className="mt-8 text-center text-white text-base">
            &copy; {currentYear} متجرك الرقمي. جميع الحقوق محفوظة.
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default LegalPages;
