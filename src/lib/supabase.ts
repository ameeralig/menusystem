import { supabase as sharedSupabase } from "@/integrations/supabase/client";

// توحيد عميل Supabase في كل المشروع لتجنب تعدد العملاء
export const supabase = sharedSupabase;
