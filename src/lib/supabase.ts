
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
  if (!userId) {
    console.error("معرف المستخدم غير موجود في checkUserStoreSlug");
    return null;
  }
  
  try {
    console.log("التحقق من النطاق الفرعي للمستخدم:", userId);
    const { data, error } = await supabase
      .from("store_settings")
      .select("slug")
      .eq("user_id", userId)
      .maybeSingle();
      
    if (error) {
      console.error("خطأ في التحقق من النطاق الفرعي:", error.message, error.details);
      return null;
    }
    
    console.log("نتيجة التحقق من النطاق الفرعي:", data);
    return data?.slug || null;
  } catch (error: any) {
    console.error("استثناء في التحقق من النطاق الفرعي:", error.message);
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
    
    // للاختبار: استخراج النطاق الفرعي من معلمة URL في بيئة التطوير
    const urlParams = new URLSearchParams(window.location.search);
    const testSubdomain = urlParams.get('subdomain');
    if (testSubdomain) {
      console.log("تم العثور على نطاق فرعي للاختبار في معلمات URL:", testSubdomain);
      return testSubdomain;
    }
    
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
  if (!slug) {
    console.error("لا يوجد نطاق فرعي محدد في getUserIdFromSlug");
    return null;
  }
  
  try {
    console.log("البحث عن معرف المستخدم عبر النطاق الفرعي:", slug);
    const { data, error } = await supabase
      .from("store_settings")
      .select("user_id, store_name")
      .eq("slug", slug)
      .maybeSingle();
      
    if (error) {
      console.error("خطأ في البحث عن معرف المستخدم عبر النطاق الفرعي:", error.message, error.details);
      return null;
    }
    
    console.log("نتيجة البحث عن المستخدم من النطاق الفرعي:", data);
    
    if (data && data.store_name) {
      document.title = data.store_name;
    }
    
    return data?.user_id || null;
  } catch (error: any) {
    console.error("استثناء في البحث عن معرف المستخدم عبر النطاق الفرعي:", error.message);
    return null;
  }
};
