import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Purchase {
  id: string;
  user_id: string;
  amount: number;
  price_iqd: number | null;
  status: string;
  payment_method: string | null;
  receipt_url: string | null;
  note: string | null;
  created_at: string;
  userName?: string;
}

export interface CreditRow {
  user_id: string;
  balance: number;
  total_used: number;
  userName?: string;
}

export const useAiCredits = () => {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [credits, setCredits] = useState<CreditRow[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    const [{ data: p }, { data: c }] = await Promise.all([
      supabase.from("ai_credit_purchases").select("*").order("created_at", { ascending: false }).limit(100),
      supabase.from("ai_user_credits").select("*").order("updated_at", { ascending: false }).limit(100),
    ]);

    const ids = Array.from(new Set([...(p ?? []).map((x) => x.user_id), ...(c ?? []).map((x) => x.user_id)]));
    const names = new Map<string, string>();
    if (ids.length) {
      const { data: profiles } = await supabase.from("profiles").select("id, full_name").in("id", ids);
      profiles?.forEach((pr) => names.set(pr.id, pr.full_name ?? "بدون اسم"));
    }

    setPurchases((p ?? []).map((x) => ({ ...x, userName: names.get(x.user_id) })) as Purchase[]);
    setCredits((c ?? []).map((x) => ({ ...x, userName: names.get(x.user_id) })) as CreditRow[]);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const approve = async (id: string) => {
    const { error } = await supabase.rpc("approve_ai_credit_purchase", { _purchase_id: id });
    if (error) toast({ title: "فشل الاعتماد", description: error.message, variant: "destructive" });
    else toast({ title: "تم شحن الرصيد ✅" });
    load();
  };

  const reject = async (id: string) => {
    const { error } = await supabase
      .from("ai_credit_purchases")
      .update({ status: "rejected", approved_at: new Date().toISOString() })
      .eq("id", id);
    if (error) toast({ title: "فشل الرفض", description: error.message, variant: "destructive" });
    else toast({ title: "تم رفض الطلب" });
    load();
  };

  const addCredit = async (userId: string, amount: number) => {
    const current = credits.find((c) => c.user_id === userId)?.balance ?? 0;
    const { error } = await supabase
      .from("ai_user_credits")
      .upsert({ user_id: userId, balance: current + amount, updated_at: new Date().toISOString() }, { onConflict: "user_id" });
    if (error) toast({ title: "فشل الشحن", description: error.message, variant: "destructive" });
    else toast({ title: `تم إضافة ${amount} رسالة` });
    load();
  };

  return { purchases, credits, loading, reload: load, approve, reject, addCredit };
};
