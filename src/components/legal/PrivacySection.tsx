
import { motion } from "framer-motion";

const PrivacySection = () => {
  // تكوين تأثيرات الانتقال
  const contentVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
  };

  return (
    <motion.div
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
  );
};

export default PrivacySection;
