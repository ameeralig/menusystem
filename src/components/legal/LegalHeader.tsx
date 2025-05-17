
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
    <div className="w-full">
      {/* زر العودة للصفحة الرئيسية */}
      <div className="w-full flex justify-end mb-3 sm:mb-4">
        <Button
          variant="outline"
          onClick={() => navigate("/")}
          className="text-gray-800 flex items-center gap-1 bg-white/90 border border-gray-200 hover:bg-white shadow-sm 
                     text-xs sm:text-sm px-2.5 py-1 sm:px-3 sm:py-1.5 md:px-4 md:py-2"
        >
          <span>العودة للرئيسية</span>
          <ArrowRight className="size-3 sm:size-3.5 rtl:rotate-180" />
        </Button>
      </div>
      
      {/* عنوان الصفحة */}
      <div className="text-center mb-5 sm:mb-6">
        <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-900">
          معلومات المنصة
        </h1>
        <p className="text-xs sm:text-sm md:text-base text-gray-600 mt-1 sm:mt-2 px-2 sm:px-4">
          كل ما تحتاج معرفته حول استخدام منصة متجرك الرقمي
        </p>
      </div>
    </div>
  );
};

export default LegalHeader;
