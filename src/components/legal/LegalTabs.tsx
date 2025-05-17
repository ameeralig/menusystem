
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
    <TabsList className="grid w-full bg-transparent p-0 mb-8 gap-2 grid-cols-1 sm:grid-cols-3">
      {/* تبويب الشروط والأحكام */}
      <TabsTrigger
        value="terms"
        className={`flex items-center gap-2 p-3 sm:p-4 text-center rounded-lg transition-all duration-300 
          ${activeTab === "terms" 
            ? "bg-primary text-white shadow-md" 
            : "bg-white text-gray-800 border border-gray-200 hover:border-primary/50"}`}
      >
        <FileText className="size-4 sm:size-5" />
        <span className="font-medium">الشروط والأحكام</span>
      </TabsTrigger>
      
      {/* تبويب سياسة الخصوصية */}
      <TabsTrigger
        value="privacy"
        className={`flex items-center gap-2 p-3 sm:p-4 text-center rounded-lg transition-all duration-300 
          ${activeTab === "privacy" 
            ? "bg-primary text-white shadow-md" 
            : "bg-white text-gray-800 border border-gray-200 hover:border-primary/50"}`}
      >
        <Shield className="size-4 sm:size-5" />
        <span className="font-medium">سياسة الخصوصية</span>
      </TabsTrigger>
      
      {/* تبويب اتصل بنا */}
      <TabsTrigger
        value="contact"
        className={`flex items-center gap-2 p-3 sm:p-4 text-center rounded-lg transition-all duration-300 
          ${activeTab === "contact" 
            ? "bg-primary text-white shadow-md" 
            : "bg-white text-gray-800 border border-gray-200 hover:border-primary/50"}`}
      >
        <Mail className="size-4 sm:size-5" />
        <span className="font-medium">اتصل بنا</span>
      </TabsTrigger>
    </TabsList>
  );
};

export default LegalTabs;
