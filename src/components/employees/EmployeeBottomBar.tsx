import { useState } from "react";
import { motion } from "framer-motion";
import { LogOut, ShoppingCart, History } from "lucide-react";
import { Employee } from "@/types/employee";
import { useCart } from "@/contexts/CartContext";
import EmployeeCartSheet from "./EmployeeCartSheet";
import EmployeeOrdersSheet from "./EmployeeOrdersSheet";

interface EmployeeBottomBarProps {
  employee: Employee;
  onLogout: () => void;
  storeOwnerId: string;
  colorTheme?: string | null;
}

const EmployeeBottomBar = ({ 
  employee, 
  onLogout, 
  storeOwnerId,
  colorTheme 
}: EmployeeBottomBarProps) => {
  const [showCart, setShowCart] = useState(false);
  const [showOrders, setShowOrders] = useState(false);
  const { items } = useCart();

  const getThemeColor = () => {
    if (colorTheme?.startsWith('#')) {
      return colorTheme;
    }
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

  const ActionButton = ({
    icon: Icon,
    label,
    onClick,
    badge,
    variant = "default"
  }: {
    icon: React.ElementType;
    label: string;
    onClick: () => void;
    badge?: number;
    variant?: "default" | "danger";
  }) => (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-xl transition-all relative ${
        variant === "danger" 
          ? "bg-red-500/20 text-red-400 hover:bg-red-500/30" 
          : "bg-white/10 text-white hover:bg-white/20"
      }`}
    >
      <Icon className="w-5 h-5" />
      <span className="text-xs font-medium">{label}</span>
      {badge !== undefined && badge > 0 && (
        <span 
          className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center text-white"
          style={{ backgroundColor: themeColor }}
        >
          {badge}
        </span>
      )}
    </motion.button>
  );

  return (
    <>
      {/* الشريط السفلي */}
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="fixed bottom-0 left-0 right-0 z-50 p-3"
      >
        <div 
          className="mx-auto max-w-lg rounded-2xl shadow-2xl border border-white/20 overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${themeColor}dd, ${themeColor}aa)`,
            backdropFilter: 'blur(20px)',
          }}
        >
          {/* معلومات الموظف */}
          <div className="px-4 py-2 border-b border-white/10">
            <p className="text-white text-sm font-medium text-center">
              {employee.full_name}
            </p>
          </div>

          {/* الأزرار */}
          <div className="flex items-center justify-around p-3 gap-2">
            <ActionButton
              icon={LogOut}
              label="خروج"
              onClick={onLogout}
              variant="danger"
            />
            
            <ActionButton
              icon={History}
              label="الفواتير"
              onClick={() => setShowOrders(true)}
            />
            
            <ActionButton
              icon={ShoppingCart}
              label="السلة"
              onClick={() => setShowCart(true)}
              badge={items.length}
            />
          </div>
        </div>
      </motion.div>

      {/* بطاقة السلة */}
      <EmployeeCartSheet
        isOpen={showCart}
        onClose={() => setShowCart(false)}
        storeOwnerId={storeOwnerId}
        employeeId={employee.id}
        colorTheme={colorTheme}
      />

      {/* بطاقة الفواتير */}
      <EmployeeOrdersSheet
        isOpen={showOrders}
        onClose={() => setShowOrders(false)}
        employeeId={employee.id}
        colorTheme={colorTheme}
      />
    </>
  );
};

export default EmployeeBottomBar;
