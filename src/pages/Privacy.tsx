
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Privacy = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#fff0e8]">
      <header className="container mx-auto px-6 py-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-gray-800 relative">
              متجرك الرقمي
              <div className="absolute -bottom-1 left-0 w-full h-1 bg-[#ff9178]"></div>
            </h1>
          </div>
          
          <Button
            variant="outline"
            onClick={() => navigate("/")}
            className="text-gray-600"
          >
            العودة للرئيسية
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-center mb-8">سياسة الخصوصية</h1>
        
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">1. جمع المعلومات</h2>
          <p className="mb-6 text-gray-700">
            نحن نجمع معلومات عندما تسجل في موقعنا، تقوم بإنشاء متجر، أو تستخدم خدماتنا. المعلومات المجمعة تشمل اسمك، عنوان بريدك الإلكتروني، رقم الهاتف، وبيانات متجرك.
          </p>

          <h2 className="text-xl font-semibold mb-4">2. استخدام المعلومات</h2>
          <p className="mb-6 text-gray-700">
            أي معلومات نجمعها منك قد تستخدم لتخصيص تجربتك، تحسين موقعنا، تحسين خدمة العملاء، معالجة المعاملات، وإرسال رسائل بريد إلكتروني دورية.
          </p>

          <h2 className="text-xl font-semibold mb-4">3. حماية المعلومات</h2>
          <p className="mb-6 text-gray-700">
            نحن نستخدم مجموعة متنوعة من إجراءات الأمان للحفاظ على سلامة معلوماتك الشخصية. نحن نستخدم تقنيات التشفير المتقدمة لحماية المعلومات الحساسة المرسلة عبر الإنترنت.
          </p>

          <h2 className="text-xl font-semibold mb-4">4. ملفات تعريف الارتباط</h2>
          <p className="mb-6 text-gray-700">
            نحن نستخدم ملفات تعريف الارتباط لفهم وحفظ تفضيلاتك لزيارات مستقبلية، وتجميع بيانات مجمعة حول حركة الموقع والتفاعل حتى نتمكن من تقديم تجارب وأدوات موقع أفضل في المستقبل.
          </p>

          <h2 className="text-xl font-semibold mb-4">5. الإفصاح لأطراف ثالثة</h2>
          <p className="mb-6 text-gray-700">
            نحن لا نبيع أو نتاجر أو ننقل معلوماتك الشخصية إلى أطراف خارجية. هذا لا يشمل الأطراف الثالثة الموثوقة التي تساعدنا في تشغيل موقعنا، إدارة أعمالنا، أو خدمتك، طالما أن تلك الأطراف توافق على الحفاظ على سرية هذه المعلومات.
          </p>

          <h2 className="text-xl font-semibold mb-4">6. التغييرات في سياسة الخصوصية</h2>
          <p className="mb-6 text-gray-700">
            قد نقوم بتحديث سياسة الخصوصية من وقت لآخر. سنخطرك بأي تغييرات عن طريق نشر سياسة الخصوصية الجديدة على هذه الصفحة.
          </p>

          <h2 className="text-xl font-semibold mb-4">7. موافقتك</h2>
          <p className="text-gray-700">
            باستخدامك لموقعنا، فإنك توافق على سياسة الخصوصية الخاصة بنا.
          </p>
        </div>
      </div>

      <footer className="bg-white py-8 mt-16">
        <div className="container mx-auto px-6">
          <div className="mt-8 text-center text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} متجرك الرقمي. جميع الحقوق محفوظة.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Privacy;
