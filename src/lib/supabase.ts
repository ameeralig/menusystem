import { createClient } from "@supabase/supabase-js";

// These values are now available since you connected your Supabase project
const supabaseUrl = "https://zqlckixwpyrwdwrsuhsg.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpxbGNraXh3cHlyd2R3cnN1aHNnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDU0NDI4MDAsImV4cCI6MjAyMTAxODgwMH0.vxjjXPb9YJn0UiWBE_0T2x0Z_FYxkUDqYlvE5VSh_RM";

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase environment variables are missing. Please connect to Supabase from the Supabase menu in the top right corner.');
}

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
);