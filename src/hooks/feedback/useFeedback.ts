
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface FeedbackItem {
  id: string;
  visitor_name: string;
  type: string;
  description: string;
  created_at: string;
  status: string;
}

export const useFeedback = () => {
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

      return Promise.resolve();
    } catch (error) {
      console.error("Error updating feedback status:", error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تحديث حالة الشكوى/الاقتراح",
        variant: "destructive",
      });

      return Promise.reject(error);
    }
  };

  return {
    feedback,
    isLoading,
    markAsResolved
  };
};
