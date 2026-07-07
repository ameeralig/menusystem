import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

export interface CustomerProfile {
  full_name: string;
  phone: string;
  address: string;
  lat: number | null;
  lng: number | null;
  notes: string;
  avatar_url?: string | null;
  email?: string | null;
}

const empty: CustomerProfile = {
  full_name: "",
  phone: "",
  address: "",
  lat: null,
  lng: null,
  notes: "",
};

export const useCustomerProfile = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<CustomerProfile>(empty);
  const [isLoading, setIsLoading] = useState(true);

  const loadProfile = useCallback(async (u: User) => {
    const { data } = await supabase
      .from("customer_profiles")
      .select("*")
      .eq("id", u.id)
      .maybeSingle();

    if (data) {
      setProfile({
        full_name: data.full_name || u.user_metadata?.full_name || u.user_metadata?.name || "",
        phone: data.phone || "",
        address: data.address || "",
        lat: data.lat,
        lng: data.lng,
        notes: data.notes || "",
        avatar_url: data.avatar_url || u.user_metadata?.avatar_url || null,
        email: data.email || u.email,
      });
    } else {
      setProfile({
        ...empty,
        full_name: u.user_metadata?.full_name || u.user_metadata?.name || "",
        avatar_url: u.user_metadata?.avatar_url || null,
        email: u.email || null,
      });
    }
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const u = data.session?.user ?? null;
      setUser(u);
      if (u) loadProfile(u).finally(() => setIsLoading(false));
      else setIsLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      const u = session?.user ?? null;
      setUser(u);
      if (u) loadProfile(u);
      else setProfile(empty);
    });

    return () => sub.subscription.unsubscribe();
  }, [loadProfile]);

  const signInWith = useCallback(async (provider: "google" | "apple") => {
    await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: window.location.href },
    });
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  const saveProfile = useCallback(
    async (updates: Partial<CustomerProfile>) => {
      if (!user) return;
      const merged = { ...profile, ...updates };
      setProfile(merged);
      await supabase.from("customer_profiles").upsert({
        id: user.id,
        full_name: merged.full_name,
        phone: merged.phone,
        address: merged.address,
        lat: merged.lat,
        lng: merged.lng,
        notes: merged.notes,
        avatar_url: merged.avatar_url,
        email: merged.email,
      });
    },
    [user, profile]
  );

  return { user, profile, setProfile, isLoading, signInWith, signOut, saveProfile };
};
