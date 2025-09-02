
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface FeedbackItem {
  id: string;
  visitor_name: string;
  visitor_phone: string | null; // تعديل النوع ليتوافق مع قاعدة البيانات
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

        console.log("جلب الشكاوى والاقتراحات للمستخدم:", user.id);

        const { data, error } = await supabase
          .from("feedback")
          .select("*")
          .eq("store_owner_id", user.id)
          .order("created_at", { ascending: false });

        if (error) {
          console.error("خطأ في جلب الشكاوى:", error);
          throw error;
        }
        
        console.log("تم جلب الشكاوى بنجاح:", data);
        
        // تحويل البيانات ووضع قيمة افتراضية لحقل رقم الهاتف إذا كان غير موجود
        const processedData = data?.map(item => ({
          ...item,
          visitor_phone: item.visitor_phone || null // القيمة الافتراضية إذا كان الحقل غير موجود
        })) || [];
        
        setFeedback(processedData);
        
        // تحديث حالة الشكاوى من pending إلى reviewed عند فتح الصفحة
        const pendingIds = data
          ?.filter(item => item.status === 'pending')
          .map(item => item.id) || [];
          
        if (pendingIds.length > 0) {
          console.log("تحديث حالة الشكاوى المعلقة:", pendingIds);
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

    // الاستماع للتحديثات الفورية للملاحظات
    const channel = supabase
      .channel('feedback-updates')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'feedback' }, 
        (payload) => {
          console.log("تم إضافة ملاحظة جديدة:", payload.new);
          setFeedback(prev => [payload.new as FeedbackItem, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
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

  const deleteResolvedFeedback = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "خطأ في التحقق",
          description: "الرجاء تسجيل الدخول أولاً.",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase.rpc('delete_resolved_feedback', {
        owner_id: user.id
      });

      if (error) {
        console.error("خطأ في حذف الملاحظات:", error);
        toast({
          title: "خطأ في الحذف",
          description: "لم نتمكن من حذف الملاحظات. الرجاء المحاولة مرة أخرى.",
          variant: "destructive",
        });
        return;
      }

      // تحديث القائمة المحلية
      setFeedback(prev => prev.filter(item => item.status !== "resolved"));

      toast({
        title: "تم الحذف بنجاح",
        description: `تم حذف ${data} ملاحظة محلولة.`,
      });
    } catch (error) {
      console.error("خطأ غير متوقع:", error);
    }
  };

  return {
    feedback,
    isLoading,
    markAsResolved,
    deleteResolvedFeedback
  };
};
