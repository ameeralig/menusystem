import React, { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Plus, Calendar, Image as ImageIcon, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Product } from "@/types/product";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  storeOwnerId: string;
  products: Product[];
  storiesEnabled: boolean;
  autoGenerate: boolean;
  onSettingsChange: (settings: { stories_enabled?: boolean; stories_auto_generate?: boolean }) => void;
}

const EXPIRY_OPTIONS = [
  { label: "يوم واحد", value: 1 },
  { label: "3 أيام", value: 3 },
  { label: "أسبوع", value: 7 },
  { label: "أسبوعين", value: 14 },
  { label: "شهر", value: 30 },
];

const StoriesManagerSheet: React.FC<Props> = ({
  isOpen, onClose, storeOwnerId, products, storiesEnabled, autoGenerate, onSettingsChange,
}) => {
  const [stories, setStories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAdd, setShowAdd] = useState(false);

  // form state
  const [formType, setFormType] = useState<"product" | "custom">("product");
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [imageUrl, setImageUrl] = useState("");
  const [title, setTitle] = useState("");
  const [caption, setCaption] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [expiryDays, setExpiryDays] = useState(7);
  const [saving, setSaving] = useState(false);

  const fetchStories = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("product_stories" as any)
      .select("*")
      .eq("store_owner_id", storeOwnerId)
      .order("created_at", { ascending: false });
    setStories(data || []);
    setLoading(false);
  };

  useEffect(() => {
    if (isOpen) fetchStories();
  }, [isOpen, storeOwnerId]);

  const resetForm = () => {
    setFormType("product");
    setSelectedProductId("");
    setImageUrl("");
    setTitle("");
    setCaption("");
    setLinkUrl("");
    setExpiryDays(7);
    setShowAdd(false);
  };

  const handleSave = async () => {
    if (formType === "product" && !selectedProductId) {
      toast.error("اختر منتج");
      return;
    }
    if (formType === "custom" && !imageUrl) {
      toast.error("ضع رابط صورة");
      return;
    }

    setSaving(true);
    const product = formType === "product" ? products.find((p) => p.id === selectedProductId) : null;
    const expires_at = new Date(Date.now() + expiryDays * 86400000).toISOString();

    const { error } = await supabase.from("product_stories" as any).insert({
      store_owner_id: storeOwnerId,
      type: formType,
      product_id: formType === "product" ? selectedProductId : null,
      image_url: formType === "product" ? product?.image_url || "" : imageUrl,
      title: title || product?.name || null,
      caption: caption || null,
      link_url: linkUrl || null,
      expires_at,
    });

    setSaving(false);
    if (error) {
      toast.error("فشل الحفظ: " + error.message);
      return;
    }
    toast.success("تمت إضافة الستوري");
    resetForm();
    fetchStories();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("product_stories" as any).delete().eq("id", id);
    if (error) return toast.error("فشل الحذف");
    toast.success("تم الحذف");
    fetchStories();
  };

  const handleExtend = async (id: string, days: number) => {
    const { error } = await supabase
      .from("product_stories" as any)
      .update({ expires_at: new Date(Date.now() + days * 86400000).toISOString() })
      .eq("id", id);
    if (error) return toast.error("فشل التمديد");
    toast.success("تم التمديد");
    fetchStories();
  };

  const productsWithImages = products.filter((p) => p.image_url);

  return (
    <Sheet open={isOpen} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="bottom" className="h-[90vh] overflow-y-auto rounded-t-3xl">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            إدارة الستوريز
          </SheetTitle>
        </SheetHeader>

        {/* الإعدادات */}
        <div className="space-y-3 py-4 border-b">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base">تفعيل الستوريز</Label>
              <p className="text-xs text-muted-foreground">عرض شريط الستوريز للزوار</p>
            </div>
            <Switch
              checked={storiesEnabled}
              onCheckedChange={(v) => onSettingsChange({ stories_enabled: v })}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base">توليد تلقائي</Label>
              <p className="text-xs text-muted-foreground">عند عدم وجود ستوريز يدوية، إنشاء ستوريز من التصنيفات والمنتجات المميزة</p>
            </div>
            <Switch
              checked={autoGenerate}
              onCheckedChange={(v) => onSettingsChange({ stories_auto_generate: v })}
            />
          </div>
        </div>

        {/* زر إضافة */}
        {!showAdd && (
          <Button onClick={() => setShowAdd(true)} className="w-full my-4 gap-2">
            <Plus className="w-4 h-4" /> إضافة ستوري جديد
          </Button>
        )}

        {/* نموذج الإضافة */}
        <AnimatePresence>
          {showAdd && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="space-y-3 my-4 p-4 bg-muted/40 rounded-xl">
                <div className="flex gap-2">
                  <Button
                    variant={formType === "product" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFormType("product")}
                    className="flex-1"
                  >
                    منتج
                  </Button>
                  <Button
                    variant={formType === "custom" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFormType("custom")}
                    className="flex-1"
                  >
                    صورة مخصصة
                  </Button>
                </div>

                {formType === "product" ? (
                  <div>
                    <Label>اختر منتج</Label>
                    <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                      <SelectTrigger><SelectValue placeholder="اختر منتج..." /></SelectTrigger>
                      <SelectContent>
                        {productsWithImages.map((p) => (
                          <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ) : (
                  <div>
                    <Label>رابط الصورة</Label>
                    <Input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://..." dir="ltr" />
                  </div>
                )}

                <div>
                  <Label>عنوان (اختياري)</Label>
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="عرض اليوم..." />
                </div>

                <div>
                  <Label>وصف (اختياري)</Label>
                  <Textarea value={caption} onChange={(e) => setCaption(e.target.value)} rows={2} />
                </div>

                {formType === "custom" && (
                  <div>
                    <Label>رابط (اختياري)</Label>
                    <Input value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} placeholder="https://..." dir="ltr" />
                  </div>
                )}

                <div>
                  <Label>مدة العرض</Label>
                  <Select value={String(expiryDays)} onValueChange={(v) => setExpiryDays(Number(v))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {EXPIRY_OPTIONS.map((o) => (
                        <SelectItem key={o.value} value={String(o.value)}>{o.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleSave} disabled={saving} className="flex-1">
                    {saving ? "جاري الحفظ..." : "حفظ"}
                  </Button>
                  <Button onClick={resetForm} variant="outline">إلغاء</Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* قائمة الستوريز */}
        <div className="space-y-2 pb-8">
          <h3 className="font-semibold text-sm text-muted-foreground">الستوريز الحالية ({stories.length})</h3>
          {loading ? (
            <p className="text-sm text-muted-foreground text-center py-6">جاري التحميل...</p>
          ) : stories.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-30" />
              <p className="text-sm">لا توجد ستوريز يدوية</p>
              {autoGenerate && (
                <p className="text-xs mt-1">يتم العرض التلقائي من التصنيفات والمنتجات المميزة</p>
              )}
            </div>
          ) : (
            stories.map((s) => {
              const expired = new Date(s.expires_at) < new Date();
              const hoursLeft = Math.max(0, Math.round((new Date(s.expires_at).getTime() - Date.now()) / 3600000));
              return (
                <div key={s.id} className={`flex items-center gap-3 p-2 rounded-xl border ${expired ? "opacity-50 bg-destructive/5" : "bg-card"}`}>
                  <div className="w-14 h-14 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                    {s.image_url ? <img src={s.image_url} alt="" className="w-full h-full object-cover" /> : <ImageIcon className="w-6 h-6 m-auto" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{s.title || "بدون عنوان"}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {expired ? "منتهي" : hoursLeft > 24 ? `${Math.round(hoursLeft / 24)} يوم` : `${hoursLeft} ساعة`}
                    </p>
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => handleExtend(s.id, 7)}>
                    +7 أيام
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => handleDelete(s.id)}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              );
            })
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default StoriesManagerSheet;
