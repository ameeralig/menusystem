import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Check, X, RefreshCw, Receipt, Plus, Loader2 } from "lucide-react";
import { useAiCredits } from "./useAiCredits";

const statusLabel: Record<string, { text: string; cls: string }> = {
  pending: { text: "معلّق", cls: "bg-amber-500/20 text-amber-300" },
  accepted: { text: "مقبول", cls: "bg-emerald-500/20 text-emerald-300" },
  rejected: { text: "مرفوض", cls: "bg-rose-500/20 text-rose-300" },
};

const AiCreditsTab = () => {
  const { purchases, credits, loading, reload, approve, reject, addCredit } = useAiCredits();
  const [amounts, setAmounts] = useState<Record<string, string>>({});

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-white/60" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={reload} variant="outline" size="sm" className="gap-2">
          <RefreshCw className="w-4 h-4" /> تحديث
        </Button>
      </div>

      {/* طلبات الشراء */}
      <section className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 p-5">
        <h2 className="text-lg font-black text-white mb-4">طلبات شراء الرصيد</h2>
        {purchases.length === 0 ? (
          <p className="text-white/50 text-sm">لا توجد طلبات.</p>
        ) : (
          <div className="space-y-3">
            {purchases.map((p) => {
              const st = statusLabel[p.status] ?? statusLabel.pending;
              return (
                <div key={p.id} className="flex flex-wrap items-center gap-3 bg-white/5 rounded-xl p-3 border border-white/10">
                  {p.receipt_url ? (
                    <a href={p.receipt_url} target="_blank" rel="noreferrer">
                      <img src={p.receipt_url} alt="وصل الدفع" className="w-14 h-14 rounded-lg object-cover border border-white/20" />
                    </a>
                  ) : (
                    <div className="w-14 h-14 rounded-lg bg-white/5 flex items-center justify-center">
                      <Receipt className="w-5 h-5 text-white/40" />
                    </div>
                  )}
                  <div className="flex-1 min-w-[160px]">
                    <p className="text-white font-bold text-sm">{p.userName ?? p.user_id.slice(0, 8)}</p>
                    <p className="text-white/60 text-xs">
                      {p.amount} رسالة • {(p.price_iqd ?? 0).toLocaleString("en")} د.ع •{" "}
                      {new Date(p.created_at).toLocaleDateString("ar")}
                    </p>
                  </div>
                  <Badge className={st.cls}>{st.text}</Badge>
                  {p.status === "pending" && (
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => approve(p.id)} className="gap-1 bg-emerald-600 hover:bg-emerald-700">
                        <Check className="w-4 h-4" /> قبول
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => reject(p.id)} className="gap-1">
                        <X className="w-4 h-4" /> رفض
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* أرصدة المستخدمين */}
      <section className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 p-5">
        <h2 className="text-lg font-black text-white mb-4">أرصدة المستخدمين</h2>
        {credits.length === 0 ? (
          <p className="text-white/50 text-sm">لا توجد بيانات.</p>
        ) : (
          <div className="space-y-3">
            {credits.map((c) => (
              <div key={c.user_id} className="flex flex-wrap items-center gap-3 bg-white/5 rounded-xl p-3 border border-white/10">
                <div className="flex-1 min-w-[160px]">
                  <p className="text-white font-bold text-sm">{c.userName ?? c.user_id.slice(0, 8)}</p>
                  <p className="text-white/60 text-xs">المتبقي: {c.balance} • المستهلك: {c.total_used}</p>
                </div>
                <Input
                  type="number"
                  placeholder="عدد الرسائل"
                  value={amounts[c.user_id] ?? ""}
                  onChange={(e) => setAmounts((a) => ({ ...a, [c.user_id]: e.target.value }))}
                  className="w-32 bg-white/5 text-white"
                />
                <Button
                  size="sm"
                  className="gap-1"
                  onClick={() => {
                    const v = parseInt(amounts[c.user_id] ?? "", 10);
                    if (!v || v <= 0) return;
                    addCredit(c.user_id, v);
                    setAmounts((a) => ({ ...a, [c.user_id]: "" }));
                  }}
                >
                  <Plus className="w-4 h-4" /> شحن
                </Button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default AiCreditsTab;
