
import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Phone } from "lucide-react";

interface FeedbackItem {
  id: string;
  visitor_name: string;
  visitor_phone: string | null; // تعديل النوع ليتوافق مع قاعدة البيانات
  type: string;
  description: string;
  created_at: string;
  status: string;
}

interface FeedbackCardProps {
  item: FeedbackItem;
  onResolve: (id: string) => Promise<void>;
}

const FeedbackCard = ({ item, onResolve }: FeedbackCardProps) => {
  const [isResolving, setIsResolving] = useState(false);
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "reviewed":
        return "bg-blue-100 text-blue-800";
      case "resolved":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getFeedbackTypeText = (type: string) => {
    return type === "complaint" ? "شكوى" : "اقتراح";
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "قيد المراجعة";
      case "reviewed":
        return "تمت المراجعة";
      case "resolved":
        return "تم الحل";
      default:
        return status;
    }
  };

  const handleResolve = async () => {
    setIsResolving(true);
    await onResolve(item.id);
    setIsResolving(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="backdrop-blur-lg bg-white/10 dark:bg-black/10 border border-white/20 dark:border-white/10 rounded-lg p-4 hover:shadow-md transition-all duration-300"
    >
      <div className="flex justify-between items-start mb-2">
        <div>
          <span className="font-semibold">{item.visitor_name}</span>
          <span className="mx-2">•</span>
          <span className="text-gray-500">
            {new Date(item.created_at).toLocaleDateString("ar-SA")}
          </span>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-sm ${getStatusColor(
            item.status
          )}`}
        >
          {getStatusText(item.status)}
        </span>
      </div>
      
      {/* إضافة عرض رقم الهاتف إذا كان متوفراً */}
      {item.visitor_phone && (
        <div className="mb-2 flex items-center text-primary">
          <Phone size={14} className="mr-1" />
          <a 
            href={`tel:${item.visitor_phone}`} 
            className="text-sm hover:underline"
          >
            {item.visitor_phone}
          </a>
        </div>
      )}
      
      <div className="mb-2">
        <span className="text-primary font-medium">
          {getFeedbackTypeText(item.type)}
        </span>
      </div>
      <p className="text-gray-700 dark:text-gray-300">{item.description}</p>
      
      {item.status !== 'resolved' && (
        <div className="mt-3 flex justify-end">
          <Button
            size="sm"
            variant="outline"
            onClick={handleResolve}
            disabled={isResolving}
            className="text-green-600 border-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
          >
            {isResolving ? (
              <div className="flex items-center gap-1">
                <span className="animate-spin h-3 w-3 border-2 border-current border-t-transparent rounded-full" />
                <span>جارٍ التحديث...</span>
              </div>
            ) : "تحديد كمحلول"}
          </Button>
        </div>
      )}
    </motion.div>
  );
};

export default FeedbackCard;
