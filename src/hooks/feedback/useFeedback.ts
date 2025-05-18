
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface FeedbackItem {
  id: string;
  visitor_name: string;
  visitor_phone: string; // إضافة حقل جديد لرقم الهاتف
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
        
        // تحويل البيانات ووضع قيمة افتراضية لحقل رقم الهاتف إذا كان غير موجود
        const processedData = data?.map(item => ({
          ...item,
          visitor_phone: item.visitor_phone || "" // القيمة الافتراضية إذا كان الحقل غير موجود
        })) || [];
        
        setFeedback(processedData);
        
        // تحديث حالة الشكاوى من pending إلى reviewed عند فتح الصفحة
        const pendingIds = data
          ?.filter(item => item.status === 'pending')
          .map(item => item.id) || [];
          
        if (pendingIds.length > 0) {
          const { error: updateError } = await supabase
            .from("feedback")
            .update({ status: 'reviewed' })
            .in('id', pendingIds);
            
          if (updateError) {
            console.error("خطأ في تحديث حالة الشكاوى:", updateError);
          } else {
            // تحديث الحالة محلياً أيضاً
            setFeedback(prev => 
              prev.map(item => 
                pendingIds.includes(item.id) ? {...item, status: 'reviewed'} : item
              )
            );
          }
        }
      } catch (error) {
        console.error("خطأ في جلب الشكاوى والاقتراحات:", error);
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
      console.error("خطأ في تحديث حالة الشكوى/الاقتراح:", error);
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
