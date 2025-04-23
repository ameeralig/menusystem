
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import FeedbackCard from "@/components/feedback/FeedbackCard";
import { MessageSquare } from "lucide-react";

interface FeedbackItem {
  id: string;
  visitor_name: string;
  type: string;
  description: string;
  created_at: string;
  status: string;
}

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
          item.id === id ? { ...item, status: 'resolved' } : item
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
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#E5DEFF] to-[#fff] flex items-center justify-center">
        <div className="glass-morphism px-8 py-6 rounded-2xl shadow-lg text-center text-lg">
          جاري التحميل...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E5DEFF] to-white">
      <div className="container max-w-2xl mx-auto py-10">
        <div className="bg-white rounded-3xl shadow-2xl px-7 py-8 border border-[#f2f1fa] mb-6">
          {/* Header with icon */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-[#9b87f5]/10 p-2">
                <MessageSquare className="text-[#9b87f5] w-7 h-7" />
              </span>
              <h1 className="text-2xl md:text-3xl font-extrabold text-gradient bg-gradient-to-r from-[#9b87f5] via-[#ff9178] to-[#9b87f5] bg-clip-text text-transparent">
                الشكاوى والاقتراحات
              </h1>
            </div>
            <Button
              variant="ghost"
              onClick={() => navigate("/dashboard")}
              className="text-[#9b87f5] hover:text-[#ff9178] border-0 font-bold rounded-xl transition-all"
            >
              العودة للوحة التحكم
            </Button>
          </div>
          {/* Feedback List */}
          <div className="space-y-6">
            {feedback.length === 0 ? (
              <div className="text-center py-14 text-gray-400">
                لا توجد شكاوى أو اقتراحات حتى الآن
              </div>
            ) : (
              feedback.map(item => (
                <FeedbackCard
                  key={item.id}
                  {...item}
                  onResolve={markAsResolved}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Feedback;
