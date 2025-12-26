import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useCart } from "@/contexts/CartContext";
import { Minus, Plus, Trash2, MapPin, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

interface CartSheetProps {
  isOpen: boolean;
  onClose: () => void;
  deliveryFee: number;
  storePhone?: string;
  storeName?: string;
}

const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('ar-IQ').format(price);
};

const CartSheet = ({ isOpen, onClose, deliveryFee, storePhone, storeName }: CartSheetProps) => {
  const { items, updateQuantity, removeItem, clearCart, getTotal } = useCart();
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [customerNotes, setCustomerNotes] = useState("");
  const [showCheckoutForm, setShowCheckoutForm] = useState(false);
  
  // حالات الموقع الجغرافي
  const [locationCoords, setLocationCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationPermissionDenied, setLocationPermissionDenied] = useState(false);

  const subtotal = getTotal();
  const total = subtotal + deliveryFee;

  // طلب الموقع تلقائياً عند عرض نموذج الدفع
  useEffect(() => {
    if (showCheckoutForm && !locationCoords && !locationPermissionDenied) {
      requestLocation();
    }
  }, [showCheckoutForm]);

  const requestLocation = async () => {
    if (!navigator.geolocation) {
      toast.error("المتصفح لا يدعم تحديد الموقع");
      return;
    }

    setIsGettingLocation(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocationCoords({ lat: latitude, lng: longitude });
        setIsGettingLocation(false);
        toast.success("تم تحديد موقعك بنجاح");
      },
      (error) => {
        setIsGettingLocation(false);
        if (error.code === error.PERMISSION_DENIED) {
          setLocationPermissionDenied(true);
          toast.error("تم رفض صلاحية الموقع. يمكنك إدخال العنوان يدوياً");
        } else {
          toast.error("تعذر تحديد الموقع. يمكنك إدخال العنوان يدوياً");
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  // إنشاء رابط خرائط جوجل
  const getGoogleMapsLink = () => {
    if (!locationCoords) return null;
    return `https://www.google.com/maps?q=${locationCoords.lat},${locationCoords.lng}`;
  };

  const handleCheckout = () => {
    if (items.length === 0) {
      toast.error("السلة فارغة");
      return;
    }
    setShowCheckoutForm(true);
  };

  const handleCompleteOrder = () => {
    if (!customerName.trim() || !customerPhone.trim()) {
      toast.error("الرجاء إدخال الاسم ورقم الهاتف");
      return;
    }

    if (!customerAddress.trim() && !locationCoords) {
      toast.error("الرجاء إدخال العنوان أو السماح بتحديد موقعك");
      return;
    }

    if (!storePhone) {
      toast.error("رقم الواتساب غير متوفر");
      return;
    }

    // تكوين رسالة الواتساب
    let message = `*طلب جديد من ${storeName || 'المتجر'}*\n\n`;
    message += `*المنتجات:*\n`;
    
    items.forEach((item, index) => {
      message += `${index + 1}. ${item.product.name}\n`;
      message += `   الكمية: ${item.quantity}\n`;
      message += `   السعر: ${formatPrice(item.product.price)} د.ع\n`;
      message += `   المجموع: ${formatPrice(item.product.price * item.quantity)} د.ع\n`;
      if (item.notes) {
        message += `   ملاحظات: ${item.notes}\n`;
      }
      message += `\n`;
    });

    message += `*مجموع المنتجات:* ${formatPrice(subtotal)} د.ع\n`;
    message += `*مبلغ التوصيل:* ${formatPrice(deliveryFee)} د.ع\n`;
    message += `*المجموع النهائي:* ${formatPrice(total)} د.ع\n\n`;
    
    message += `*بيانات الزبون:*\n`;
    message += `الاسم: ${customerName}\n`;
    message += `الهاتف: ${customerPhone}\n`;
    
    if (customerAddress.trim()) {
      message += `العنوان: ${customerAddress}\n`;
    }
    
    // إضافة رابط الموقع إذا كان متوفراً
    if (locationCoords) {
      const mapsLink = getGoogleMapsLink();
      message += `📍 الموقع على الخريطة: ${mapsLink}\n`;
    }
    
    if (customerNotes.trim()) {
      message += `ملاحظات: ${customerNotes}\n`;
    }

    // تنظيف رقم الواتساب وإنشاء الرابط
    const cleanPhone = storePhone.replace(/[^0-9]/g, '');
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    
    // فتح الواتساب
    window.open(whatsappUrl, '_blank');
    
    // مسح السلة وإغلاق النافذة
    clearCart();
    setCustomerName("");
    setCustomerPhone("");
    setCustomerAddress("");
    setCustomerNotes("");
    setLocationCoords(null);
    setLocationPermissionDenied(false);
    setShowCheckoutForm(false);
    onClose();
    toast.success("تم إرسال الطلب إلى الواتساب");
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="bottom" className="h-[90vh] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>سلة المشتريات</SheetTitle>
        </SheetHeader>

        {!showCheckoutForm ? (
          <div className="mt-4 space-y-4">
            {items.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                السلة فارغة
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  {items.map((item) => (
                    <div key={item.product.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      {item.product.image_url && (
                        <img 
                          src={item.product.image_url} 
                          alt={item.product.name}
                          className="w-16 h-16 object-cover rounded"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm truncate">{item.product.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {formatPrice(item.product.price)} د.ع
                        </p>
                        {item.notes && (
                          <p className="text-xs text-muted-foreground mt-1">
                            ملاحظات: {item.notes}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-7 w-7"
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="text-sm font-medium w-8 text-center">
                            {item.quantity}
                          </span>
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-7 w-7"
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                          <Button
                            size="icon"
                            variant="destructive"
                            className="h-7 w-7 mr-auto"
                            onClick={() => removeItem(item.product.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-sm">
                          {formatPrice(item.product.price * item.quantity)} د.ع
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>مجموع المنتجات:</span>
                    <span className="font-semibold">{formatPrice(subtotal)} د.ع</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>مبلغ التوصيل:</span>
                    <span className="font-semibold">{formatPrice(deliveryFee)} د.ع</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t pt-2">
                    <span>المجموع النهائي:</span>
                    <span>{formatPrice(total)} د.ع</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      clearCart();
                      onClose();
                    }}
                  >
                    مسح السلة
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={handleCheckout}
                  >
                    إكمال الطلب
                  </Button>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="mt-4 space-y-4">
            <Button
              variant="ghost"
              onClick={() => setShowCheckoutForm(false)}
              className="mb-4"
            >
              ← العودة للسلة
            </Button>

            <div className="space-y-4">
              <div>
                <Label htmlFor="customer-name">الاسم *</Label>
                <Input
                  id="customer-name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="أدخل اسمك"
                />
              </div>

              <div>
                <Label htmlFor="customer-phone">رقم الهاتف *</Label>
                <Input
                  id="customer-phone"
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="أدخل رقم هاتفك"
                />
              </div>

              {/* قسم الموقع الجغرافي */}
              <div className="space-y-2">
                <Label>الموقع الجغرافي</Label>
                
                {isGettingLocation ? (
                  <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                    <span className="text-sm text-blue-700 dark:text-blue-300">
                      جاري تحديد موقعك...
                    </span>
                  </div>
                ) : locationCoords ? (
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-green-500" />
                      <span className="text-sm text-green-700 dark:text-green-300 font-medium">
                        تم تحديد موقعك بنجاح
                      </span>
                    </div>
                    <a
                      href={getGoogleMapsLink() || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 dark:text-blue-400 underline mt-1 block"
                    >
                      عرض الموقع على الخريطة
                    </a>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-2 text-xs h-7"
                      onClick={() => {
                        setLocationCoords(null);
                        setLocationPermissionDenied(false);
                      }}
                    >
                      تغيير الموقع
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={requestLocation}
                      disabled={isGettingLocation}
                    >
                      <MapPin className="h-4 w-4 ml-2" />
                      تحديد موقعي تلقائياً
                    </Button>
                    {locationPermissionDenied && (
                      <p className="text-xs text-amber-600 dark:text-amber-400">
                        تم رفض صلاحية الموقع. يمكنك إدخال العنوان يدوياً أدناه
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="customer-address">
                  العنوان {!locationCoords && '*'}
                </Label>
                <Textarea
                  id="customer-address"
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  placeholder={locationCoords ? "أضف تفاصيل إضافية للعنوان (اختياري)" : "أدخل عنوانك بالتفصيل"}
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="customer-notes">ملاحظات إضافية (اختياري)</Label>
                <Textarea
                  id="customer-notes"
                  value={customerNotes}
                  onChange={(e) => setCustomerNotes(e.target.value)}
                  placeholder="أي ملاحظات إضافية"
                  rows={2}
                />
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>مجموع المنتجات:</span>
                  <span className="font-semibold">{formatPrice(subtotal)} د.ع</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>مبلغ التوصيل:</span>
                  <span className="font-semibold">{formatPrice(deliveryFee)} د.ع</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>المجموع النهائي:</span>
                  <span>{formatPrice(total)} د.ع</span>
                </div>
              </div>

              <Button
                className="w-full"
                onClick={handleCompleteOrder}
                size="lg"
              >
                إكمال إجراءات الطلب
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default CartSheet;
