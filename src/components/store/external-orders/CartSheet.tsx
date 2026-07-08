import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useCart } from "@/contexts/CartContext";
import {
  Minus, Plus, Trash2, MapPin, Loader2, Map, ShoppingBag,
  ChevronRight, ChevronLeft, Check, User as UserIcon, LogOut,
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import LocationPickerMap from "./LocationPickerMap";
import { logVisitorActivity } from "@/hooks/analytics/useActivityLogger";
import { useCustomerProfile } from "@/hooks/store/useCustomerProfile";
import VisitorPhoneLogin from "./VisitorPhoneLogin";

interface CartSheetProps {
  isOpen: boolean;
  onClose: () => void;
  deliveryFee: number;
  storePhone?: string;
  storeName?: string;
  storeOwnerId?: string;
}

const formatPrice = (price: number) => new Intl.NumberFormat("ar-IQ").format(price);

type Step = 0 | 1 | 2;
const STEP_LABELS = ["السلة", "بياناتك", "تأكيد"];

const CartSheet = ({ isOpen, onClose, deliveryFee, storePhone, storeName, storeOwnerId }: CartSheetProps) => {
  const { items, updateQuantity, removeItem, clearCart, getTotal } = useCart();
  const { user, profile, setProfile, signOut, saveProfile } = useCustomerProfile();

  const [step, setStep] = useState<Step>(0);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [isMapPickerOpen, setIsMapPickerOpen] = useState(false);

  const subtotal = getTotal();
  const total = subtotal + deliveryFee;

  useEffect(() => {
    if (!isOpen) setStep(0);
  }, [isOpen]);

  const requestLocation = () => {
    if (!navigator.geolocation) return toast.error("المتصفح لا يدعم تحديد الموقع");
    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setProfile((p) => ({ ...p, lat: pos.coords.latitude, lng: pos.coords.longitude }));
        setIsGettingLocation(false);
        toast.success("تم تحديد موقعك");
      },
      () => {
        setIsGettingLocation(false);
        toast.error("تعذّر تحديد الموقع، جرّب الخريطة");
      },
      { enableHighAccuracy: false, timeout: 15000, maximumAge: 60000 }
    );
  };

  const canProceed = useMemo(() => {
    if (step === 0) return items.length > 0;
    if (step === 1) return profile.full_name.trim() && profile.phone.trim() && (profile.address.trim() || profile.lat);
    return true;
  }, [step, items.length, profile]);

  const goNext = async () => {
    if (!canProceed) {
      if (step === 0) toast.error("السلة فارغة");
      else toast.error("أكمل الاسم والهاتف والعنوان");
      return;
    }
    if (step === 1 && user) await saveProfile({});
    setStep((s) => (s + 1) as Step);
  };

  const goBack = () => setStep((s) => Math.max(0, s - 1) as Step);

  const handleSubmit = async () => {
    if (!storePhone) return toast.error("رقم واتساب المتجر غير متوفر");

    if (user) await saveProfile({});

    let msg = `*طلب جديد من ${storeName || "المتجر"}*\n\n*المنتجات:*\n`;
    items.forEach((it, i) => {
      msg += `${i + 1}. ${it.product.name}\n   الكمية: ${it.quantity}\n   المجموع: ${formatPrice(it.product.price * it.quantity)} د.ع\n`;
      if (it.notes) msg += `   ملاحظات: ${it.notes}\n`;
      msg += `\n`;
    });
    msg += `*مجموع المنتجات:* ${formatPrice(subtotal)} د.ع\n`;
    msg += `*التوصيل:* ${formatPrice(deliveryFee)} د.ع\n`;
    msg += `*الإجمالي:* ${formatPrice(total)} د.ع\n\n*الزبون:*\n`;
    msg += `الاسم: ${profile.full_name}\nالهاتف: ${profile.phone}\n`;
    if (profile.address) msg += `العنوان: ${profile.address}\n`;
    if (profile.lat && profile.lng) msg += `📍 https://www.google.com/maps?q=${profile.lat},${profile.lng}\n`;
    if (profile.notes) msg += `ملاحظات: ${profile.notes}\n`;

    const cleanPhone = storePhone.replace(/[^0-9]/g, "");
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`, "_blank");

    if (storeOwnerId) logVisitorActivity(storeOwnerId, "checkout", { items_count: items.length, total });

    clearCart();
    setStep(0);
    onClose();
    toast.success("تم إرسال طلبك");
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="bottom" className="h-[92vh] p-0 flex flex-col rounded-t-3xl overflow-hidden">
        {/* Header */}
        <div className="px-5 pt-4 pb-3 border-b bg-gradient-to-b from-background to-muted/30">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                <ShoppingBag className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h2 className="font-bold text-base">إتمام الطلب</h2>
                <p className="text-[11px] text-muted-foreground">{STEP_LABELS[step]}</p>
              </div>
            </div>
            <div className="text-left">
              <p className="text-[11px] text-muted-foreground">الإجمالي</p>
              <p className="font-bold text-primary">{formatPrice(total)} د.ع</p>
            </div>
          </div>

          {/* Stepper */}
          <div className="flex items-center gap-2">
            {STEP_LABELS.map((label, i) => (
              <div key={i} className="flex items-center flex-1">
                <div
                  className={`flex-1 h-1.5 rounded-full transition-all ${
                    i <= step ? "bg-primary" : "bg-muted"
                  }`}
                />
                {i < STEP_LABELS.length - 1 && <div className="w-1" />}
              </div>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div key="s0" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.2 }}>
                {items.length === 0 ? (
                  <div className="text-center py-16">
                    <ShoppingBag className="w-14 h-14 mx-auto text-muted-foreground/40 mb-3" />
                    <p className="text-muted-foreground">سلتك فارغة</p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {items.map((item) => (
                      <div key={item.product.id} className="flex gap-3 p-3 bg-muted/40 rounded-2xl">
                        {item.product.image_url && (
                          <img src={item.product.image_url} alt={item.product.name} className="w-16 h-16 object-cover rounded-xl" />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-semibold text-sm line-clamp-1">{item.product.name}</h4>
                            <button onClick={() => removeItem(item.product.id)} className="text-muted-foreground hover:text-destructive shrink-0">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          <p className="text-xs text-muted-foreground">{formatPrice(item.product.price)} د.ع</p>
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center gap-1 bg-background rounded-full p-1">
                              <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)} className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-muted">
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="w-6 text-center text-sm font-semibold">{item.quantity}</span>
                              <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)} className="w-6 h-6 rounded-full flex items-center justify-center bg-primary text-primary-foreground">
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                            <p className="font-bold text-sm text-primary">{formatPrice(item.product.price * item.quantity)} د.ع</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {step === 1 && (
              <motion.div key="s1" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.2 }} className="space-y-4">
                {/* Auth banner */}
                {!user ? (
                  <VisitorPhoneLogin
                    defaultName={profile.full_name}
                    defaultPhone={profile.phone}
                  />
                ) : (
                  <div className="flex items-center gap-3 p-3 rounded-2xl bg-primary/5 border border-primary/10">
                    {profile.avatar_url ? (
                      <img src={profile.avatar_url} alt="" className="w-10 h-10 rounded-full" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                        <UserIcon className="w-5 h-5 text-primary" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{profile.full_name || "زبون"}</p>
                      <p className="text-[11px] text-muted-foreground truncate">{profile.email}</p>
                    </div>
                    <button onClick={signOut} className="p-2 rounded-lg hover:bg-muted">
                      <LogOut className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </div>
                )}

                <div className="space-y-3">
                  <div>
                    <Label className="text-xs">الاسم *</Label>
                    <Input value={profile.full_name} onChange={(e) => setProfile({ ...profile, full_name: e.target.value })} placeholder="اسمك الكامل" className="mt-1" />
                  </div>
                  <div>
                    <Label className="text-xs">رقم الهاتف *</Label>
                    <Input type="tel" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} placeholder="07XXXXXXXXX" className="mt-1" />
                  </div>

                  {/* Location */}
                  <div>
                    <Label className="text-xs">الموقع الجغرافي</Label>
                    {profile.lat && profile.lng ? (
                      <div className="mt-1 p-3 rounded-xl bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900 flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-green-600" />
                        <span className="text-xs flex-1">تم تحديد الموقع</span>
                        <button onClick={() => setIsMapPickerOpen(true)} className="text-xs text-primary underline">تعديل</button>
                        <button onClick={() => setProfile({ ...profile, lat: null, lng: null })} className="text-xs text-muted-foreground">مسح</button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-2 mt-1">
                        <Button type="button" variant="outline" onClick={requestLocation} disabled={isGettingLocation}>
                          {isGettingLocation ? <Loader2 className="w-4 h-4 animate-spin" /> : <><MapPin className="w-4 h-4 ml-1" />تلقائي</>}
                        </Button>
                        <Button type="button" variant="outline" onClick={() => setIsMapPickerOpen(true)}>
                          <Map className="w-4 h-4 ml-1" />الخريطة
                        </Button>
                      </div>
                    )}
                  </div>

                  <div>
                    <Label className="text-xs">العنوان {!profile.lat && "*"}</Label>
                    <Textarea value={profile.address} onChange={(e) => setProfile({ ...profile, address: e.target.value })} placeholder={profile.lat ? "تفاصيل إضافية (اختياري)" : "أدخل عنوانك"} rows={2} className="mt-1" />
                  </div>
                  <div>
                    <Label className="text-xs">ملاحظات (اختياري)</Label>
                    <Textarea value={profile.notes} onChange={(e) => setProfile({ ...profile, notes: e.target.value })} rows={2} className="mt-1" />
                  </div>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="s2" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.2 }} className="space-y-4">
                <div className="text-center py-2">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                    <Check className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="font-bold">مراجعة أخيرة</h3>
                  <p className="text-xs text-muted-foreground">سيُرسل الطلب عبر واتساب للمتجر</p>
                </div>

                <div className="rounded-2xl border p-4 space-y-3">
                  <div>
                    <p className="text-[11px] text-muted-foreground mb-1">الزبون</p>
                    <p className="text-sm font-semibold">{profile.full_name}</p>
                    <p className="text-xs text-muted-foreground">{profile.phone}</p>
                    {profile.address && <p className="text-xs mt-1">{profile.address}</p>}
                  </div>
                  <div className="border-t pt-3">
                    <p className="text-[11px] text-muted-foreground mb-2">المنتجات ({items.length})</p>
                    <div className="space-y-1 text-xs">
                      {items.map((it) => (
                        <div key={it.product.id} className="flex justify-between">
                          <span className="truncate">{it.quantity}× {it.product.name}</span>
                          <span className="font-semibold shrink-0 mr-2">{formatPrice(it.product.price * it.quantity)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="border-t pt-3 space-y-1 text-xs">
                    <div className="flex justify-between"><span>المنتجات</span><span>{formatPrice(subtotal)} د.ع</span></div>
                    <div className="flex justify-between"><span>التوصيل</span><span>{formatPrice(deliveryFee)} د.ع</span></div>
                    <div className="flex justify-between text-base font-bold text-primary pt-1 border-t"><span>الإجمالي</span><span>{formatPrice(total)} د.ع</span></div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="border-t p-4 flex gap-2 bg-background">
          {step > 0 && (
            <Button variant="outline" onClick={goBack} className="flex-1">
              <ChevronRight className="w-4 h-4 ml-1" /> السابق
            </Button>
          )}
          {step < 2 ? (
            <Button onClick={goNext} className="flex-[2]" disabled={!canProceed}>
              التالي <ChevronLeft className="w-4 h-4 mr-1" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} className="flex-[2] bg-green-600 hover:bg-green-700">
              <Check className="w-4 h-4 ml-1" /> إرسال الطلب
            </Button>
          )}
        </div>

        <LocationPickerMap
          isOpen={isMapPickerOpen}
          onClose={() => setIsMapPickerOpen(false)}
          onLocationSelect={(coords) => {
            setProfile({ ...profile, lat: coords.lat, lng: coords.lng });
            toast.success("تم تحديد الموقع");
          }}
          initialLocation={profile.lat && profile.lng ? { lat: profile.lat, lng: profile.lng } : null}
        />
      </SheetContent>
    </Sheet>
  );
};

export default CartSheet;
