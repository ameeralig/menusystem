import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Receipt, Calendar, DollarSign, Eye } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useOrders } from "@/hooks/employees/useOrders";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import EmployeeInvoiceSheet from "./EmployeeInvoiceSheet";

interface EmployeeOrdersSheetProps {
  isOpen: boolean;
  onClose: () => void;
  employeeId: string;
  colorTheme?: string | null;
}

const EmployeeOrdersSheet = ({ 
  isOpen, 
  onClose, 
  employeeId,
  colorTheme 
}: EmployeeOrdersSheetProps) => {
  const { getEmployeeOrders, getOrderWithItems } = useOrders();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [showInvoice, setShowInvoice] = useState(false);

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

  useEffect(() => {
    if (isOpen && employeeId) {
      loadOrders();
    }
  }, [isOpen, employeeId]);

  const loadOrders = async () => {
    setLoading(true);
    const data = await getEmployeeOrders(employeeId);
    setOrders(data || []);
    setLoading(false);
  };

  const handleViewOrder = async (order: any) => {
    const orderData = await getOrderWithItems(order.id);
    if (orderData) {
      setSelectedOrder(orderData);
      setShowInvoice(true);
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
                    <Receipt className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-xl font-bold">سجل الفواتير</h2>
                  <p className="text-white/70 text-sm">{orders.length} فاتورة</p>
                </div>

                {/* المحتوى */}
                <ScrollArea className="flex-1 p-4">
                  {loading ? (
                    <div className="text-center py-8 text-white/70">
                      <div className="animate-spin w-8 h-8 border-2 border-white/30 border-t-white rounded-full mx-auto mb-4" />
                      <p>جاري التحميل...</p>
                    </div>
                  ) : orders.length === 0 ? (
                    <div className="text-center py-8 text-white/70">
                      <Receipt className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p>لا توجد فواتير</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {orders.map((order) => (
                        <motion.div
                          key={order.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-white/10 backdrop-blur rounded-xl p-4 border border-white/10"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <p className="font-medium text-white text-sm">
                                #{order.id.slice(0, 8)}
                              </p>
                              {order.table_number && (
                                <p className="text-white/60 text-xs">
                                  طاولة {order.table_number}
                                </p>
                              )}
                            </div>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleViewOrder(order)}
                              className="px-3 py-1.5 rounded-lg bg-white/20 text-white text-xs font-medium flex items-center gap-1 hover:bg-white/30"
                            >
                              <Eye className="w-3 h-3" />
                              عرض
                            </motion.button>
                          </div>

                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-1 text-white/60">
                              <Calendar className="w-3 h-3" />
                              <span className="text-xs">
                                {format(new Date(order.created_at), "dd/MM - hh:mm a", { locale: ar })}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 text-green-300 font-bold">
                              <DollarSign className="w-3 h-3" />
                              <span>{Number(order.final_amount || 0).toFixed(0)} د.ع</span>
                            </div>
                          </div>

                          {order.customer_name && (
                            <p className="text-white/50 text-xs mt-2">
                              العميل: {order.customer_name}
                            </p>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </div>
          </motion.div>
        </motion.div>
      )}

      {/* عرض الفاتورة */}
      <EmployeeInvoiceSheet
        isOpen={showInvoice}
        onClose={() => setShowInvoice(false)}
        order={selectedOrder?.order}
        items={selectedOrder?.items || []}
        colorTheme={colorTheme}
      />
    </AnimatePresence>
  );

  return createPortal(content, document.body);
};

export default EmployeeOrdersSheet;
