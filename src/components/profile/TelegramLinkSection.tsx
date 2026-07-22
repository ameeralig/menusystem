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

  const BOT_USERNAME = "qrmenuc_bot";
  const BOT_URL = `https://t.me/${BOT_USERNAME}`;

  return (
    <div className="pt-6 border-t border-border/40">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Send className="h-5 w-5" style={{ color: themeColor }} />
          <h3 className="text-lg font-bold">ربط Telegram</h3>
        </div>
        <span
          className={`text-xs px-2 py-1 rounded-full font-medium ${
            connected
              ? "bg-emerald-500/15 text-emerald-600 border border-emerald-500/30"
              : "bg-amber-500/15 text-amber-600 border border-amber-500/30"
          }`}
        >
          {connected ? "● متصل" : "● غير متصل"}
        </span>
      </div>

      {/* Bot info card — always visible */}
      <a
        href={BOT_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-between p-3 mb-3 rounded-xl bg-background/70 border border-border/40 hover:bg-background transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: `${themeColor}20` }}>
            <Send className="h-5 w-5" style={{ color: themeColor }} />
          </div>
          <div className="text-right">
            <div className="text-sm font-bold">QRM AI 🤖</div>
            <div className="text-xs text-muted-foreground" dir="ltr">@{BOT_USERNAME}</div>
          </div>
        </div>
        <ExternalLink className="h-4 w-4 text-muted-foreground" />
      </a>

      {connected ? (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            <span className="font-medium">تم الربط بنجاح</span>
          </div>
          <div className="text-sm space-y-1 text-right">
            {status?.telegram_first_name && <div>الاسم: {status.telegram_first_name}</div>}
            {status?.telegram_username && <div dir="ltr" className="text-left">@{status.telegram_username}</div>}
            {status?.telegram_verified_at && (
              <div className="text-xs text-muted-foreground">
                تاريخ الربط: {new Date(status.telegram_verified_at).toLocaleDateString("ar")}
              </div>
            )}
            {status?.telegram_last_login && (
              <div className="text-xs text-muted-foreground">
                آخر دخول: {new Date(status.telegram_last_login).toLocaleString("ar")}
              </div>
            )}
          </div>
          <Button variant="destructive" className="w-full gap-2" onClick={disconnect} disabled={busy}>
            <Unlink className="h-4 w-4" /> إلغاء الربط
          </Button>
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-background/50 border border-border/40 space-y-3">
          <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
            <div className="text-xs text-right leading-relaxed">
              <div className="font-medium mb-1">خطوات الربط:</div>
              <div>1️⃣ ولّد <b>رمز الربط</b> و<b>كلمة السر</b> من الزر بالأسفل.</div>
              <div>2️⃣ افتح البوت <b>@{BOT_USERNAME}</b> وأرسل <span className="font-mono">/start</span>.</div>
              <div>3️⃣ أرسل الرمز، ثم كلمة السر عند طلبها.</div>
            </div>
          </div>

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
              <Button
                variant="outline"
                className="w-full gap-2"
                onClick={() => window.open(BOT_URL, "_blank")}
              >
                <ExternalLink className="h-4 w-4" /> فتح البوت الآن
              </Button>
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
