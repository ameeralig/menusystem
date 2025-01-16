import { createClient } from "@supabase/supabase-js";

// These values are now available since you connected your Supabase project
const supabaseUrl = "https://am2.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtMiIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzA1NDQyODAwLCJleHAiOjIwMjEwMTg4MDB9.YOUR_ACTUAL_KEY";

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase environment variables are missing. Please connect to Supabase from the Supabase menu in the top right corner.');
}

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
);