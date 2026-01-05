import React, { useState } from "react";
import { motion } from "framer-motion";
import { ShoppingCart, LogOut, ClipboardList, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Employee } from "@/types/employee";
import { useCart } from "@/contexts/CartContext";
import { useTables } from "@/hooks/employees/useTables";
import { useOrders } from "@/hooks/employees/useOrders";
import EmployeeCartCard from "./EmployeeCartCard";
import EmployeeOrdersCard from "./EmployeeOrdersCard";
import { toast } from "sonner";

interface EmployeeActionsBarProps {
  employee: Employee;
  storeOwnerId: string;
  colorTheme?: string | null;
  onLogout: () => void;
  searchQuery: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClearSearch: () => void;
}

const EmployeeActionsBar: React.FC<EmployeeActionsBarProps> = ({
  employee,
  storeOwnerId,
  colorTheme,
  onLogout,
  searchQuery,
  onSearchChange,
  onClearSearch,
}) => {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isOrdersOpen, setIsOrdersOpen] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { items, updateQuantity, updateNotes, removeItem, clearCart, getTotal } = useCart();
  const { tables } = useTables(storeOwnerId);
  const { createOrder } = useOrders(storeOwnerId, employee.id);

  const getThemeColor = () => {
    if (colorTheme?.startsWith('#')) return colorTheme;
    const themeColors: { [key: string]: string } = {
      coral: 'rgb(251, 146, 60)',
      purple: 'rgb(168, 85, 247)',
      blue: 'rgb(59, 130, 246)',
      green: 'rgb(34, 197, 94)',
      red: 'rgb(239, 68, 68)',
    };
    return themeColors[colorTheme || ''] || 'rgb(59, 130, 246)';
  };

  const themeColor = getThemeColor();

  const handleSubmitOrder = async (tableId: string | null, notes?: string) => {
    if (items.length === 0) {
      toast.error("السلة فارغة");
      return;
    }

    setIsSubmitting(true);
    try {
      const orderItems = items.map(item => ({
        product_id: item.product.id,
        product_name: item.product.name,
        quantity: item.quantity,
        unit_price: Number(item.product.price),
        subtotal: Number(item.product.price) * item.quantity,
        notes: item.notes,
      }));

      const table = tables.find(t => t.id === tableId);

      await createOrder({
        employee_id: employee.id,
        table_id: tableId,
        table_number: table?.table_number || null,
        total_amount: getTotal(),
        notes,
        items: orderItems,
      });

      clearCart();
      setIsCartOpen(false);
      toast.success("تم إرسال الطلب بنجاح");
    } catch (error) {
      console.error("Error creating order:", error);
      toast.error("حدث خطأ أثناء إرسال الطلب");
    } finally {
      setIsSubmitting(false);
    }
  };

  const ActionButton = ({ 
    onClick, 
    icon: Icon, 
    label, 
    gradient,
    badge
  }: { 
    onClick: () => void; 
    icon: React.ElementType; 
    label: string; 
    gradient: string;
    badge?: number;
  }) => (
    <motion.div
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.92 }}
    >
      <div
        onClick={onClick}
        className="relative flex items-center justify-center w-10 h-10 rounded-xl shadow-md cursor-pointer transition-all"
        style={{
          background: gradient,
          border: '1px solid rgba(255,255,255,0.2)',
        }}
        title={label}
      >
        <Icon className="h-5 w-5 text-white" />
        {badge && badge > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center text-[10px] font-bold bg-white text-red-500 rounded-full shadow-md">
            {badge}
          </span>
        )}
      </div>
    </motion.div>
  );

  return (
    <>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ 
          type: "spring",
          stiffness: 260,
          damping: 20,
          delay: 0.2 
        }}
        className="fixed bottom-0 left-0 right-0 z-40 pb-safe"
        style={{ direction: 'ltr' }}
      >
        {/* معلومات الموظف */}
        <div 
          className="text-center py-1 text-xs text-white/90"
          style={{ background: `${themeColor}dd` }}
        >
          👤 {employee.full_name}
        </div>

        {/* الشريط الزجاجي */}
        <div
          className="backdrop-blur-xl border-t shadow-2xl"
          style={{
            background: `linear-gradient(180deg, ${themeColor}08, ${themeColor}12)`,
            borderColor: `${themeColor}25`,
          }}
        >
          <div className="container mx-auto px-4 sm:px-6 py-2.5">
            <div className="flex items-center justify-center gap-3 sm:gap-4 max-w-lg mx-auto">
              
              {/* زر/حقل البحث */}
              {isSearchExpanded ? (
                <motion.div 
                  initial={{ width: 40, opacity: 0 }}
                  animate={{ width: "100%", opacity: 1 }}
                  exit={{ width: 40, opacity: 0 }}
                  className="flex-1 relative min-w-0"
                >
                  <Search className="absolute right-2.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none z-10" />
                  <Input
                    type="text"
                    placeholder="ابحث..."
                    value={searchQuery}
                    onChange={onSearchChange}
                    autoFocus
                    className="pr-8 pl-8 h-10 rounded-xl border-0 text-sm"
                    style={{
                      background: `${themeColor}10`,
                      backdropFilter: 'blur(10px)',
                    }}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      onClearSearch();
                      setIsSearchExpanded(false);
                    }}
                    className="absolute left-1 top-1/2 transform -translate-y-1/2 h-7 w-7 z-10"
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </motion.div>
              ) : (
                <motion.div
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.92 }}
                >
                  <div
                    onClick={() => setIsSearchExpanded(true)}
                    className="flex items-center justify-center w-10 h-10 rounded-xl shadow-md cursor-pointer transition-all"
                    style={{
                      background: `${themeColor}20`,
                      border: '1px solid rgba(255,255,255,0.1)',
                    }}
                    title="بحث"
                  >
                    <Search className="h-5 w-5" style={{ color: themeColor }} />
                  </div>
                </motion.div>
              )}

              {/* الأزرار */}
              <div className="flex items-center gap-3 sm:gap-4">
                {/* زر السلة */}
                <ActionButton
                  onClick={() => setIsCartOpen(true)}
                  icon={ShoppingCart}
                  label="السلة"
                  gradient={`linear-gradient(135deg, #22c55e, #16a34a)`}
                  badge={items.length}
                />

                {/* زر الطلبات */}
                <ActionButton
                  onClick={() => setIsOrdersOpen(true)}
                  icon={ClipboardList}
                  label="الطلبات"
                  gradient={`linear-gradient(135deg, #3b82f6, #2563eb)`}
                />

                {/* زر تسجيل الخروج */}
                <ActionButton
                  onClick={onLogout}
                  icon={LogOut}
                  label="خروج"
                  gradient={`linear-gradient(135deg, #ef4444, #dc2626)`}
                />
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* بطاقة السلة */}
      <EmployeeCartCard
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        colorTheme={colorTheme}
        items={items}
        onUpdateQuantity={updateQuantity}
        onUpdateNotes={updateNotes}
        onRemoveItem={removeItem}
        onClearCart={clearCart}
        total={getTotal()}
        tables={tables}
        onSubmitOrder={handleSubmitOrder}
        isSubmitting={isSubmitting}
      />

      {/* بطاقة الطلبات */}
      <EmployeeOrdersCard
        isOpen={isOrdersOpen}
        onClose={() => setIsOrdersOpen(false)}
        colorTheme={colorTheme}
        storeOwnerId={storeOwnerId}
        employeeId={employee.id}
      />
    </>
  );
};

export default EmployeeActionsBar;
