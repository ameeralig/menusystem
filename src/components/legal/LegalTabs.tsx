
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Shield, Mail } from "lucide-react";
import { FC } from "react";
import { motion } from "framer-motion";

interface LegalTabsProps {
  activeTab: string;
}

/**
 * مكون أزرار التبويب للأقسام القانونية
 * محسن للتجاوب مع جميع أحجام الشاشات مع إضافة تأثيرات حركية
 */
const LegalTabs: FC<LegalTabsProps> = ({ activeTab }) => {
  return (
    <TabsList className="grid w-full bg-transparent p-0 mb-4 sm:mb-5 md:mb-6 gap-2 sm:gap-3
                        grid-cols-1 sm:grid-cols-3">
      {/* تبويب الشروط والأحكام */}
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 300, damping: 15 }}
      >
        <TabsTrigger
          value="terms"
          className={`flex items-center justify-center gap-1.5 sm:gap-2 py-2 sm:py-2.5 md:py-3 rounded-lg transition-all duration-300 text-xs sm:text-sm w-full
            ${activeTab === "terms" 
              ? "bg-primary text-white shadow-md" 
              : "bg-white text-gray-800 border border-gray-200 hover:border-primary/50"}`}
        >
          <FileText className="size-3.5 sm:size-4 md:size-5" />
          <span className="font-medium">الشروط والأحكام</span>
        </TabsTrigger>
      </motion.div>
      
      {/* تبويب سياسة الخصوصية */}
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 300, damping: 15 }}
      >
        <TabsTrigger
          value="privacy"
          className={`flex items-center justify-center gap-1.5 sm:gap-2 py-2 sm:py-2.5 md:py-3 rounded-lg transition-all duration-300 text-xs sm:text-sm w-full
            ${activeTab === "privacy" 
              ? "bg-primary text-white shadow-md" 
              : "bg-white text-gray-800 border border-gray-200 hover:border-primary/50"}`}
        >
          <Shield className="size-3.5 sm:size-4 md:size-5" />
          <span className="font-medium">سياسة الخصوصية</span>
        </TabsTrigger>
      </motion.div>
      
      {/* تبويب اتصل بنا */}
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 300, damping: 15 }}
      >
        <TabsTrigger
          value="contact"
          className={`flex items-center justify-center gap-1.5 sm:gap-2 py-2 sm:py-2.5 md:py-3 rounded-lg transition-all duration-300 text-xs sm:text-sm w-full
            ${activeTab === "contact" 
              ? "bg-primary text-white shadow-md" 
              : "bg-white text-gray-800 border border-gray-200 hover:border-primary/50"}`}
        >
          <Mail className="size-3.5 sm:size-4 md:size-5" />
          <span className="font-medium">اتصل بنا</span>
        </TabsTrigger>
      </motion.div>
    </TabsList>
  );
};

export default LegalTabs;
