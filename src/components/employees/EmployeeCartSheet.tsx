import { useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingCart, Minus, Plus, Trash2, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCart } from "@/contexts/CartContext";
import { useTables } from "@/hooks/employees/useTables";
import { useOrders } from "@/hooks/employees/useOrders";
import { toast } from "sonner";
import EmployeeInvoiceSheet from "./EmployeeInvoiceSheet";

interface EmployeeCartSheetProps {
  isOpen: boolean;
  onClose: () => void;
  storeOwnerId: string;
  employeeId: string;
  colorTheme?: string | null;
}

const EmployeeCartSheet = ({ 
  isOpen, 
  onClose, 
  storeOwnerId,
  employeeId,
  colorTheme 
}: EmployeeCartSheetProps) => {
  const { items, updateQuantity, updateNotes, removeItem, clearCart, getTotal } = useCart();
  const { tables } = useTables(storeOwnerId);
  const { createOrder, getOrderWithItems, isCreating } = useOrders();
  
  const [selectedTable, setSelectedTable] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [showInvoice, setShowInvoice] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<any>(null);

  const getThemeColor = () => {
    if (colorTheme?.startsWith('#')) return colorTheme;
    const themeColors: { [key: string]: string } = {
      coral: '#fb923c',
      purple: '#a855f7',
      blue: '#3b82f6',
      green: '#22c55e',
      red: '#ef4444',
    };
    return themeColors[colorTheme || ''] || '#3b82f6';
  };

  const themeColor = getThemeColor();

  const handleCreateOrder = async () => {
    if (!selectedTable || items.length === 0) {
      toast.error("يرجى اختيار طاولة وإضافة منتجات");
      return;
    }

    const order = await createOrder(
      storeOwnerId,
      employeeId,
      selectedTable,
      items,
      customerName || undefined,
      customerPhone || undefined
    );

    if (order) {
      const orderData = await getOrderWithItems(order.id);
      if (orderData) {
        setCurrentOrder(orderData);
        setShowInvoice(true);
        clearCart();
        setSelectedTable("");
        setCustomerName("");
        setCustomerPhone("");
      }
    }
  };

  if (!isOpen) return null;

  const content = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backdropFilter: 'blur(12px)', backgroundColor: 'rgba(0,0,0,0.4)' }}
          onClick={onClose}
        >
          {/* البطاقة */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md max-h-[85vh] flex flex-col relative"
          >
            {/* زر الإغلاق */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="absolute -top-2 -right-2 z-10 w-10 h-10 rounded-full bg-white/20 backdrop-blur-lg border border-white/30 flex items-center justify-center text-white shadow-lg"
            >
              <X className="w-5 h-5" />
            </motion.button>

              {/* البطاقة الزجاجية */}
              <div 
                className="rounded-3xl overflow-hidden shadow-2xl border border-white/20 flex flex-col max-h-full"
                style={{
                  background: `linear-gradient(135deg, ${themeColor}ee, ${themeColor}cc)`,
                  backdropFilter: 'blur(20px)',
                }}
              >
                {/* الرأس */}
                <div className="relative p-4 text-center text-white border-b border-white/10">
                  <div className="mx-auto mb-2 w-12 h-12 rounded-xl bg-white/20 backdrop-blur-lg border border-white/30 flex items-center justify-center">
                    <ShoppingCart className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-xl font-bold">السلة</h2>
                  <p className="text-white/70 text-sm">{items.length} عنصر</p>
                </div>

                {/* المحتوى */}
                <ScrollArea className="flex-1 p-4">
                  {items.length === 0 ? (
                    <div className="text-center py-8 text-white/70">
                      <ShoppingCart className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p>السلة فارغة</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {items.map((item) => (
                        <div 
                          key={item.product.id}
                          className="bg-white/10 backdrop-blur rounded-xl p-3 border border-white/10"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <p className="font-medium text-white">{item.product.name}</p>
                              <p className="text-sm text-white/70">
                                {Number(item.product.price).toFixed(0)} د.ع
                              </p>
                            </div>
                            <button
                              onClick={() => removeItem(item.product.id)}
                              className="p-1 rounded-full hover:bg-red-500/20 text-red-300"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                              className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white hover:bg-white/20"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="w-10 text-center text-white font-medium">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                              className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white hover:bg-white/20"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                            <span className="mr-auto text-white font-bold">
                              {(Number(item.product.price) * item.quantity).toFixed(0)} د.ع
                            </span>
                          </div>

                          <Textarea
                            placeholder="ملاحظات..."
                            value={item.notes || ""}
                            onChange={(e) => updateNotes(item.product.id, e.target.value)}
                            className="mt-2 bg-white/10 border-white/20 text-white placeholder:text-white/50 text-sm resize-none"
                            rows={1}
                          />
                        </div>
                      ))}

                      {/* معلومات الطلب */}
                      <div className="space-y-3 pt-4 border-t border-white/10">
                        <div>
                          <Label className="text-white/80 text-sm">الطاولة *</Label>
                          <Select value={selectedTable} onValueChange={setSelectedTable}>
                            <SelectTrigger className="bg-white/10 border-white/20 text-white mt-1">
                              <SelectValue placeholder="اختر الطاولة" />
                            </SelectTrigger>
                            <SelectContent>
                              {tables
                                .filter(t => !t.is_occupied)
                                .map((table) => (
                                  <SelectItem key={table.id} value={table.id}>
                                    طاولة {table.table_number}
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label className="text-white/80 text-sm">اسم الزبون</Label>
                          <Input
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                            placeholder="اسم الزبون (اختياري)"
                            className="bg-white/10 border-white/20 text-white placeholder:text-white/50 mt-1"
                          />
                        </div>

                        <div>
                          <Label className="text-white/80 text-sm">رقم الهاتف</Label>
                          <Input
                            value={customerPhone}
                            onChange={(e) => setCustomerPhone(e.target.value)}
                            placeholder="رقم الهاتف (اختياري)"
                            className="bg-white/10 border-white/20 text-white placeholder:text-white/50 mt-1"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </ScrollArea>

                {/* الإجمالي وزر الإنشاء */}
                {items.length > 0 && (
                  <div className="p-4 border-t border-white/10 space-y-3">
                    <div className="flex items-center justify-between text-white">
                      <span className="text-lg">الإجمالي:</span>
                      <span className="text-2xl font-bold">{getTotal().toFixed(0)} د.ع</span>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={clearCart}
                        className="flex-1 bg-white/10 border-white/20 text-white hover:bg-white/20"
                      >
                        <Trash2 className="w-4 h-4 ml-2" />
                        إفراغ
                      </Button>
                      <Button
                        onClick={handleCreateOrder}
                        disabled={!selectedTable || isCreating}
                        className="flex-1 bg-white text-gray-900 hover:bg-white/90"
                      >
                        <ClipboardList className="w-4 h-4 ml-2" />
                        {isCreating ? "جاري..." : "إنشاء طلب"}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
          </motion.div>
        </motion.div>
      )}

      {/* الفاتورة */}
      <EmployeeInvoiceSheet
        isOpen={showInvoice}
        onClose={() => {
          setShowInvoice(false);
          onClose();
        }}
        order={currentOrder?.order}
        items={currentOrder?.items || []}
        colorTheme={colorTheme}
      />
    </AnimatePresence>
  );

  return createPortal(content, document.body);
};

export default EmployeeCartSheet;
