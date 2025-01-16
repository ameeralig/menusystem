import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://am2.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtMiIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzA1NDQyODAwLCJleHAiOjIwMjEwMTg4MDB9.YOUR_ACTUAL_KEY";

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