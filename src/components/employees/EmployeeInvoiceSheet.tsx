import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Receipt, Printer, Calendar, User, Phone, Table } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Order, OrderItem } from "@/types/employee";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

interface EmployeeInvoiceSheetProps {
  isOpen: boolean;
  onClose: () => void;
  order?: Order;
  items: OrderItem[];
  colorTheme?: string | null;
}

const EmployeeInvoiceSheet = ({ 
  isOpen, 
  onClose, 
  order,
  items,
  colorTheme 
}: EmployeeInvoiceSheetProps) => {
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

  const handlePrint = () => {
    window.print();
  };

  if (!isOpen || !order) return null;

  const content = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 print:p-0 print:inset-auto"
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
            className="w-full max-w-md max-h-[90vh] flex flex-col relative print:max-w-none print:max-h-none"
            id="invoice-print-content"
          >
            {/* زر الإغلاق */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="absolute -top-2 -right-2 z-10 w-10 h-10 rounded-full bg-white/20 backdrop-blur-lg border border-white/30 flex items-center justify-center text-white shadow-lg print:hidden"
            >
              <X className="w-5 h-5" />
            </motion.button>

            {/* البطاقة الزجاجية */}
            <div 
              className="rounded-3xl overflow-hidden shadow-2xl border border-white/20 flex flex-col max-h-full bg-white print:rounded-none print:shadow-none print:border-none"
              >
              {/* الرأس الملون */}
              <div 
                className="relative p-4 text-center text-white print:text-black print:bg-white"
                style={{ backgroundColor: themeColor }}
              >
                <div className="mx-auto mb-2 w-12 h-12 rounded-xl bg-white/20 backdrop-blur-lg border border-white/30 flex items-center justify-center print:bg-gray-100 print:border-gray-300">
                  <Receipt className="w-6 h-6 text-white print:text-black" />
                </div>
                <h2 className="text-xl font-bold">الفاتورة</h2>
                <p className="text-white/80 text-sm print:text-gray-600">#{order.id.slice(0, 8)}</p>
              </div>

                {/* معلومات الطلب */}
                <div className="p-4 border-b bg-gray-50">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {format(new Date(order.created_at || new Date()), "dd/MM/yyyy - hh:mm a", { locale: ar })}
                      </span>
                    </div>
                    {order.table_number && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Table className="w-4 h-4" />
                        <span>طاولة {order.table_number}</span>
                      </div>
                    )}
                    {order.customer_name && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <User className="w-4 h-4" />
                        <span>{order.customer_name}</span>
                      </div>
                    )}
                    {order.customer_phone && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Phone className="w-4 h-4" />
                        <span>{order.customer_phone}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* العناصر */}
                <ScrollArea className="flex-1 p-4">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-right py-2 font-medium text-gray-600">المنتج</th>
                        <th className="text-center py-2 font-medium text-gray-600">الكمية</th>
                        <th className="text-center py-2 font-medium text-gray-600">السعر</th>
                        <th className="text-left py-2 font-medium text-gray-600">المجموع</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item) => (
                        <tr key={item.id} className="border-b border-gray-100">
                          <td className="py-3">
                            <p className="font-medium">{item.product_name}</p>
                            {item.notes && (
                              <p className="text-xs text-gray-500">{item.notes}</p>
                            )}
                          </td>
                          <td className="text-center py-3">{item.quantity}</td>
                          <td className="text-center py-3">{Number(item.unit_price).toFixed(0)}</td>
                          <td className="text-left py-3 font-medium">{Number(item.subtotal).toFixed(0)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </ScrollArea>

                {/* الإجمالي */}
                <div className="p-4 border-t bg-gray-50">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">المجموع الفرعي:</span>
                      <span>{Number(order.total_amount || 0).toFixed(0)} د.ع</span>
                    </div>
                    {order.discount_amount && Number(order.discount_amount) > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>الخصم:</span>
                        <span>-{Number(order.discount_amount).toFixed(0)} د.ع</span>
                      </div>
                    )}
                    {order.tax_amount && Number(order.tax_amount) > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">الضريبة:</span>
                        <span>{Number(order.tax_amount).toFixed(0)} د.ع</span>
                      </div>
                    )}
                    <div className="flex justify-between text-lg font-bold pt-2 border-t">
                      <span>الإجمالي:</span>
                      <span style={{ color: themeColor }}>{Number(order.final_amount || 0).toFixed(0)} د.ع</span>
                    </div>
                  </div>
                </div>

              {/* زر الطباعة */}
              <div className="p-4 print:hidden">
                <Button
                  onClick={handlePrint}
                  className="w-full"
                  style={{ backgroundColor: themeColor }}
                >
                  <Printer className="w-4 h-4 ml-2" />
                  طباعة الفاتورة
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return createPortal(content, document.body);
};

export default EmployeeInvoiceSheet;
