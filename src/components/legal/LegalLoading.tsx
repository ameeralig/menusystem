
import { Loader2 } from "lucide-react";

/**
 * مكون عرض حالة التحميل
 */
const LegalLoading = () => {
  return (
    <div className="flex justify-center items-center py-12 w-full">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-8 w-8 text-gray-800 animate-spin" />
        <p className="text-gray-800 font-medium">جاري التحميل...</p>
      </div>
    </div>
  );
};

export default LegalLoading;
