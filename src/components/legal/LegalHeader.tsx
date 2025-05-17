
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
          className="text-gray-800 flex items-center gap-2 bg-white/90 border border-gray-200 hover:bg-white shadow-sm"
        >
          <span>العودة للرئيسية</span>
          <ArrowRight className="size-4 rtl:rotate-180" />
        </Button>
      </div>
      
      {/* عنوان الصفحة */}
      <div className="text-center mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          معلومات المنصة
        </h1>
        <p className="text-gray-600 mt-2">
          كل ما تحتاج معرفته حول استخدام منصة متجرك الرقمي
        </p>
      </div>
    </div>
  );
};

export default LegalHeader;
