import React, { useState, useMemo, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { Product } from "@/types/product";
import { CategoryImage } from "@/types/categoryImage";
import ProductDetailsModal from "../fast-template/ProductDetailsModal";
import EditProductModal from "../fast-template/EditProductModal";
import BottomActionsBar from "../fast-template/BottomActionsBar";
import LiveVisitCounter from "../fast-template/LiveVisitCounter";
import InlineStoreNameEditor from "../inline-edit/InlineStoreNameEditor";
import StoreHeader from "../StoreHeader";
import { ContactInfo, FontSettings, SocialLinks } from "@/types/store";
import { sortCategoriesByOrder } from "@/utils/categorySort";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useCart } from "@/contexts/CartContext";
import { useFavorites } from "@/hooks/store/useFavorites";
import CartButton from "../external-orders/CartButton";
import CartSheet from "../external-orders/CartSheet";
import { logUserActivity } from "@/hooks/analytics/useActivityLogger";
import FavoritesSheet from "../favorites/FavoritesSheet";
import ShareProductCard from "../share/ShareProductCard";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface TextOnlyTemplateProps {
  products: Product[];
  colorTheme?: string | null;
  storeName?: string | null;
  onSearchChange?: (query: string) => void;
  contactInfo?: ContactInfo;
  slug?: string;
  storeOwnerId?: string;
  fontSettings?: FontSettings;
  socialLinks?: SocialLinks;
  categoryImages?: CategoryImage[];
  isStoreOwner?: boolean;
  refreshData?: () => void;
  isLoading?: boolean;
  logoUrl?: string | null;
  isEmployeeView?: boolean;
}

