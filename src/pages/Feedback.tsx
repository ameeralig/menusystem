
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { AnimatedBackground } from "@/components/auth/AnimatedBackground";
import LoadingState from "@/components/store/LoadingState";

interface FeedbackItem {
  id: string;
  visitor_name: string;
  type: string;
  description: string;
  created_at: string;
  status: string;
}

const FeedbackCard = ({ item, onResolve }: { 
  item: FeedbackItem; 
  onResolve: (id: string) => Promise<void>;
}) => {
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
            className="text-green-600 border-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
            onClick={() => onResolve(item.id)}
          >
            تحديد كمحلول
          </Button>
        </div>
      )}
    </motion.div>
  );
};

const EmptyFeedback = () => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="text-center py-12 px-4"
    >
      <div className="text-6xl mb-4">📝</div>
      <h3 className="text-xl font-semibold mb-2">لا توجد شكاوى أو اقتراحات</h3>
      <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
        سيتم عرض الشكاوى والاقتراحات الواردة من زوار المتجر هنا
      </p>
    </motion.div>
  );
};

const Feedback = () => {
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          navigate("/auth/login");
          return;
        }

        const { data, error } = await supabase
          .from("feedback")
          .select("*")
          .eq("store_owner_id", user.id)
          .order("created_at", { ascending: false });

        if (error) throw error;
        
        setFeedback(data || []);
        
        // Mark all pending feedback as reviewed
        const pendingIds = data
          ?.filter(item => item.status === 'pending')
          .map(item => item.id) || [];
          
        if (pendingIds.length > 0) {
          const { error: updateError } = await supabase
            .from("feedback")
            .update({ status: 'reviewed' })
            .in('id', pendingIds);
            
          if (updateError) {
            console.error("Error updating feedback status:", updateError);
          }
        }
      } catch (error) {
        console.error("Error fetching feedback:", error);
        toast({
          title: "خطأ",
          description: "حدث خطأ أثناء جلب الشكاوى والاقتراحات",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeedback();
  }, [navigate, toast]);
  
  const markAsResolved = async (id: string) => {
    try {
      const { error } = await supabase
        .from("feedback")
        .update({ status: 'resolved' })
        .eq('id', id);
        
      if (error) throw error;
      
      setFeedback(prev => 
        prev.map(item => 
          item.id === id ? {...item, status: 'resolved'} : item
        )
      );
      
      toast({
        title: "تم بنجاح",
        description: "تم تحديث حالة الشكوى/الاقتراح إلى 'تم الحل'",
      });
    } catch (error) {
      console.error("Error updating feedback status:", error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تحديث حالة الشكوى/الاقتراح",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return <LoadingState />;
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <div className="min-h-screen w-full overflow-hidden relative flex items-center justify-center">
      {/* خلفية متحركة */}
      <AnimatedBackground />
      
      {/* تأثيرات نيون إضافية في الخلفية */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/30 blur-[100px] rounded-full"></div>
      <div className="absolute bottom-1/3 right-1/3 w-96 h-96 bg-primary/20 blur-[120px] rounded-full"></div>
      
      <motion.div
        className="w-full max-w-4xl z-10 px-4 py-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <motion.div 
          className="backdrop-blur-xl bg-white/10 dark:bg-black/10 border border-white/20 dark:border-white/10 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] overflow-hidden"
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          whileHover={{ boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)" }}
        >
          <div className="p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <motion.h2 
                className="text-2xl font-bold bg-gradient-to-br from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                الشكاوى والاقتراحات
              </motion.h2>
              
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.6 }}
              >
                <Button
                  variant="ghost"
                  onClick={() => navigate("/dashboard")}
                  className="hover:bg-white/10"
                >
                  العودة للوحة التحكم
                </Button>
              </motion.div>
            </div>

            {feedback.length === 0 ? (
              <EmptyFeedback />
            ) : (
              <motion.div 
                className="space-y-4"
                variants={container}
                initial="hidden"
                animate="show"
              >
                {feedback.map((item) => (
                  <FeedbackCard 
                    key={item.id} 
                    item={item} 
                    onResolve={markAsResolved}
                  />
                ))}
              </motion.div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Feedback;
