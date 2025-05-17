
import { Loader2 } from "lucide-react";

/**
 * مكون عرض حالة التحميل
 * محسن للتجاوب مع جميع أحجام الشاشات
 */
const LegalLoading = () => {
  return (
    <div className="flex justify-center items-center py-6 sm:py-8 md:py-10 w-full">
      <div className="flex flex-col items-center gap-1.5 sm:gap-2">
        <Loader2 className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 text-gray-700 animate-spin" />
        <p className="text-xs sm:text-sm text-gray-700 font-medium">جاري التحميل...</p>
      </div>
    </div>
  );
};

export default LegalLoading;
