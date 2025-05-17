
import { Loader2 } from "lucide-react";

/**
 * مكون عرض حالة التحميل
 */
const LegalLoading = () => {
  return (
    <div className="flex justify-center items-center py-8 sm:py-10 md:py-12 w-full">
      <div className="flex flex-col items-center gap-2 sm:gap-3">
        <Loader2 className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-gray-700 animate-spin" />
        <p className="text-xs sm:text-sm md:text-base text-gray-700 font-medium">جاري التحميل...</p>
      </div>
    </div>
  );
};

export default LegalLoading;
