
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Terms = () => {
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
        <h1 className="text-3xl font-bold text-center mb-8">الشروط والأحكام</h1>
        
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">1. مقدمة</h2>
          <p className="mb-6 text-gray-700">
            مرحبًا بك في منصة متجرك الرقمي. باستخدامك لخدماتنا، فإنك توافق على الالتزام بهذه الشروط والأحكام. يرجى قراءتها بعناية.
          </p>

          <h2 className="text-xl font-semibold mb-4">2. استخدام الخدمة</h2>
          <p className="mb-6 text-gray-700">
            تتيح لك منصتنا إنشاء وإدارة متجر رقمي خاص بك باستخدام تقنية رمز QR. يجب استخدام الخدمة وفقًا للقوانين المعمول بها وبطريقة لا تنتهك حقوق الآخرين.
          </p>

          <h2 className="text-xl font-semibold mb-4">3. الحسابات</h2>
          <p className="mb-6 text-gray-700">
            عند إنشاء حساب، يجب عليك تقديم معلومات دقيقة وكاملة. أنت مسؤول عن الحفاظ على سرية كلمة المرور الخاصة بك وعن جميع الأنشطة التي تحدث تحت حسابك.
          </p>

          <h2 className="text-xl font-semibold mb-4">4. المحتوى</h2>
          <p className="mb-6 text-gray-700">
            أنت تحتفظ بجميع حقوق الملكية للمحتوى الذي تقوم بتحميله إلى المنصة. ومع ذلك، فإنك تمنحنا ترخيصًا عالميًا لاستخدام هذا المحتوى فيما يتعلق بخدماتنا.
          </p>

          <h2 className="text-xl font-semibold mb-4">5. الإلغاء والإنهاء</h2>
          <p className="mb-6 text-gray-700">
            يمكنك إلغاء اشتراكك في أي وقت. نحتفظ بالحق في إنهاء أو تعليق حسابك في حالة انتهاك هذه الشروط.
          </p>

          <h2 className="text-xl font-semibold mb-4">6. التغييرات في الشروط</h2>
          <p className="mb-6 text-gray-700">
            قد نقوم بتحديث هذه الشروط من وقت لآخر. سنخطرك بأي تغييرات جوهرية عبر البريد الإلكتروني أو من خلال إشعار بارز على موقعنا.
          </p>

          <h2 className="text-xl font-semibold mb-4">7. الاتصال بنا</h2>
          <p className="text-gray-700">
            إذا كانت لديك أي أسئلة حول هذه الشروط، يرجى التواصل معنا عبر صفحة الاتصال.
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

export default Terms;
