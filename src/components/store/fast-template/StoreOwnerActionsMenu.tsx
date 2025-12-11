import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Settings, Plus, Moon, Sun, ShoppingBag, DollarSign } from "lucide-react";
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

interface StoreOwnerActionsMenuProps {
  storeOwnerId: string;
  colorTheme?: string | null;
  onAddProduct: () => void;
  onUpdate?: () => void;
}

const StoreOwnerActionsMenu = ({
  storeOwnerId,
  colorTheme,
  onAddProduct,
  onUpdate,
}: StoreOwnerActionsMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [externalOrdersEnabled, setExternalOrdersEnabled] = useState(false);
  const [deliveryFee, setDeliveryFee] = useState("0");
  const [isLoading, setIsLoading] = useState(false);
  const [showDeliveryFee, setShowDeliveryFee] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabase
        .from("store_settings")
        .select("dark_mode, external_orders_enabled, delivery_fee")
        .eq("user_id", storeOwnerId)
        .single();

      if (data) {
        setDarkMode(data.dark_mode || false);
        setExternalOrdersEnabled(data.external_orders_enabled || false);
        setDeliveryFee(data.delivery_fee?.toString() || "0");
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
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <div
            className="flex flex-col items-center gap-1 px-3 py-2 rounded-2xl shadow-lg cursor-pointer"
            style={{
              background: `linear-gradient(135deg, ${themeColor}dd, ${themeColor})`,
              border: '2px solid rgba(255,255,255,0.3)',
            }}
          >
            <Settings className="h-5 w-5 text-white" />
            <span className="text-[10px] font-medium text-white whitespace-nowrap">إدارة</span>
          </div>
        </motion.div>
      </PopoverTrigger>
      <PopoverContent 
        className="w-80 backdrop-blur-xl border shadow-2xl"
        style={{
          background: `linear-gradient(135deg, ${themeColor}08, ${themeColor}15)`,
          borderColor: `${themeColor}40`,
        }}
        align="end"
        side="top"
        sideOffset={10}
      >
        <div className="space-y-4">
          <h3 className="font-semibold text-lg mb-4" style={{ color: themeColor }}>
            إعدادات المتجر
          </h3>

          {/* زر إضافة منتج */}
          <Button
            onClick={() => {
              onAddProduct();
              setIsOpen(false);
            }}
            className="w-full justify-start gap-2"
            style={{ background: '#10b981' }}
          >
            <Plus className="h-4 w-4" />
            إضافة منتج جديد
          </Button>

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

          {/* الملف الشخصي */}
          <ProfileSheet colorTheme={colorTheme} />
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default StoreOwnerActionsMenu;
