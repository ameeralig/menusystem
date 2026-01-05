import React from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, ClipboardList, Clock, CheckCircle } from "lucide-react";
import { useOrders } from "@/hooks/employees/useOrders";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";

interface EmployeeOrdersCardProps {
  isOpen: boolean;
  onClose: () => void;
  colorTheme?: string | null;
  storeOwnerId: string;
  employeeId: string;
}

const EmployeeOrdersCard: React.FC<EmployeeOrdersCardProps> = ({
  isOpen,
  onClose,
  colorTheme,
  storeOwnerId,
  employeeId,
}) => {
  const { orders, isLoading } = useOrders(storeOwnerId, employeeId);

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

  const getStatusBadge = (status: string) => {
    const statusConfig: { [key: string]: { label: string; color: string } } = {
      pending: { label: 'قيد الانتظار', color: 'bg-yellow-500/80' },
      preparing: { label: 'جاري التحضير', color: 'bg-blue-500/80' },
      ready: { label: 'جاهز', color: 'bg-green-500/80' },
      completed: { label: 'مكتمل', color: 'bg-gray-500/80' },
      cancelled: { label: 'ملغي', color: 'bg-red-500/80' },
    };
    const config = statusConfig[status] || statusConfig.pending;
    return <Badge className={config.color}>{config.label}</Badge>;
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
            <div className="pointer-events-auto w-full max-w-lg max-h-[85vh] overflow-hidden">
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
                      <ClipboardList className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-xl font-bold">طلباتي</h2>
                    <p className="text-white/70 text-sm mt-1">
                      {orders.length} طلب
                    </p>
                  </motion.div>

                  {/* قائمة الطلبات */}
                  {isLoading ? (
                    <div className="flex justify-center py-8">
                      <Spinner className="h-6 w-6 text-white" />
                    </div>
                  ) : orders.length === 0 ? (
                    <div className="text-center py-8 text-white/60">
                      <ClipboardList className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>لا توجد طلبات بعد</p>
                    </div>
                  ) : (
                    <ScrollArea className="max-h-[50vh]">
                      <div className="space-y-3 pr-2">
                        {orders.map((order) => (
                          <motion.div
                            key={order.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="p-4 rounded-xl bg-white/10 backdrop-blur"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <div className="flex items-center gap-2">
                                  {order.table_number && (
                                    <span className="text-sm font-medium">
                                      طاولة {order.table_number}
                                    </span>
                                  )}
                                  {getStatusBadge(order.status || 'pending')}
                                </div>
                                <p className="text-white/60 text-xs mt-1 flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {formatDistanceToNow(new Date(order.created_at), { 
                                    addSuffix: true, 
                                    locale: ar 
                                  })}
                                </p>
                              </div>
                              <span className="font-bold">
                                {order.final_amount?.toFixed(0) || order.total_amount?.toFixed(0)} د.ع
                              </span>
                            </div>

                            {order.notes && (
                              <p className="text-white/60 text-xs mt-2 bg-white/5 rounded-lg p-2">
                                {order.notes}
                              </p>
                            )}
                          </motion.div>
                        ))}
                      </div>
                    </ScrollArea>
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

export default EmployeeOrdersCard;
