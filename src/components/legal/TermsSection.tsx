
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
      className="space-y-6 text-right p-6 bg-white/90 backdrop-blur-sm rounded-xl shadow-md"
    >
      <h2 className="text-2xl font-bold mb-4 text-gray-900">
        الشروط والأحكام
      </h2>
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-bold mb-3 text-gray-800">
            1. مقدمة
          </h3>
          <p className="mb-4 text-gray-700 text-lg leading-relaxed">
            مرحبًا بك في منصة متجرك الرقمي. باستخدامك لخدماتنا، فإنك توافق على الالتزام بهذه الشروط والأحكام. يرجى قراءتها بعناية.
          </p>
        </div>

        <div>
          <h3 className="text-xl font-bold mb-3 text-gray-800">
            2. استخدام الخدمة
          </h3>
          <p className="mb-4 text-gray-700 text-lg leading-relaxed">
            تتيح لك منصتنا إنشاء وإدارة متجر رقمي خاص بك باستخدام تقنية رمز QR. يجب استخدام الخدمة وفقًا للقوانين المعمول بها وبطريقة لا تنتهك حقوق الآخرين.
          </p>
        </div>

        <div>
          <h3 className="text-xl font-bold mb-3 text-gray-800">
            3. الحسابات
          </h3>
          <p className="mb-4 text-gray-700 text-lg leading-relaxed">
            عند إنشاء حساب، يجب عليك تقديم معلومات دقيقة وكاملة. أنت مسؤول عن الحفاظ على سرية كلمة المرور الخاصة بك وعن جميع الأنشطة التي تحدث تحت حسابك.
          </p>
        </div>

        <div>
          <h3 className="text-xl font-bold mb-3 text-gray-800">
            4. المحتوى
          </h3>
          <p className="mb-4 text-gray-700 text-lg leading-relaxed">
            أنت تحتفظ بجميع حقوق الملكية للمحتوى الذي تقوم بتحميله إلى المنصة. ومع ذلك، فإنك تمنحنا ترخيصًا عالميًا لاستخدام هذا المحتوى فيما يتعلق بخدماتنا.
          </p>
        </div>

        <div>
          <h3 className="text-xl font-bold mb-3 text-gray-800">
            5. الإلغاء والإنهاء
          </h3>
          <p className="mb-4 text-gray-700 text-lg leading-relaxed">
            يمكنك إلغاء اشتراكك في أي وقت. نحتفظ بالحق في إنهاء أو تعليق حسابك في حالة انتهاك هذه الشروط.
          </p>
        </div>

        <div>
          <h3 className="text-xl font-bold mb-3 text-gray-800">
            6. التغييرات في الشروط
          </h3>
          <p className="mb-4 text-gray-700 text-lg leading-relaxed">
            قد نقوم بتحديث هذه الشروط من وقت لآخر. سنخطرك بأي تغييرات جوهرية عبر البريد الإلكتروني أو من خلال إشعار بارز على موقعنا.
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default TermsSection;
