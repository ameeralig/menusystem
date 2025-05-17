
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Shield, Mail } from "lucide-react";
import { FC } from "react";

interface LegalTabsProps {
  activeTab: string;
}

/**
 * مكون أزرار التبويب للأقسام القانونية
 * محسن للتجاوب مع جميع أحجام الشاشات
 */
const LegalTabs: FC<LegalTabsProps> = ({ activeTab }) => {
  return (
    <TabsList className="grid w-full bg-transparent p-0 mb-4 sm:mb-5 md:mb-6 gap-1.5 sm:gap-2 
                        grid-cols-1 sm:grid-cols-3">
      {/* تبويب الشروط والأحكام */}
      <TabsTrigger
        value="terms"
        className={`flex items-center justify-center gap-1 sm:gap-1.5 p-1.5 sm:p-2 md:p-3 rounded-lg transition-all duration-300 text-[10px] xs:text-xs sm:text-sm
          ${activeTab === "terms" 
            ? "bg-primary text-white shadow-md" 
            : "bg-white text-gray-800 border border-gray-200 hover:border-primary/50"}`}
      >
        <FileText className="size-3 sm:size-3.5 md:size-4" />
        <span className="font-medium">الشروط والأحكام</span>
      </TabsTrigger>
      
      {/* تبويب سياسة الخصوصية */}
      <TabsTrigger
        value="privacy"
        className={`flex items-center justify-center gap-1 sm:gap-1.5 p-1.5 sm:p-2 md:p-3 rounded-lg transition-all duration-300 text-[10px] xs:text-xs sm:text-sm
          ${activeTab === "privacy" 
            ? "bg-primary text-white shadow-md" 
            : "bg-white text-gray-800 border border-gray-200 hover:border-primary/50"}`}
      >
        <Shield className="size-3 sm:size-3.5 md:size-4" />
        <span className="font-medium">سياسة الخصوصية</span>
      </TabsTrigger>
      
      {/* تبويب اتصل بنا */}
      <TabsTrigger
        value="contact"
        className={`flex items-center justify-center gap-1 sm:gap-1.5 p-1.5 sm:p-2 md:p-3 rounded-lg transition-all duration-300 text-[10px] xs:text-xs sm:text-sm
          ${activeTab === "contact" 
            ? "bg-primary text-white shadow-md" 
            : "bg-white text-gray-800 border border-gray-200 hover:border-primary/50"}`}
      >
        <Mail className="size-3 sm:size-3.5 md:size-4" />
        <span className="font-medium">اتصل بنا</span>
      </TabsTrigger>
    </TabsList>
  );
};

export default LegalTabs;
