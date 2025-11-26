import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useCart } from "@/contexts/CartContext";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
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

  const subtotal = getTotal();
  const total = subtotal + deliveryFee;

  const handleCheckout = () => {
    if (items.length === 0) {
      toast.error("السلة فارغة");
      return;
    }
    setShowCheckoutForm(true);
  };

  const handleCompleteOrder = () => {
    if (!customerName.trim() || !customerPhone.trim() || !customerAddress.trim()) {
      toast.error("الرجاء إدخال جميع البيانات المطلوبة");
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
    message += `العنوان: ${customerAddress}\n`;
    
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

              <div>
                <Label htmlFor="customer-address">العنوان *</Label>
                <Textarea
                  id="customer-address"
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  placeholder="أدخل عنوانك بالتفصيل"
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
