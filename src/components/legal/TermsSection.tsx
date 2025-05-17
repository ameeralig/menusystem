
import { motion } from "framer-motion";

const TermsSection = () => {
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
      className="bg-white rounded-lg shadow-lg overflow-hidden"
    >
      {/* عنوان القسم */}
      <div className="p-2 sm:p-3 bg-gradient-to-l from-primary/90 to-primary text-white text-center">
        <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold">الشروط والأحكام</h2>
      </div>

      {/* المحتوى */}
      <div className="p-2.5 sm:p-3 md:p-4 lg:p-6 space-y-2.5 sm:space-y-3 md:space-y-4 text-right">
        <div className="space-y-1 sm:space-y-1.5">
          <h3 className="text-sm sm:text-base md:text-lg font-bold text-gray-800">1. مقدمة</h3>
          <p className="text-xs sm:text-sm text-gray-800 leading-relaxed">
            مرحبًا بك في منصة متجرك الرقمي. باستخدامك لخدماتنا، فإنك توافق على الالتزام بهذه الشروط والأحكام. يرجى قراءتها بعناية.
          </p>
        </div>

        <div className="space-y-1 sm:space-y-1.5">
          <h3 className="text-sm sm:text-base md:text-lg font-bold text-gray-800">2. استخدام الخدمة</h3>
          <p className="text-xs sm:text-sm text-gray-800 leading-relaxed">
            تتيح لك منصتنا إنشاء وإدارة متجر رقمي خاص بك باستخدام تقنية رمز QR. يجب استخدام الخدمة وفقًا للقوانين المعمول بها وبطريقة لا تنتهك حقوق الآخرين.
          </p>
        </div>

        <div className="space-y-1 sm:space-y-1.5">
          <h3 className="text-sm sm:text-base md:text-lg font-bold text-gray-800">3. الحسابات</h3>
          <p className="text-xs sm:text-sm text-gray-800 leading-relaxed">
            عند إنشاء حساب، يجب عليك تقديم معلومات دقيقة وكاملة. أنت مسؤول عن الحفاظ على سرية كلمة المرور الخاصة بك وعن جميع الأنشطة التي تحدث تحت حسابك.
          </p>
        </div>

        <div className="space-y-1 sm:space-y-1.5">
          <h3 className="text-sm sm:text-base md:text-lg font-bold text-gray-800">4. المحتوى</h3>
          <p className="text-xs sm:text-sm text-gray-800 leading-relaxed">
            أنت تحتفظ بجميع حقوق الملكية للمحتوى الذي تقوم بتحميله إلى المنصة. ومع ذلك، فإنك تمنحنا ترخيصًا عالميًا لاستخدام هذا المحتوى فيما يتعلق بخدماتنا.
          </p>
        </div>

        <div className="space-y-1 sm:space-y-1.5">
          <h3 className="text-sm sm:text-base md:text-lg font-bold text-gray-800">5. الإلغاء والإنهاء</h3>
          <p className="text-xs sm:text-sm text-gray-800 leading-relaxed">
            يمكنك إلغاء اشتراكك في أي وقت. نحتفظ بالحق في إنهاء أو تعليق حسابك في حالة انتهاك هذه الشروط.
          </p>
        </div>

        <div className="space-y-1 sm:space-y-1.5">
          <h3 className="text-sm sm:text-base md:text-lg font-bold text-gray-800">6. التغييرات في الشروط</h3>
          <p className="text-xs sm:text-sm text-gray-800 leading-relaxed">
            قد نقوم بتحديث هذه الشروط من وقت لآخر. سنخطرك بأي تغييرات جوهرية عبر البريد الإلكتروني أو من خلال إشعار بارز على موقعنا.
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default TermsSection;
