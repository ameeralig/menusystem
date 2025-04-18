
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://zqlckixwpyrwdwrsuhsg.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpxbGNraXh3cHlyd2R3cnN1aHNnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzcwNjc1ODQsImV4cCI6MjA1MjY0MzU4NH0.d_Exb8JAFhXP0vTmQc9fRGXxRh3H7dtyGUb9pLcai44";

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase environment variables are missing. Please connect to Supabase from the Supabase menu in the top right corner.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// وظيفة مساعدة للتحقق من النطاق الفرعي
export const checkUserStoreSlug = async (userId: string): Promise<string | null> => {
  if (!userId) return null;
  
  try {
    const { data, error } = await supabase
      .from("store_settings")
      .select("slug")
      .eq("user_id", userId)
      .maybeSingle();
      
    if (error) {
      console.error("خطأ في التحقق من النطاق الفرعي:", error);
      return null;
    }
    
    console.log("نتيجة التحقق من النطاق الفرعي:", data);
    return data?.slug || null;
  } catch (error) {
    console.error("خطأ في التحقق من النطاق الفرعي:", error);
    return null;
  }
};

// وظيفة للتحقق من النطاق الفرعي الحالي
export const getCurrentSubdomain = (): string | null => {
  const hostname = window.location.hostname;
  console.log("اسم المضيف الحالي:", hostname);
  
  // تجاهل localhost في بيئة التطوير
  if (hostname === 'localhost' || hostname.includes('127.0.0.1') || hostname.includes('lovableproject.com')) {
    console.log("بيئة تطوير محلية، إرجاع null للنطاق الفرعي");
    return null;
  }
  
  // التحقق إذا كان العنوان يحتوي على نطاق فرعي
  const parts = hostname.split('.');
  console.log("أجزاء اسم المضيف:", parts);
  
  // نحتاج على الأقل 3 أجزاء للنطاق الفرعي (مثل subdomain.qrmenuc.com)
  if (parts.length >= 3) {
    // النطاق الفرعي هو الجزء الأول
    console.log("تم العثور على النطاق الفرعي:", parts[0]);
    return parts[0];
  }
  
  console.log("لم يتم العثور على نطاق فرعي");
  return null;
};

// وظيفة للتحقق من معرف المستخدم عن طريق النطاق الفرعي
export const getUserIdFromSlug = async (slug: string): Promise<string | null> => {
  if (!slug) return null;
  
  try {
    const { data, error } = await supabase
      .from("store_settings")
      .select("user_id")
      .eq("slug", slug)
      .maybeSingle();
      
    if (error) {
      console.error("خطأ في البحث عن معرف المستخدم عبر النطاق الفرعي:", error);
      return null;
    }
    
    console.log("تم العثور على معرف المستخدم من النطاق الفرعي:", data);
    return data?.user_id || null;
  } catch (error) {
    console.error("خطأ في البحث عن معرف المستخدم عبر النطاق الفرعي:", error);
    return null;
  }
};
