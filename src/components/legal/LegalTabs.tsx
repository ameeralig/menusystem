
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Shield, Mail } from "lucide-react";
import { FC } from "react";

interface LegalTabsProps {
  activeTab: string;
}

/**
 * مكون أزرار التبويب للأقسام القانونية
 */
const LegalTabs: FC<LegalTabsProps> = ({ activeTab }) => {
  return (
    <TabsList className="grid w-full bg-transparent p-0 mb-4 sm:mb-6 md:mb-8 gap-2 grid-cols-1 sm:grid-cols-3">
      {/* تبويب الشروط والأحكام */}
      <TabsTrigger
        value="terms"
        className={`flex items-center gap-1.5 sm:gap-2 p-2 sm:p-3 md:p-4 text-center rounded-lg transition-all duration-300 text-xs sm:text-sm md:text-base
          ${activeTab === "terms" 
            ? "bg-primary text-white shadow-md" 
            : "bg-white text-gray-800 border border-gray-200 hover:border-primary/50"}`}
      >
        <FileText className="size-3.5 sm:size-4 md:size-5" />
        <span className="font-medium">الشروط والأحكام</span>
      </TabsTrigger>
      
      {/* تبويب سياسة الخصوصية */}
      <TabsTrigger
        value="privacy"
        className={`flex items-center gap-1.5 sm:gap-2 p-2 sm:p-3 md:p-4 text-center rounded-lg transition-all duration-300 text-xs sm:text-sm md:text-base
          ${activeTab === "privacy" 
            ? "bg-primary text-white shadow-md" 
            : "bg-white text-gray-800 border border-gray-200 hover:border-primary/50"}`}
      >
        <Shield className="size-3.5 sm:size-4 md:size-5" />
        <span className="font-medium">سياسة الخصوصية</span>
      </TabsTrigger>
      
      {/* تبويب اتصل بنا */}
      <TabsTrigger
        value="contact"
        className={`flex items-center gap-1.5 sm:gap-2 p-2 sm:p-3 md:p-4 text-center rounded-lg transition-all duration-300 text-xs sm:text-sm md:text-base
          ${activeTab === "contact" 
            ? "bg-primary text-white shadow-md" 
            : "bg-white text-gray-800 border border-gray-200 hover:border-primary/50"}`}
      >
        <Mail className="size-3.5 sm:size-4 md:size-5" />
        <span className="font-medium">اتصل بنا</span>
      </TabsTrigger>
    </TabsList>
  );
};

export default LegalTabs;
