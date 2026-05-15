import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Settings, Plus, Moon, Sun, ShoppingBag, DollarSign, Info, Eye,
  BarChart3, LogOut, Users, Cloud, Layout, Wand2, ImagePlus,
  ChevronLeft, Sparkles, X, ScanLine
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import ProfileSheet from "./ProfileSheet";
import StoreStatsCard from "../stats/StoreStatsCard";
import EmployeeManagementCard from "../employees/EmployeeManagementCard";
import ProductImageMigrationCard from "./ProductImageMigrationCard";
import CategoryImageGenerator from "../text-template/CategoryImageGenerator";
import ProductImageGenerator from "./ProductImageGenerator";
import MenuScanModal from "./MenuScanModal";
import { CategoryImage } from "@/types/categoryImage";
import { Product } from "@/types/product";
import { createPortal } from "react-dom";

interface StoreOwnerActionsMenuProps {
  storeOwnerId: string;
  colorTheme?: string | null;
  onAddProduct: () => void;
  onUpdate?: () => void;
  onOpenInfo?: () => void;
  onOpenFeedback?: () => void;
  hasContactInfo?: boolean;
  categories?: string[];
  categoryImages?: CategoryImage[];
  storeName?: string | null;
  products?: Product[];
}

interface MenuItemProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  color?: string;
  subtitle?: string;
}

const MenuItem = ({ icon, label, onClick, color, subtitle }: MenuItemProps) => (
  <motion.button
    whileTap={{ scale: 0.97 }}
    onClick={onClick}
    className="flex items-center gap-3 w-full p-3 rounded-2xl transition-all hover:bg-muted/50 active:bg-muted text-right"
  >
    <div
      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
      style={{ backgroundColor: `${color}15`, color }}
    >
      {icon}
    </div>
    <div className="flex-1 min-w-0 text-right">
      <p className="text-sm font-semibold text-foreground">{label}</p>
      {subtitle && <p className="text-[11px] text-muted-foreground">{subtitle}</p>}
    </div>
    <ChevronLeft className="h-4 w-4 text-muted-foreground shrink-0" />
  </motion.button>
);

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider px-1 mb-1">
    {children}
  </p>
);

