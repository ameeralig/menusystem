
import { Button } from "@/components/ui/button";
import { MessageSquare, CheckCircle, AlertCircle } from "lucide-react";

interface FeedbackCardProps {
  id: string;
  visitor_name: string;
  type: string;
  description: string;
  created_at: string;
  status: string;
  onResolve?: (id: string) => void;
}

const statusStyles = {
  pending: {
    color: "bg-yellow-100 text-yellow-800",
    icon: <AlertCircle className="text-yellow-400 w-5 h-5 inline ml-1" />,
    label: "قيد المراجعة",
  },
  reviewed: {
    color: "bg-blue-100 text-blue-800",
    icon: <MessageSquare className="text-blue-400 w-5 h-5 inline ml-1" />,
    label: "تمت المراجعة",
  },
  resolved: {
    color: "bg-green-100 text-green-800",
    icon: <CheckCircle className="text-green-500 w-5 h-5 inline ml-1" />,
    label: "تم الحل",
  },
};

export default function FeedbackCard({
  id,
  visitor_name,
  type,
  description,
  created_at,
  status,
  onResolve,
}: FeedbackCardProps) {
  const isResolved = status === "resolved";
  const typeText = type === "complaint" ? "شكوى" : "اقتراح";

  return (
    <div className="feedback-card bg-gradient-to-tr from-[#F1F0FB] to-[#fff] rounded-2xl shadow-lg p-5 flex flex-col gap-3 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="font-bold text-gray-700">{visitor_name}</span>
          <span className="text-gray-400 text-xs">
            • {new Date(created_at).toLocaleDateString("ar-SA")}
          </span>
        </div>
        <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-sm font-medium ${statusStyles[status]?.color}`}>
          {statusStyles[status]?.icon}
          {statusStyles[status]?.label}
        </span>
      </div>
      
      {/* Type */}
      <div className={`text-xs font-bold inline-block px-2 py-1 rounded w-fit ${type === "complaint" ? "bg-rose-100 text-rose-700" : "bg-indigo-100 text-indigo-600"}`}>
        {typeText}
      </div>
      {/* Description */}
      <p className="text-gray-700 text-right">{description}</p>
      {/* Action */}
      {!isResolved && onResolve && (
        <div className="flex justify-end">
          <Button
            size="sm"
            variant="outline"
            className="text-green-600 border-green-500 hover:bg-green-50 ml-auto"
            onClick={() => onResolve(id)}
          >
            تحديد كمحلول
          </Button>
        </div>
      )}
    </div>
  );
}
