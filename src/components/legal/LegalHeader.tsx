
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";

/**
 * مكون يعرض عنوان الصفحة وزر العودة للرئيسية
 */
const LegalHeader = () => {
  const navigate = useNavigate();
  
  return (
    <div className="w-full">
      {/* زر العودة للصفحة الرئيسية */}
      <div className="w-full flex justify-end mb-4">
        <Button
          variant="outline"
          onClick={() => navigate("/")}
          className="text-gray-800 flex items-center gap-1 bg-white/90 border border-gray-200 hover:bg-white shadow-sm px-3 py-1 text-sm sm:px-4 sm:py-2 sm:text-base"
        >
          <span>العودة للرئيسية</span>
          <ArrowRight className="size-3.5 sm:size-4 rtl:rotate-180" />
        </Button>
      </div>
      
      {/* عنوان الصفحة */}
      <div className="text-center mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
          معلومات المنصة
        </h1>
        <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2 px-4">
          كل ما تحتاج معرفته حول استخدام منصة متجرك الرقمي
        </p>
      </div>
    </div>
  );
};

export default LegalHeader;