const StoreOwnerActionsMenu = ({
  storeOwnerId,
  colorTheme,
  onAddProduct,
  onUpdate,
  onOpenInfo,
  onOpenFeedback,
  hasContactInfo = false,
  categories = [],
  categoryImages,
  storeName,
  products = [],
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
  const [showImageGenerator, setShowImageGenerator] = useState(false);
  const [showProductImageGenerator, setShowProductImageGenerator] = useState(false);
  const [showMenuScan, setShowMenuScan] = useState(false);

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
    const themeColors: Record<string, string> = {
      coral: '#ff9178', purple: '#8b5cf6', blue: '#3b82f6', green: '#10b981',
      pink: '#ec4899', teal: '#14b8a6', amber: '#f59e0b', indigo: '#6366f1', rose: '#f43f5e',
    };
    return themeColors[colorTheme || ''] || '#3b82f6';
  };

  const handleDarkModeToggle = async (checked: boolean) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.from("store_settings").update({ dark_mode: checked }).eq("user_id", storeOwnerId);
      if (error) throw error;
      setDarkMode(checked);
      toast.success(checked ? "تم تفعيل الوضع الداكن" : "تم تفعيل الوضع الفاتح");
      onUpdate?.();
    } catch { toast.error("فشل تبديل الوضع"); }
    finally { setIsLoading(false); }
  };

  const handleExternalOrdersToggle = async (checked: boolean) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.from("store_settings").update({ external_orders_enabled: checked }).eq("user_id", storeOwnerId);
      if (error) throw error;
      setExternalOrdersEnabled(checked);
      toast.success(checked ? "تم تفعيل الطلبات الخارجية" : "تم إيقاف الطلبات الخارجية");
      if (checked) setShowDeliveryFee(true);
    } catch { toast.error("حدث خطأ أثناء التحديث"); }
    finally { setIsLoading(false); }
  };

  const handleDeliveryFeeUpdate = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.from("store_settings").update({ delivery_fee: parseFloat(deliveryFee) || 0 }).eq("user_id", storeOwnerId);
      if (error) throw error;
      toast.success("تم حفظ مبلغ التوصيل");
      setShowDeliveryFee(false);
    } catch { toast.error("حدث خطأ أثناء الحفظ"); }
    finally { setIsLoading(false); }
  };

  const handleTemplateChange = async (template: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.from("store_settings").update({ template }).eq("user_id", storeOwnerId);
      if (error) throw error;
      setCurrentTemplate(template);
      toast.success(
        template === "text-only" ? "تم التبديل للقالب النصي"
          : template === "a2004" ? "تم تفعيل قالب A2004 🎮"
          : template === "modern-glass" ? "تم تفعيل قالب Modern Glass ✨"
          : "تم التبديل للقالب المصور"
      );
      onUpdate?.();
    } catch { toast.error("حدث خطأ أثناء التبديل"); }
    finally { setIsLoading(false); }
  };

  const themeColor = getThemeColor();

  const menuPanel = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-end justify-center"
          onClick={() => setIsOpen(false)}
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />

          {/* Panel */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md max-h-[80vh] bg-card rounded-t-3xl shadow-2xl overflow-hidden"
            style={{ borderTop: `3px solid ${themeColor}` }}
          >
            {/* Handle bar */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-muted-foreground/20" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 pb-3">
              <button onClick={() => setIsOpen(false)} className="p-1.5 rounded-full hover:bg-muted transition-colors">
                <X className="h-5 w-5 text-muted-foreground" />
              </button>
              <div className="text-center">
                <h2 className="text-lg font-bold text-foreground">لوحة التحكم</h2>
                {storeName && <p className="text-xs text-muted-foreground">{storeName}</p>}
              </div>
              <div className="w-8" />
            </div>

            {/* Scrollable content */}
            <div className="overflow-y-auto max-h-[calc(80vh-80px)] px-5 pb-6 space-y-5" dir="rtl">

              {/* === قسم: إجراءات سريعة === */}
              <div className="space-y-1">
                <SectionTitle>إجراءات سريعة</SectionTitle>
                <div className="bg-muted/30 rounded-2xl p-1.5 space-y-0.5">
                  <MenuItem
                    icon={<Plus className="h-5 w-5" />}
                    label="إضافة منتج جديد"
                    subtitle="أضف منتجاً إلى قائمتك"
                    onClick={() => { onAddProduct(); setIsOpen(false); }}
                    color="#10b981"
                  />
                  <MenuItem
                    icon={<ScanLine className="h-5 w-5" />}
                    label="استخراج من صورة المنيو"
                    subtitle="رفع صورة واستخراج المنتجات بالذكاء الاصطناعي"
                    onClick={() => { setShowMenuScan(true); setIsOpen(false); }}
                    color="#f59e0b"
                  />
                  <MenuItem
                    icon={<BarChart3 className="h-5 w-5" />}
                    label="الإحصائيات"
                    subtitle="عرض أداء متجرك"
                    onClick={() => { setShowStatsCard(true); setIsOpen(false); }}
                    color={themeColor}
                  />
                  {onOpenInfo && (
                    <MenuItem
                      icon={<Info className="h-5 w-5" />}
                      label={hasContactInfo ? "معلومات المتجر" : "إضافة معلومات"}
                      subtitle="بيانات التواصل والعنوان"
                      onClick={() => { onOpenInfo(); setIsOpen(false); }}
                      color="#6366f1"
                    />
                  )}
                  {onOpenFeedback && (
                    <MenuItem
                      icon={<Eye className="h-5 w-5" />}
                      label="آراء العملاء"
                      subtitle="عرض وإدارة الملاحظات"
                      onClick={() => { onOpenFeedback(); setIsOpen(false); }}
                      color="#8b5cf6"
                    />
                  )}
                </div>
              </div>

              {/* === قسم: الذكاء الاصطناعي === */}
              {(categories.length > 0 || products.length > 0) && (
                <div className="space-y-1">
                  <SectionTitle>الذكاء الاصطناعي ✨</SectionTitle>
                  <div className="bg-muted/30 rounded-2xl p-1.5 space-y-0.5">
                    {categories.length > 0 && (
                      <MenuItem
                        icon={<Wand2 className="h-5 w-5" />}
                        label="توليد صور التصنيفات"
                        subtitle="صور ذكية لأقسام القائمة"
                        onClick={() => { setShowImageGenerator(true); setIsOpen(false); }}
                        color={themeColor}
                      />
                    )}
                    {products.length > 0 && (
                      <MenuItem
                        icon={<ImagePlus className="h-5 w-5" />}
                        label="توليد صور المنتجات"
                        subtitle="صور احترافية بالذكاء الاصطناعي"
                        onClick={() => { setShowProductImageGenerator(true); setIsOpen(false); }}
                        color="#10b981"
                      />
                    )}
                  </div>
                </div>
              )}

              {/* === قسم: المظهر === */}
              <div className="space-y-1">
                <SectionTitle>المظهر والتصميم</SectionTitle>
                <div className="bg-muted/30 rounded-2xl p-3 space-y-3">
                  {/* تبديل القالب */}
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                      <Layout className="h-3.5 w-3.5" /> تصميم القائمة
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleTemplateChange("fast-response")}
                        disabled={isLoading}
                        className={`p-3 rounded-xl border-2 text-xs font-bold transition-all ${
                          currentTemplate === "fast-response" || currentTemplate === "default"
                            ? "shadow-sm bg-background"
                            : "border-transparent bg-background/50 opacity-60 hover:opacity-100"
                        }`}
                        style={currentTemplate === "fast-response" || currentTemplate === "default"
                          ? { borderColor: themeColor, color: themeColor }
                          : { borderColor: 'transparent' }}
                      >
                        🖼️ مع الصور
                      </button>
                      <button
                        onClick={() => handleTemplateChange("text-only")}
                        disabled={isLoading}
                        className={`p-3 rounded-xl border-2 text-xs font-bold transition-all ${
                          currentTemplate === "text-only"
                            ? "shadow-sm bg-background"
                            : "border-transparent bg-background/50 opacity-60 hover:opacity-100"
                        }`}
                        style={currentTemplate === "text-only"
                          ? { borderColor: themeColor, color: themeColor }
                          : { borderColor: 'transparent' }}
                      >
                        📝 نصي فقط
                      </button>
                      <button
                        onClick={() => handleTemplateChange("modern-glass")}
                        disabled={isLoading}
                        className={`p-3 rounded-xl border-2 text-xs font-bold transition-all ${
                          currentTemplate === "modern-glass"
                            ? "shadow-sm bg-background"
                            : "border-transparent bg-background/50 opacity-60 hover:opacity-100"
                        }`}
                        style={currentTemplate === "modern-glass"
                          ? { borderColor: "#ff7e5f", color: "#ff7e5f" }
                          : { borderColor: 'transparent' }}
                      >
                        ✨ Modern Glass
                      </button>
                      <button
                        onClick={() => handleTemplateChange("a2004")}
                        disabled={isLoading}
                        className={`p-3 rounded-xl border-2 text-xs font-bold transition-all ${
                          currentTemplate === "a2004"
                            ? "shadow-sm bg-background"
                            : "border-transparent bg-background/50 opacity-60 hover:opacity-100"
                        }`}
                        style={currentTemplate === "a2004"
                          ? { borderColor: "#8B5CF6", color: "#8B5CF6" }
                          : { borderColor: 'transparent' }}
                      >
                        🎮 A2004
                      </button>
                    </div>
                  </div>

                  {/* الوضع الداكن */}
                  <div className="flex items-center justify-between">
                    <Switch checked={darkMode} onCheckedChange={handleDarkModeToggle} disabled={isLoading} />
                    <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                      {darkMode ? "الوضع الداكن" : "الوضع الفاتح"}
                      {darkMode ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                    </div>
                  </div>
                </div>
              </div>

              {/* === قسم: إعدادات متقدمة === */}
              <div className="space-y-1">
                <SectionTitle>إعدادات متقدمة</SectionTitle>
                <div className="bg-muted/30 rounded-2xl p-1.5 space-y-0.5">
                  <MenuItem
                    icon={<Cloud className="h-5 w-5" />}
                    label="إدارة الصور"
                    subtitle="ترحيل وتنظيم صور المنتجات"
                    onClick={() => { setShowMigrationCard(true); setIsOpen(false); }}
                    color="#f97316"
                  />
                  {employeeSystemEnabled && (
                    <MenuItem
                      icon={<Users className="h-5 w-5" />}
                      label="إدارة الموظفين"
                      subtitle="الصلاحيات والطاولات والمبيعات"
                      onClick={() => { setShowEmployeeCard(true); setIsOpen(false); }}
                      color="#f59e0b"
                    />
                  )}

                  {/* الطلبات الخارجية */}
                  <div className="flex items-center justify-between p-3 rounded-2xl">
                    <Switch checked={externalOrdersEnabled} onCheckedChange={handleExternalOrdersToggle} disabled={isLoading} />
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-sm font-semibold text-foreground">الطلبات الخارجية</p>
                        <p className="text-[11px] text-muted-foreground">السماح بالطلب عبر المتجر</p>
                      </div>
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: '#3b82f615', color: '#3b82f6' }}>
                        <ShoppingBag className="h-5 w-5" />
                      </div>
                    </div>
                  </div>

                  {/* حقل التوصيل */}
                  <AnimatePresence>
                    {(externalOrdersEnabled || showDeliveryFee) && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden px-3 pb-2"
                      >
                        <Label htmlFor="delivery-fee" className="text-xs flex items-center gap-1.5 mb-1.5 justify-end text-muted-foreground">
                          مبلغ التوصيل (د.ع) <DollarSign className="h-3.5 w-3.5" />
                        </Label>
                        <div className="flex gap-2">
                          <Button onClick={handleDeliveryFeeUpdate} disabled={isLoading} size="sm" className="shrink-0">حفظ</Button>
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
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* === قسم: الحساب === */}
              <div className="space-y-1">
                <SectionTitle>الحساب</SectionTitle>
                <div className="bg-muted/30 rounded-2xl p-1.5 space-y-0.5">
                  <ProfileSheet colorTheme={colorTheme} />
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={async () => {
                      await supabase.auth.signOut();
                      toast.success("تم تسجيل الخروج");
                      window.location.reload();
                    }}
                    className="flex items-center gap-3 w-full p-3 rounded-2xl transition-all hover:bg-destructive/5 text-right"
                  >
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-destructive/10">
                      <LogOut className="h-5 w-5 text-destructive" />
                    </div>
                    <div className="flex-1 min-w-0 text-right">
                      <p className="text-sm font-semibold text-destructive">تسجيل الخروج</p>
                    </div>
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      {/* Trigger button */}
      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl shadow-lg cursor-pointer transition-all text-white"
          style={{
            background: `linear-gradient(135deg, ${themeColor}dd, ${themeColor})`,
            border: '1px solid rgba(255,255,255,0.2)',
          }}
        >
          <Settings className="h-4 w-4" />
          <span className="text-[10px] font-medium whitespace-nowrap">إدارة</span>
        </button>
      </motion.div>

      {/* Portal-based menu panel */}
      {createPortal(menuPanel, document.body)}

      {/* External sheets/cards */}
      <StoreStatsCard isOpen={showStatsCard} onClose={() => setShowStatsCard(false)} colorTheme={colorTheme} storeOwnerId={storeOwnerId} />
      <EmployeeManagementCard isOpen={showEmployeeCard} onClose={() => setShowEmployeeCard(false)} colorTheme={colorTheme} storeOwnerId={storeOwnerId} />
      <ProductImageMigrationCard isOpen={showMigrationCard} onClose={() => setShowMigrationCard(false)} storeOwnerId={storeOwnerId} colorTheme={colorTheme} onMigrationComplete={onUpdate} />
      <CategoryImageGenerator isOpen={showImageGenerator} onClose={() => setShowImageGenerator(false)} categories={categories} categoryImages={categoryImages} storeOwnerId={storeOwnerId} storeName={storeName} colorTheme={colorTheme} onGenerated={onUpdate} />
      <ProductImageGenerator isOpen={showProductImageGenerator} onClose={() => setShowProductImageGenerator(false)} products={products} colorTheme={colorTheme} onGenerated={onUpdate} />
      <MenuScanModal isOpen={showMenuScan} onOpenChange={setShowMenuScan} onProductsAdded={onUpdate} colorTheme={colorTheme} />
    </>
  );
};

export default StoreOwnerActionsMenu;