const TextOnlyTemplate: React.FC<TextOnlyTemplateProps> = ({
  products,
  colorTheme,
  storeName,
  onSearchChange,
  contactInfo,
  slug,
  storeOwnerId,
  fontSettings,
  socialLinks,
  categoryImages,
  isStoreOwner = false,
  refreshData,
  isLoading = false,
  logoUrl,
  isEmployeeView = false,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [externalOrdersEnabled, setExternalOrdersEnabled] = useState(false);
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);
  const [shareProduct, setShareProduct] = useState<Product | null>(null);
  const { addItem } = useCart();
  const { favorites, toggleFavorite, isFavorite, clearFavorites, favoritesCount } = useFavorites(slug || 'default', storeOwnerId);

  const themeColor = useMemo(() => {
    if (colorTheme?.startsWith("#")) return colorTheme;
    const colors: Record<string, string> = {
      coral: "#fb923c", purple: "#a855f7", blue: "#3b82f6",
      green: "#22c55e", red: "#ef4444", pink: "#ec4899",
      teal: "#14b8a6", amber: "#f59e0b", indigo: "#6366f1", rose: "#f43f5e",
    };
    return colors[colorTheme || ""] || "#3b82f6";
  }, [colorTheme]);

  // فتح المنتج من رابط المشاركة
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('product');
    if (productId && products.length > 0) {
      const sharedProduct = products.find(p => p.id === productId);
      if (sharedProduct) {
        setSelectedProduct(sharedProduct);
        setIsModalOpen(true);
        window.history.replaceState({}, '', window.location.pathname);
      }
    }
  }, [products]);

  // جلب إعدادات الطلبات الخارجية
  useEffect(() => {
    if (!storeOwnerId) return;
    const fetchSettings = async () => {
      const { data } = await supabase
        .from('store_settings')
        .select('external_orders_enabled, delivery_fee')
        .eq('user_id', storeOwnerId)
        .maybeSingle();
      if (data) {
        setExternalOrdersEnabled(data.external_orders_enabled || false);
        setDeliveryFee(data.delivery_fee || 0);
      }
    };
    fetchSettings();
  }, [storeOwnerId]);

  // استخراج التصنيفات
  const categories = useMemo(() => {
    const uniqueCategories = new Set<string>();
    products.forEach(p => { if (p.category) uniqueCategories.add(p.category); });
    return Array.from(uniqueCategories);
  }, [products]);

  const sortedCategories = useMemo(() => {
    return sortCategoriesByOrder(categories, categoryImages);
  }, [categories, categoryImages]);

  // تصفية المنتجات
  const filteredProducts = useMemo(() => {
    let filtered = products;
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.description?.toLowerCase().includes(query) ||
        p.category?.toLowerCase().includes(query)
      );
    } else if (selectedCategory) {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }
    return filtered.sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));
  }, [products, selectedCategory, searchQuery]);

  const handleCategorySelect = useCallback((category: string) => {
    setSelectedCategory(category);
    setSearchQuery("");
  }, []);

  const handleBack = useCallback(() => {
    setSelectedCategory(null);
    setSearchQuery("");
  }, []);

  const handleProductClick = useCallback((product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedProduct(null), 300);
  }, []);

  const handleEdit = useCallback((product: Product) => {
    setProductToEdit(product);
    setIsEditModalOpen(true);
  }, []);

  const handleDelete = useCallback((product: Product) => {
    setProductToDelete(product);
    setIsDeleteDialogOpen(true);
  }, []);

  const handleAddToCart = useCallback((product: Product) => {
    addItem(product, 1);
    toast.success(`تمت إضافة ${product.name} إلى السلة`);
  }, [addItem]);

  const confirmDelete = useCallback(async () => {
    if (!productToDelete) return;
    try {
      const { error } = await supabase.from('products').delete().eq('id', productToDelete.id);
      if (error) throw error;
      logUserActivity('product_delete', 'products', { product_id: productToDelete.id, name: productToDelete.name });
      toast.success("تم حذف المنتج بنجاح");
      refreshData?.();
    } catch {
      toast.error("حدث خطأ أثناء حذف المنتج");
    } finally {
      setIsDeleteDialogOpen(false);
      setProductToDelete(null);
    }
  }, [productToDelete, refreshData]);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    onSearchChange?.(e.target.value);
  }, [onSearchChange]);

  const clearSearch = useCallback(() => {
    setSearchQuery("");
    onSearchChange?.("");
  }, [onSearchChange]);

  const showCategories = !selectedCategory && !searchQuery.trim();

  return (
    <div className="min-h-screen" style={{ background: `linear-gradient(180deg, ${themeColor}, ${themeColor}dd)` }}>
      
      {/* رأس المتجر */}
      <div className="pt-6 pb-4 px-4">
        {(storeName || isStoreOwner) && (
          <div className="text-center">
            {isStoreOwner && storeOwnerId ? (
              <InlineStoreNameEditor
                storeName={storeName}
                colorTheme={colorTheme || null}
                fontSettings={fontSettings}
                storeOwnerId={storeOwnerId}
                onUpdate={() => refreshData?.()}
              />
            ) : (
              <h1 className="text-3xl font-black text-white drop-shadow-lg" style={{
                fontFamily: fontSettings?.storeName?.family && fontSettings.storeName.family !== 'inherit' 
                  ? fontSettings.storeName.family : undefined
              }}>
                {storeName}
              </h1>
            )}
          </div>
        )}
      </div>

      {/* المحتوى */}
      <div className="px-4 pb-28">
        <AnimatePresence mode="wait">
          {showCategories ? (
            /* عرض التصنيفات */
            <motion.div
              key="categories"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-3"
            >
              <h2 className="text-2xl font-black text-white text-center mb-6 drop-shadow-md">
                اختر القسم
              </h2>

              <div className={sortedCategories.length <= 4 ? "space-y-3" : "grid grid-cols-2 gap-3"}>
                {isLoading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-28 rounded-2xl animate-pulse" style={{ background: `${themeColor}50` }} />
                  ))
                ) : (
                  sortedCategories.map((category, index) => {
                    const catImage = categoryImages?.find(ci => ci.category === category);
                    return (
                      <motion.button
                        key={category}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05, type: "spring", stiffness: 300 }}
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleCategorySelect(category)}
                        className="w-full rounded-2xl overflow-hidden transition-all relative group"
                        style={{
                          background: `linear-gradient(135deg, ${themeColor}88, ${themeColor}44)`,
                          border: `2px solid ${themeColor}55`,
                          backdropFilter: "blur(10px)",
                        }}
                      >
                        <div className={`flex flex-col items-center justify-center gap-2 ${sortedCategories.length <= 4 ? 'py-6' : 'py-5'}`}>
                          {/* أيقونة التصنيف - من صورة التصنيف إن وُجدت */}
                          {catImage?.image_url && (
                            <img
                              src={catImage.image_url}
                              alt={category}
                              className="w-12 h-12 object-contain brightness-0 invert opacity-90"
                              loading="lazy"
                            />
                          )}
                          <span className={`font-black text-white drop-shadow-sm ${sortedCategories.length <= 4 ? 'text-xl' : 'text-base'}`}>
                            {category}
                          </span>
                        </div>
                        {/* Hover glow */}
                        <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-all duration-300 rounded-2xl" />
                      </motion.button>
                    );
                  })
                )}
              </div>
            </motion.div>
          ) : (
            /* عرض المنتجات النصية */
            <motion.div
              key="products"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-3"
            >
              {/* زر الرجوع + عنوان التصنيف */}
              <div className="flex items-center justify-between mb-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleBack}
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ background: `${themeColor}66`, border: `1px solid ${themeColor}88` }}
                >
                  <ChevronRight className="h-5 w-5 text-white" />
                </motion.button>
                <h2 className="text-xl font-black text-white drop-shadow-md">
                  {searchQuery ? `نتائج: "${searchQuery}"` : selectedCategory}
                </h2>
                <div className="w-10" />
              </div>

              {/* قائمة المنتجات */}
              {isLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-20 rounded-2xl animate-pulse" style={{ background: `${themeColor}30` }} />
                  ))}
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-12">
                  <span className="text-4xl block mb-3">📭</span>
                  <p className="text-white/80 font-bold text-lg">لا توجد منتجات</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredProducts.map((product, index) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.04, type: "spring", stiffness: 300 }}
                      whileHover={{ scale: 1.01, x: -3 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => handleProductClick(product)}
                      className="flex items-center justify-between px-5 py-4 rounded-2xl cursor-pointer group relative overflow-hidden"
                      style={{
                        background: "rgba(255,255,255,0.95)",
                        border: `2px solid ${themeColor}40`,
                      }}
                    >
                      {/* اسم المنتج */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-base font-black text-gray-900 truncate">
                            {product.name}
                          </p>
                          {product.is_new && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded-full text-white font-bold" style={{ background: themeColor }}>
                              جديد
                            </span>
                          )}
                          {product.is_popular && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-orange-500 text-white font-bold">
                              🔥
                            </span>
                          )}
                        </div>
                        {product.description && (
                          <p className="text-xs text-gray-500 truncate mt-0.5">
                            {product.description}
                          </p>
                        )}
                        {!product.is_available && (
                          <span className="text-[10px] text-red-500 font-bold">غير متوفر</span>
                        )}
                      </div>

                      {/* السعر */}
                      <div className="flex items-center gap-2 shrink-0 mr-3">
                        {product.discount_percentage && product.discount_percentage > 0 && product.original_price ? (
                          <div className="text-left">
                            <p className="text-[10px] text-gray-400 line-through">{product.original_price.toLocaleString()}</p>
                            <p className="text-base font-black" style={{ color: themeColor }}>
                              {product.price.toLocaleString()} <span className="text-xs font-bold">د.ع</span>
                            </p>
                          </div>
                        ) : (
                          <p className="text-base font-black" style={{ color: themeColor }}>
                            {product.price.toLocaleString()} <span className="text-xs font-bold">د.ع</span>
                          </p>
                        )}
                      </div>

                      {/* إجراءات المالك */}
                      {isStoreOwner && (
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity mr-2">
                          <button
                            onClick={(e) => { e.stopPropagation(); handleEdit(product); }}
                            className="p-1.5 rounded-lg bg-blue-100 text-blue-600 text-xs"
                          >✏️</button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDelete(product); }}
                            className="p-1.5 rounded-lg bg-red-100 text-red-600 text-xs"
                          >🗑️</button>
                        </div>
                      )}

                      {/* زر إضافة للسلة */}
                      {((externalOrdersEnabled && !isStoreOwner) || isEmployeeView) && product.is_available !== false && (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleAddToCart(product); }}
                          className="p-2 rounded-xl text-white text-xs font-bold shrink-0 mr-2"
                          style={{ background: themeColor }}
                        >
                          +
                        </button>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* عناصر مشتركة */}
      {externalOrdersEnabled && !isStoreOwner && (
        <CartButton onClick={() => setIsCartOpen(true)} colorTheme={colorTheme} />
      )}

      <CartSheet
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        deliveryFee={deliveryFee}
        storePhone={contactInfo?.phone}
        storeName={storeName || undefined}
      />

      <LiveVisitCounter />

      <BottomActionsBar
        slug={slug}
        storeOwnerId={storeOwnerId}
        colorTheme={colorTheme}
        socialLinks={socialLinks}
        contactInfo={contactInfo}
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        onClearSearch={clearSearch}
        isStoreOwner={isStoreOwner}
        storeName={storeName || undefined}
        fontSettings={fontSettings}
        products={products}
        externalOrdersEnabled={externalOrdersEnabled}
        deliveryFee={deliveryFee}
        logoUrl={logoUrl}
        favoritesCount={favoritesCount}
        onOpenFavorites={() => setIsFavoritesOpen(true)}
      />

      <ProductDetailsModal
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        colorTheme={colorTheme}
        isStoreOwner={isStoreOwner}
        onEdit={() => selectedProduct && handleEdit(selectedProduct)}
        onDelete={() => selectedProduct && handleDelete(selectedProduct)}
      />

      <EditProductModal
        product={productToEdit}
        isOpen={isEditModalOpen}
        onClose={() => { setIsEditModalOpen(false); setProductToEdit(null); }}
        onSaved={() => refreshData?.()}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف المنتج "{productToDelete?.name}"؟
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <FavoritesSheet
        isOpen={isFavoritesOpen}
        onClose={() => setIsFavoritesOpen(false)}
        favorites={favorites}
        products={products}
        colorTheme={colorTheme}
        onRemove={toggleFavorite}
        onClear={clearFavorites}
        onProductClick={(product) => { setIsFavoritesOpen(false); handleProductClick(product); }}
      />

      <ShareProductCard
        isOpen={!!shareProduct}
        onClose={() => setShareProduct(null)}
        product={shareProduct}
        storeName={storeName || undefined}
        slug={slug}
        colorTheme={colorTheme}
        storeOwnerId={storeOwnerId}
      />
    </div>
  );
};

export default TextOnlyTemplate;
