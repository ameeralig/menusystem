
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
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

// تسجيل الدخول عندما يتم تحميل الملف لأغراض التصحيح
console.log("Supabase client initialized with realtime config");
