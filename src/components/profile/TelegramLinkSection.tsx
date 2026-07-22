import { useEffect, useState } from "react";
import { Send, Copy, RefreshCw, Unlink, CheckCircle2, Loader2, ExternalLink, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

interface Status {
  telegram_connected: boolean;
  telegram_username: string | null;
  telegram_first_name: string | null;
  telegram_link_code: string | null;
  telegram_verified_at: string | null;
  telegram_last_login: string | null;
}

interface Creds {
  link_code: string;
  password: string;
}

export const TelegramLinkSection = ({ themeColor }: { themeColor: string }) => {
  const { toast } = useToast();
  const [status, setStatus] = useState<Status | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [creds, setCreds] = useState<Creds | null>(null);

  const call = async (action: "status" | "generate" | "disconnect") => {
    const { data, error } = await supabase.functions.invoke("telegram-link-manage", {
      body: { action },
    });
    if (error) throw error;
    if (data?.error) throw new Error(data.error);
    return data;
  };

  const refresh = async () => {
    try {
      const data = await call("status");
      setStatus(data?.profile ?? null);
    } catch (e: any) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const generate = async () => {
    setBusy(true);
    try {
      const data = await call("generate");
      setCreds({ link_code: data.link_code, password: data.password });
      await refresh();
      toast({ title: "تم توليد بيانات الربط", description: "احفظها الآن — لن تظهر كلمة المرور مرة أخرى." });
    } catch (e: any) {
      toast({ title: "خطأ", description: e.message, variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  const disconnect = async () => {
    if (!confirm("هل تريد إلغاء ربط حساب Telegram؟")) return;
    setBusy(true);
    try {
      await call("disconnect");
      setCreds(null);
      await refresh();
      toast({ title: "تم إلغاء الربط" });
    } catch (e: any) {
      toast({ title: "خطأ", description: e.message, variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  const copy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: `تم نسخ ${label}` });
  };

  const copyBoth = () => {
    if (!creds) return;
    navigator.clipboard.writeText(`Code: ${creds.link_code}\nPassword: ${creds.password}`);
    toast({ title: "تم نسخ البيانات" });
  };

  if (loading) {
    return (
      <div className="flex justify-center p-4">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  }

  const connected = status?.telegram_connected;

  return (
    <div className="pt-6 border-t border-border/40">
      <div className="flex items-center gap-2 mb-3">
        <Send className="h-5 w-5" style={{ color: themeColor }} />
        <h3 className="text-lg font-bold text-right">ربط Telegram</h3>
      </div>

      {connected ? (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            <span className="font-medium">مربوط</span>
          </div>
          <div className="text-sm space-y-1 text-right">
            {status?.telegram_first_name && <div>الاسم: {status.telegram_first_name}</div>}
            {status?.telegram_username && <div>@{status.telegram_username}</div>}
            {status?.telegram_verified_at && (
              <div className="text-xs text-muted-foreground">
                منذ: {new Date(status.telegram_verified_at).toLocaleDateString("ar")}
              </div>
            )}
          </div>
          <Button variant="destructive" className="w-full gap-2" onClick={disconnect} disabled={busy}>
            <Unlink className="h-4 w-4" /> إلغاء الربط
          </Button>
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-background/50 border border-border/40 space-y-3">
          <p className="text-sm text-muted-foreground text-right">
            اربط حسابك بـ Telegram Bot لإدارة متجرك من التطبيق.
          </p>

          {creds ? (
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-xs text-right">
                ⚠️ احفظ هذه البيانات الآن — لن تظهر كلمة المرور مرة أخرى.
              </div>
              <CredRow label="رمز الربط" value={creds.link_code} onCopy={() => copy(creds.link_code, "الرمز")} />
              <CredRow label="كلمة المرور" value={creds.password} onCopy={() => copy(creds.password, "كلمة المرور")} mono />
              <Button variant="outline" className="w-full gap-2" onClick={copyBoth}>
                <Copy className="h-4 w-4" /> نسخ الاثنين
              </Button>
              <div className="text-xs text-muted-foreground text-right leading-relaxed">
                افتح البوت على Telegram، أرسل <span className="font-mono">/start</span>، ثم أرسل الرمز وكلمة المرور.
              </div>
            </div>
          ) : status?.telegram_link_code ? (
            <div className="space-y-2">
              <CredRow label="رمز الربط الحالي" value={status.telegram_link_code} onCopy={() => copy(status.telegram_link_code!, "الرمز")} />
              <p className="text-xs text-muted-foreground text-right">
                كلمة المرور مخفية. إذا نسيتها، ولّد بيانات جديدة.
              </p>
            </div>
          ) : null}

          <Button
            className="w-full gap-2"
            onClick={generate}
            disabled={busy}
            style={{ background: themeColor }}
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            {status?.telegram_link_code ? "توليد بيانات جديدة" : "توليد بيانات الربط"}
          </Button>
        </div>
      )}
    </div>
  );
};

const CredRow = ({ label, value, onCopy, mono }: { label: string; value: string; onCopy: () => void; mono?: boolean }) => (
  <div className="flex items-center gap-2 p-2 rounded-lg bg-background/70 border border-border/40">
    <Button size="icon" variant="ghost" onClick={onCopy} className="h-8 w-8 shrink-0">
      <Copy className="h-4 w-4" />
    </Button>
    <div className="flex-1 min-w-0 text-right">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={`text-sm font-medium truncate ${mono ? "font-mono" : ""}`} dir="ltr">{value}</div>
    </div>
  </div>
);

export default TelegramLinkSection;
