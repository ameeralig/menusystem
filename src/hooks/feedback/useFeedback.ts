
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export const useFeedback = () => {
  const [feedback, setFeedback] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [contactInfo, setContactInfo] = useState<any>(null);
  const [colorTheme, setColorTheme] = useState<string | null>("default");

  const fetchFeedback = async () => {
    try {
      // الحصول على معرف المستخدم الحالي
      const { data: userData } = await supabase.auth.getUser();
      
      if (!userData?.user?.id) {
        throw new Error("لم يتم العثور على المستخدم");
      }
      
      // جلب بيانات الملاحظات
      const { data, error } = await supabase
        .from('feedback')
        .select('*')
        .eq('store_owner_id', userData.user.id)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      setFeedback(data || []);
      
      // جلب معلومات المتجر
      const { data: storeData, error: storeError } = await supabase
        .from('store_settings')
        .select('contact_info, color_theme')
        .eq('user_id', userData.user.id)
        .single();
        
      if (storeError) {
        console.error("Error fetching store info:", storeError);
      } else if (storeData) {
        setContactInfo(storeData.contact_info || null);
        setColorTheme(storeData.color_theme || "default");
      }
    } catch (error: any) {
      console.error("Error fetching feedback:", error);
      toast.error("حدث خطأ أثناء تحميل البيانات");
    } finally {
      setIsLoading(false);
    }
  };

  const markAsResolved = async (id: string) => {
    try {
      const { error } = await supabase
        .from('feedback')
        .update({ status: 'resolved' })
        .eq('id', id);
        
      if (error) throw error;
      
      // تحديث حالة الملاحظة في القائمة المحلية
      setFeedback(feedback.map(item => {
        if (item.id === id) {
          return { ...item, status: 'resolved' };
        }
        return item;
      }));
      
      toast.success("تم تحديث حالة الملاحظة بنجاح");
    } catch (error: any) {
      console.error("Error updating feedback status:", error);
      toast.error("حدث خطأ أثناء تحديث حالة الملاحظة");
    }
  };

  useEffect(() => {
    fetchFeedback();
  }, []);

  return { feedback, isLoading, markAsResolved, contactInfo, colorTheme };
};
