import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Settings, Plus, Moon, Sun, ShoppingBag, DollarSign, Info, Eye, BarChart3, LogOut, Users, Cloud, Layout } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import ProfileSheet from "./ProfileSheet";
import StoreStatsCard from "../stats/StoreStatsCard";
import EmployeeManagementCard from "../employees/EmployeeManagementCard";
import ProductImageMigrationCard from "./ProductImageMigrationCard";

interface StoreOwnerActionsMenuProps {
  storeOwnerId: string;
  colorTheme?: string | null;
  onAddProduct: () => void;
  onUpdate?: () => void;
  onOpenInfo?: () => void;
  onOpenFeedback?: () => void;
  hasContactInfo?: boolean;
}

const StoreOwnerActionsMenu = ({
  storeOwnerId,
  colorTheme,
  onAddProduct,
  onUpdate,
  onOpenInfo,
  onOpenFeedback,
  hasContactInfo = false,
}: StoreOwnerActionsMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [externalOrdersEnabled, setExternalOrdersEnabled] = useState(false);
  const [deliveryFee, setDeliveryFee] = useState("0");
  const [isLoading, setIsLoading] = useState(false);
  const [showDeliveryFee, setShowDeliveryFee] = useState(false);
  const [showStatsCard, setShowStatsCard] = useState(false);
  const [showEmployeeCard, setShowEmployeeCard] = useState(false);
  const [showMigrationCard, setShowMigrationCard] = useState(false);
  const [employeeSystemEnabled, setEmployeeSystemEnabled] = useState(false);
  const [currentTemplate, setCurrentTemplate] = useState("fast-response");

  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabase
        .from("store_settings")
        .select("dark_mode, external_orders_enabled, delivery_fee, employee_system_enabled, template")
        .eq("user_id", storeOwnerId)
        .maybeSingle();

      if (data) {
        setDarkMode(data.dark_mode || false);
        setExternalOrdersEnabled(data.external_orders_enabled || false);
        setDeliveryFee(data.delivery_fee?.toString() || "0");
        setEmployeeSystemEnabled(data.employee_system_enabled || false);
        setCurrentTemplate(data.template || "fast-response");
      }
    };

    fetchSettings();
  }, [storeOwnerId]);

  const getThemeColor = () => {
    if (colorTheme?.startsWith('#')) return colorTheme;
    
    const themeColors: { [key: string]: string } = {
      coral: '#ff9178',
      purple: '#8b5cf6',
      blue: '#3b82f6',
      green: '#10b981',
      pink: '#ec4899',
      teal: '#14b8a6',
      amber: '#f59e0b',
      indigo: '#6366f1',
      rose: '#f43f5e',
    };
    
    return themeColors[colorTheme || ''] || '#3b82f6';
  };

  const handleDarkModeToggle = async (checked: boolean) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("store_settings")
        .update({ dark_mode: checked })
        .eq("user_id", storeOwnerId);

      if (error) throw error;

      setDarkMode(checked);
      toast.success(checked ? "تم تفعيل الوضع الداكن" : "تم تفعيل الوضع الفاتح");
      onUpdate?.();
    } catch (error) {
      console.error("Error toggling dark mode:", error);
      toast.error("فشل تبديل الوضع");
    } finally {
      setIsLoading(false);
    }
  };

  const handleExternalOrdersToggle = async (checked: boolean) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("store_settings")
        .update({ external_orders_enabled: checked })
        .eq("user_id", storeOwnerId);

      if (error) throw error;

      setExternalOrdersEnabled(checked);
      toast.success(checked ? "تم تفعيل الطلبات الخارجية" : "تم إيقاف الطلبات الخارجية");
      
      if (checked) {
        setShowDeliveryFee(true);
      }
    } catch (error) {
      console.error("Error toggling external orders:", error);
      toast.error("حدث خطأ أثناء التحديث");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeliveryFeeUpdate = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("store_settings")
        .update({ delivery_fee: parseFloat(deliveryFee) || 0 })
        .eq("user_id", storeOwnerId);

      if (error) throw error;

      toast.success("تم حفظ مبلغ التوصيل");
      setShowDeliveryFee(false);
    } catch (error) {
      console.error("Error saving delivery fee:", error);
      toast.error("حدث خطأ أثناء الحفظ");
    } finally {
      setIsLoading(false);
    }
  };

  const themeColor = getThemeColor();

  return (
    <>
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <div
            className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl shadow-md cursor-pointer transition-all"
            style={{
              background: `linear-gradient(135deg, ${themeColor}dd, ${themeColor})`,
              border: '1px solid rgba(255,255,255,0.2)',
            }}
          >
            <Settings className="h-4 w-4 text-white" />
            <span className="text-[10px] font-medium text-white whitespace-nowrap">إدارة</span>
          </div>
        </motion.div>
      </PopoverTrigger>
      <PopoverContent 
        className="w-80 backdrop-blur-xl border shadow-2xl bg-card"
        style={{
          borderColor: `${themeColor}40`,
        }}
        align="end"
        side="top"
        sideOffset={10}
      >
        <div className="space-y-3">
          <h3 className="font-semibold text-lg mb-3" style={{ color: themeColor }}>
            إعدادات المتجر
          </h3>

          {/* أزرار سريعة */}
          <div className="grid grid-cols-2 gap-2">
            {/* زر إضافة منتج */}
            <Button
              onClick={() => {
                onAddProduct();
                setIsOpen(false);
              }}
              className="justify-start gap-2 h-10"
              style={{ background: '#10b981' }}
            >
              <Plus className="h-4 w-4" />
              إضافة منتج
            </Button>

            {/* زر الإحصائيات */}
            <Button
              onClick={() => {
                setShowStatsCard(true);
                setIsOpen(false);
              }}
              className="justify-start gap-2 h-10"
              style={{ background: themeColor }}
            >
              <BarChart3 className="h-4 w-4" />
              الإحصائيات
            </Button>

            {/* زر إدارة الصور */}
            <Button
              onClick={() => {
                setShowMigrationCard(true);
                setIsOpen(false);
              }}
              className="justify-start gap-2 h-10"
              style={{ background: '#f97316' }}
            >
              <Cloud className="h-4 w-4" />
              إدارة الصور
            </Button>

            {/* زر إدارة الموظفين - يظهر فقط إذا كان النظام مفعل */}
            {employeeSystemEnabled && (
              <Button
                onClick={() => {
                  setShowEmployeeCard(true);
                  setIsOpen(false);
                }}
                className="justify-start gap-2 h-10"
                style={{ background: '#f59e0b' }}
              >
                <Users className="h-4 w-4" />
                الموظفين
              </Button>
            )}

            {/* زر عرض الآراء */}
            {onOpenFeedback && (
              <Button
                onClick={() => {
                  onOpenFeedback();
                  setIsOpen(false);
                }}
                className="justify-start gap-2 h-10"
                style={{ background: '#8b5cf6' }}
              >
                <Eye className="h-4 w-4" />
                عرض الآراء
              </Button>
            )}

            {/* زر معلومات المتجر - يظهر دائماً للمالك لتعديل أو إضافة المعلومات */}
            {onOpenInfo && (
              <Button
                onClick={() => {
                  onOpenInfo();
                  setIsOpen(false);
                }}
                variant="outline"
                className="justify-start gap-2 h-10"
              >
                <Info className="h-4 w-4" />
                {hasContactInfo ? "معلومات المتجر" : "إضافة معلومات"}
              </Button>
            )}
          </div>

          {/* الوضع الداكن */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-background/50 backdrop-blur-sm">
            <div className="flex items-center gap-2">
              {darkMode ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
              <span className="text-sm font-medium">
                {darkMode ? "الوضع الداكن" : "الوضع الفاتح"}
              </span>
            </div>
            <Switch
              checked={darkMode}
              onCheckedChange={handleDarkModeToggle}
              disabled={isLoading}
            />
          </div>

          {/* الطلبات الخارجية */}
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 rounded-lg bg-background/50 backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-4 w-4" />
                <span className="text-sm font-medium">الطلبات الخارجية</span>
              </div>
              <Switch
                checked={externalOrdersEnabled}
                onCheckedChange={handleExternalOrdersToggle}
                disabled={isLoading}
              />
            </div>

            {/* حقل مبلغ التوصيل */}
            {(externalOrdersEnabled || showDeliveryFee) && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2 p-3 rounded-lg bg-background/50 backdrop-blur-sm"
              >
                <Label htmlFor="delivery-fee" className="text-sm flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  مبلغ التوصيل (د.ع)
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="delivery-fee"
                    type="number"
                    min="0"
                    step="1000"
                    value={deliveryFee}
                    onChange={(e) => setDeliveryFee(e.target.value)}
                    placeholder="0"
                    className="text-right"
                  />
                  <Button
                    onClick={handleDeliveryFeeUpdate}
                    disabled={isLoading}
                    size="sm"
                  >
                    حفظ
                  </Button>
                </div>
              </motion.div>
            )}
          </div>

          {/* زر تسجيل الخروج */}
          <Button
            onClick={async () => {
              await supabase.auth.signOut();
              toast.success("تم تسجيل الخروج");
              window.location.reload();
            }}
            variant="outline"
            className="w-full justify-start gap-2 h-10 text-red-500 border-red-200 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/20"
          >
            <LogOut className="h-4 w-4" />
            تسجيل الخروج
          </Button>

          {/* الملف الشخصي */}
          <ProfileSheet colorTheme={colorTheme} />
        </div>
      </PopoverContent>
    </Popover>

    {/* بطاقة الإحصائيات */}
    <StoreStatsCard
      isOpen={showStatsCard}
      onClose={() => setShowStatsCard(false)}
      colorTheme={colorTheme}
      storeOwnerId={storeOwnerId}
    />

    {/* بطاقة إدارة الموظفين */}
    <EmployeeManagementCard
      isOpen={showEmployeeCard}
      onClose={() => setShowEmployeeCard(false)}
      colorTheme={colorTheme}
      storeOwnerId={storeOwnerId}
    />

    {/* بطاقة إدارة صور المنتجات */}
    <ProductImageMigrationCard
      isOpen={showMigrationCard}
      onClose={() => setShowMigrationCard(false)}
      storeOwnerId={storeOwnerId}
      colorTheme={colorTheme}
      onMigrationComplete={onUpdate}
    />
  </>
  );
};

export default StoreOwnerActionsMenu;
