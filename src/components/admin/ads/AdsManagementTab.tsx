import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Megaphone, Globe, ImagePlus, Trash2, ToggleLeft, ToggleRight, Upload, Loader2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import GlassCard from "@/components/admin/GlassCard";

interface StoreAdSettings {
  userId: string;
  storeName: string;
  adsEnabled: boolean;
  adsType: string | null;
  customAds: string[];
}

const AdsManagementTab = () => {
  const [stores, setStores] = useState<StoreAdSettings[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [uploadingFor, setUploadingFor] = useState<string | null>(null);

  useEffect(() => {
    fetchStores();
  }, []);

  const fetchStores = async () => {
    try {
      const { data, error } = await supabase
        .from("store_settings")
        .select("user_id, store_name, ads_enabled, ads_type, custom_ads")
        .not("store_name", "is", null)
        .order("store_name");

      if (error) throw error;

      setStores(
        (data || []).map((s: any) => ({
          userId: s.user_id,
          storeName: s.store_name || "بدون اسم",
          adsEnabled: s.ads_enabled || false,
          adsType: s.ads_type || null,
          customAds: Array.isArray(s.custom_ads) ? s.custom_ads : [],
        }))
      );
    } catch (err) {
      console.error(err);
      toast.error("خطأ في جلب بيانات المتاجر");
    } finally {
      setLoading(false);
    }
  };

  const updateStore = async (userId: string, updates: Partial<{ ads_enabled: boolean; ads_type: string | null; custom_ads: string[] }>) => {
    setSaving(userId);
    try {
      const { error } = await supabase
        .from("store_settings")
        .update(updates)
        .eq("user_id", userId);

      if (error) throw error;
      toast.success("تم الحفظ بنجاح");
      
      // تحديث الحالة المحلية
      setStores((prev) =>
        prev.map((s) =>
          s.userId === userId
            ? {
                ...s,
                adsEnabled: updates.ads_enabled ?? s.adsEnabled,
                adsType: updates.ads_type !== undefined ? updates.ads_type : s.adsType,
                customAds: updates.custom_ads ?? s.customAds,
              }
            : s
        )
      );
    } catch (err) {
      console.error(err);
      toast.error("خطأ في الحفظ");
    } finally {
      setSaving(null);
    }
  };

  const handleToggleAds = (store: StoreAdSettings) => {
    const newEnabled = !store.adsEnabled;
    updateStore(store.userId, {
      ads_enabled: newEnabled,
      ads_type: newEnabled ? (store.adsType || "custom") : store.adsType,
    });
  };

  const handleChangeType = (store: StoreAdSettings, type: "google" | "custom") => {
    updateStore(store.userId, { ads_type: type });
  };

  const handleAddImage = async (store: StoreAdSettings, file: File) => {
    setUploadingFor(store.userId);
    try {
      // رفع الصورة إلى Supabase storage
      const fileName = `ads/${store.userId}/${Date.now()}_${file.name}`;
      const { data, error } = await supabase.storage
        .from("banners")
        .upload(fileName, file, { upsert: true });

      if (error) throw error;

      const { data: urlData } = supabase.storage.from("banners").getPublicUrl(data.path);
      const newAds = [...store.customAds, urlData.publicUrl];
      
      await updateStore(store.userId, { custom_ads: newAds });
    } catch (err) {
      console.error(err);
      toast.error("خطأ في رفع الصورة");
    } finally {
      setUploadingFor(null);
    }
  };

  const handleRemoveImage = (store: StoreAdSettings, index: number) => {
    const newAds = store.customAds.filter((_, i) => i !== index);
    updateStore(store.userId, { custom_ads: newAds });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-white/50" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* العنوان */}
      <GlassCard>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
            <Megaphone className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">إدارة الإعلانات</h2>
            <p className="text-white/50 text-sm">تفعيل وإدارة إعلانات المتاجر</p>
          </div>
        </div>
      </GlassCard>

      {/* قائمة المتاجر */}
      <div className="grid gap-4">
        {stores.map((store, idx) => (
          <motion.div
            key={store.userId}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
          >
            <GlassCard>
              <div className="space-y-4">
                {/* رأس البطاقة */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${store.adsEnabled ? "bg-green-400" : "bg-gray-500"}`} />
                    <h3 className="text-white font-bold">{store.storeName}</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <Label className="text-white/60 text-sm">
                      {store.adsEnabled ? "مفعّل" : "متوقف"}
                    </Label>
                    <Switch
                      checked={store.adsEnabled}
                      onCheckedChange={() => handleToggleAds(store)}
                      disabled={saving === store.userId}
                    />
                  </div>
                </div>

                {/* إعدادات الإعلان عند التفعيل */}
                {store.adsEnabled && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="space-y-4 pt-3 border-t border-white/10"
                  >
                    {/* اختيار نوع الإعلان */}
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleChangeType(store, "google")}
                        className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border transition-all ${
                          store.adsType === "google"
                            ? "border-blue-400 bg-blue-500/20 text-blue-300"
                            : "border-white/10 bg-white/5 text-white/50 hover:border-white/20"
                        }`}
                      >
                        <Globe className="w-4 h-4" />
                        <span className="text-sm font-bold">Google AdSense</span>
                      </button>
                      <button
                        onClick={() => handleChangeType(store, "custom")}
                        className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border transition-all ${
                          store.adsType === "custom"
                            ? "border-amber-400 bg-amber-500/20 text-amber-300"
                            : "border-white/10 bg-white/5 text-white/50 hover:border-white/20"
                        }`}
                      >
                        <ImagePlus className="w-4 h-4" />
                        <span className="text-sm font-bold">إعلان مخصص</span>
                      </button>
                    </div>

                    {/* إعلانات مخصصة - رفع الصور */}
                    {store.adsType === "custom" && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label className="text-white/70 text-sm">صور الإعلانات ({store.customAds.length})</Label>
                          <label className="cursor-pointer">
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleAddImage(store, file);
                              }}
                              disabled={uploadingFor === store.userId}
                            />
                            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-300 text-sm font-bold hover:bg-amber-500/30 transition-colors">
                              {uploadingFor === store.userId ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Upload className="w-3.5 h-3.5" />
                              )}
                              إضافة صورة
                            </div>
                          </label>
                        </div>

                        {/* معاينة الصور */}
                        {store.customAds.length > 0 && (
                          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                            {store.customAds.map((url, imgIdx) => (
                              <div key={imgIdx} className="relative group rounded-lg overflow-hidden aspect-video bg-white/5">
                                <img src={url} alt={`إعلان ${imgIdx + 1}`} className="w-full h-full object-cover" />
                                <button
                                  onClick={() => handleRemoveImage(store, imgIdx)}
                                  className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-500/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}

                        {store.customAds.length === 0 && (
                          <div className="text-center py-6 text-white/30 text-sm border border-dashed border-white/10 rounded-xl">
                            لم تتم إضافة صور بعد
                          </div>
                        )}
                      </div>
                    )}

                    {/* معلومة عن Google AdSense */}
                    {store.adsType === "google" && (
                      <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
                        <p className="text-blue-300 text-xs leading-relaxed">
                          💡 لتفعيل إعلانات Google AdSense، يجب إضافة كود الإعلان في إعدادات الموقع.
                          ستحتاج حساب Google AdSense مفعّل ومعتمد.
                        </p>
                      </div>
                    )}
                  </motion.div>
                )}
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default AdsManagementTab;
