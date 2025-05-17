
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";

/**
 * مكون يعرض عنوان الصفحة وزر العودة للرئيسية
 * محسن للتجاوب مع جميع أحجام الشاشات
 */
const LegalHeader = () => {
  const navigate = useNavigate();
  
  return (
    <div className="w-full px-2 sm:px-4">
      {/* زر العودة للصفحة الرئيسية - تم تحسين التباعد والحجم */}
      <div className="w-full flex justify-end mb-4 sm:mb-5">
        <Button
          variant="outline"
          onClick={() => navigate("/")}
          className="text-gray-800 flex items-center gap-1.5 bg-white/90 border border-gray-200 hover:bg-white shadow-sm 
                     text-xs sm:text-sm px-3 py-1.5 sm:px-3.5 sm:py-2 md:px-4 md:py-2 transition-all duration-300"
        >
          <span>العودة للرئيسية</span>
          <ArrowRight className="size-3 sm:size-3.5 rtl:rotate-180" />
        </Button>
      </div>
      
      {/* عنوان الصفحة - تم تحسين التباعد */}
      <div className="text-center mb-6 sm:mb-7 md:mb-8">
        <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
          معلومات المنصة
        </h1>
        <p className="text-xs sm:text-sm md:text-base text-gray-600 mt-1 sm:mt-1.5 px-4 sm:px-6 max-w-xl mx-auto">
          كل ما تحتاج معرفته حول استخدام منصة متجرك الرقمي
        </p>
      </div>
    </div>
  );
};

export default LegalHeader;
