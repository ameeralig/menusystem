import React, { useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingCart, Minus, Plus, Trash2, Send, UtensilsCrossed } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CartItem } from "@/hooks/employees/useCart";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table } from "@/types/employee";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface EmployeeCartCardProps {
  isOpen: boolean;
  onClose: () => void;
  colorTheme?: string | null;
  items: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onUpdateNotes: (productId: string, notes: string) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
  total: number;
  tables?: Table[];
  onSubmitOrder: (tableId: string | null, notes?: string) => void;
  isSubmitting?: boolean;
}

const EmployeeCartCard: React.FC<EmployeeCartCardProps> = ({
  isOpen,
  onClose,
  colorTheme,
  items,
  onUpdateQuantity,
  onUpdateNotes,
  onRemoveItem,
  onClearCart,
  total,
  tables = [],
  onSubmitOrder,
  isSubmitting = false,
}) => {
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [orderNotes, setOrderNotes] = useState("");

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

  const handleSubmit = () => {
    onSubmitOrder(selectedTable, orderNotes);
    setOrderNotes("");
    setSelectedTable(null);
  };

  if (!isOpen) return null;

  const content = (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* الخلفية الضبابية */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 backdrop-blur-md bg-black/40"
          />

          {/* البطاقة العائمة */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="pointer-events-auto w-full max-w-lg max-h-[90vh] overflow-hidden">
              {/* زر الإغلاق */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/20 backdrop-blur-lg border border-white/30 flex items-center justify-center text-white shadow-lg"
              >
                <X className="w-5 h-5" />
              </motion.button>

              {/* البطاقة الزجاجية */}
              <div 
                className="rounded-3xl overflow-hidden shadow-2xl border border-white/20"
                style={{
                  background: `linear-gradient(135deg, ${themeColor}ee, ${themeColor}cc)`,
                  backdropFilter: 'blur(20px)',
                }}
              >
                {/* تأثير الإضاءة العلوي */}
                <div 
                  className="absolute top-0 left-0 right-0 h-32 opacity-30 pointer-events-none"
                  style={{
                    background: 'linear-gradient(180deg, rgba(255,255,255,0.4) 0%, transparent 100%)',
                  }}
                />

                {/* محتوى البطاقة */}
                <div className="relative p-6 text-white">
                  {/* العنوان */}
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-4"
                  >
                    <div className="mx-auto mb-3 w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-lg border border-white/30 flex items-center justify-center">
                      <ShoppingCart className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-xl font-bold">سلة الطلبات</h2>
                    <p className="text-white/70 text-sm mt-1">
                      {items.length} منتج • {total.toFixed(0)} د.ع
                    </p>
                  </motion.div>

                  {/* قائمة المنتجات */}
                  {items.length === 0 ? (
                    <div className="text-center py-8 text-white/60">
                      <ShoppingCart className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>السلة فارغة</p>
                    </div>
                  ) : (
                    <>
                      <ScrollArea className="max-h-[35vh] mb-4">
                        <div className="space-y-3 pr-2">
                          {items.map((item) => (
                            <motion.div
                              key={item.product.id}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              className="p-3 rounded-xl bg-white/10 backdrop-blur"
                            >
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex-1">
                                  <p className="font-medium text-sm">{item.product.name}</p>
                                  <p className="text-white/60 text-xs">
                                    {Number(item.product.price).toFixed(0)} د.ع
                                  </p>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => onRemoveItem(item.product.id)}
                                  className="h-7 w-7 text-red-300 hover:bg-red-500/20 hover:text-red-200"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>

                              <div className="flex items-center gap-2 mb-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                                  className="h-7 w-7 bg-white/10 hover:bg-white/20 text-white"
                                >
                                  <Minus className="h-3 w-3" />
                                </Button>
                                <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                                  className="h-7 w-7 bg-white/10 hover:bg-white/20 text-white"
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                                <span className="mr-auto text-sm font-medium">
                                  {(Number(item.product.price) * item.quantity).toFixed(0)} د.ع
                                </span>
                              </div>

                              <Input
                                placeholder="ملاحظات..."
                                value={item.notes || ""}
                                onChange={(e) => onUpdateNotes(item.product.id, e.target.value)}
                                className="h-8 text-xs bg-white/10 border-white/20 text-white placeholder:text-white/40"
                              />
                            </motion.div>
                          ))}
                        </div>
                      </ScrollArea>

                      {/* اختيار الطاولة */}
                      {tables.length > 0 && (
                        <div className="mb-3">
                          <Label className="text-white/80 text-sm">الطاولة</Label>
                          <Select value={selectedTable || ""} onValueChange={setSelectedTable}>
                            <SelectTrigger className="mt-1 bg-white/10 border-white/20 text-white">
                              <SelectValue placeholder="اختر طاولة (اختياري)">
                                {selectedTable ? (
                                  <span className="flex items-center gap-2">
                                    <UtensilsCrossed className="h-4 w-4" />
                                    طاولة {tables.find(t => t.id === selectedTable)?.table_number}
                                  </span>
                                ) : (
                                  "اختر طاولة (اختياري)"
                                )}
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                              {tables.filter(t => !t.is_occupied).map((table) => (
                                <SelectItem key={table.id} value={table.id}>
                                  طاولة {table.table_number} (سعة: {table.capacity})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}

                      {/* ملاحظات الطلب */}
                      <div className="mb-4">
                        <Label className="text-white/80 text-sm">ملاحظات الطلب</Label>
                        <Textarea
                          value={orderNotes}
                          onChange={(e) => setOrderNotes(e.target.value)}
                          className="mt-1 bg-white/10 border-white/20 text-white placeholder:text-white/40 min-h-[60px]"
                          placeholder="ملاحظات إضافية للطلب..."
                        />
                      </div>

                      {/* المجموع والأزرار */}
                      <div className="border-t border-white/20 pt-4 space-y-3">
                        <div className="flex items-center justify-between text-lg font-bold">
                          <span>المجموع:</span>
                          <span>{total.toFixed(0)} د.ع</span>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            onClick={handleSubmit}
                            disabled={isSubmitting || items.length === 0}
                            className="flex-1 bg-green-500 hover:bg-green-600 text-white"
                          >
                            <Send className="h-4 w-4 ml-2" />
                            {isSubmitting ? "جاري الإرسال..." : "إرسال الطلب"}
                          </Button>
                          <Button
                            onClick={onClearCart}
                            variant="outline"
                            className="bg-white/10 border-white/30 text-white hover:bg-white/20"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  return createPortal(content, document.body);
};

export default EmployeeCartCard;
