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
      {/* الشريط السفلي المصغر */}
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="fixed bottom-2 left-2 right-2 z-50"
      >
        <div 
          className="mx-auto max-w-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${themeColor}ee, ${themeColor}cc)`,
            backdropFilter: 'blur(20px)',
          }}
        >
          {/* صف واحد يجمع الاسم والأزرار */}
          <div className="flex items-center justify-between px-3 py-2">
            <p className="text-white text-xs font-medium truncate max-w-[100px]">
              {employee.full_name}
            </p>

            <div className="flex items-center gap-1">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={onLogout}
                className="w-9 h-9 rounded-xl bg-red-500/30 text-red-200 flex items-center justify-center"
              >
                <LogOut className="w-4 h-4" />
              </motion.button>
              
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowOrders(true)}
                className="w-9 h-9 rounded-xl bg-white/15 text-white flex items-center justify-center"
              >
                <History className="w-4 h-4" />
              </motion.button>
              
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowCart(true)}
                className="w-9 h-9 rounded-xl bg-white/15 text-white flex items-center justify-center relative"
              >
                <ShoppingCart className="w-4 h-4" />
                {items.length > 0 && (
                  <span 
                    className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center text-white"
                    style={{ backgroundColor: themeColor }}
                  >
                    {items.length}
                  </span>
                )}
              </motion.button>
            </div>
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
