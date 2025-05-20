
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

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
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#E5DEFF] to-white p-6">
        <div className="container mx-auto">
          <div className="text-center">جاري التحميل...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E5DEFF] to-white p-6">
      <div className="container mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">الشكاوى والاقتراحات</h1>
            <button
              onClick={() => navigate("/dashboard")}
              className="text-gray-600 hover:text-gray-900"
            >
              العودة للوحة التحكم
            </button>
          </div>

          {feedback.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              لا توجد شكاوى أو اقتراحات حتى الآن
            </div>
          ) : (
            <div className="space-y-4">
              {feedback.map((item) => (
                <div
                  key={item.id}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow"
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
                    <span className="text-purple-600 font-medium">
                      {getFeedbackTypeText(item.type)}
                    </span>
                  </div>
                  <p className="text-gray-700">{item.description}</p>
                  
                  {item.status !== 'resolved' && (
                    <div className="mt-3 flex justify-end">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-green-600 border-green-600 hover:bg-green-50"
                        onClick={() => markAsResolved(item.id)}
                      >
                        تحديد كمحلول
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Feedback;
