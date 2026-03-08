import React, { useState, useMemo, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, Minus, Plus, Star, Sparkles } from "lucide-react";
import { Product, getDiscountedPrice, hasDiscount, getOriginalPrice } from "@/types/product";
import { CategoryImage } from "@/types/categoryImage";
import ProductDetailsModal from "../fast-template/ProductDetailsModal";
import EditProductModal from "../fast-template/EditProductModal";
import BottomActionsBar from "../fast-template/BottomActionsBar";
import LiveVisitCounter from "../fast-template/LiveVisitCounter";
import InlineStoreNameEditor from "../inline-edit/InlineStoreNameEditor";
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

// تحويل اللون الثيم لألوان HSL
const getThemeColors = (colorTheme?: string | null) => {
  if (colorTheme?.startsWith("#")) {
    return { primary: colorTheme, light: `${colorTheme}15`, mid: `${colorTheme}30`, dark: `${colorTheme}dd` };
  }
  const palettes: Record<string, { primary: string; light: string; mid: string; dark: string }> = {
    coral:  { primary: "#e67e22", light: "#fdf2e9", mid: "#f5cba7", dark: "#ca6f1e" },
    purple: { primary: "#8e44ad", light: "#f4ecf7", mid: "#d2b4de", dark: "#6c3483" },
    blue:   { primary: "#2980b9", light: "#eaf2f8", mid: "#a9cce3", dark: "#1f618d" },
    green:  { primary: "#27ae60", light: "#e9f7ef", mid: "#a9dfbf", dark: "#1e8449" },
    red:    { primary: "#c0392b", light: "#fdedec", mid: "#f5b7b1", dark: "#922b21" },
    pink:   { primary: "#e91e8c", light: "#fdeef8", mid: "#f5b0d8", dark: "#b5177a" },
    teal:   { primary: "#1abc9c", light: "#e8f8f5", mid: "#a3e4d7", dark: "#148f77" },
    amber:  { primary: "#f39c12", light: "#fef9e7", mid: "#f9e79f", dark: "#d68910" },
    indigo: { primary: "#5b5ea6", light: "#eeeef5", mid: "#b8b9d6", dark: "#3f4180" },
    rose:   { primary: "#e74c6f", light: "#fdedf1", mid: "#f5b0c0", dark: "#c13858" },
  };
  return palettes[colorTheme || ""] || palettes.blue;
};

const formatPrice = (price: number): string => new Intl.NumberFormat('ar-IQ').format(price);

const TextOnlyTemplate: React.FC<TextOnlyTemplateProps> = ({
  products, colorTheme, storeName, onSearchChange, contactInfo, slug,
  storeOwnerId, fontSettings, socialLinks, categoryImages,
  isStoreOwner = false, refreshData, isLoading = false, logoUrl, isEmployeeView = false,
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

  const theme = useMemo(() => getThemeColors(colorTheme), [colorTheme]);

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

  const categories = useMemo(() => {
    const unique = new Set<string>();
    products.forEach(p => { if (p.category) unique.add(p.category); });
    return Array.from(unique);
  }, [products]);

  const sortedCategories = useMemo(() => sortCategoriesByOrder(categories, categoryImages), [categories, categoryImages]);

  const filteredProducts = useMemo(() => {
    let filtered = products;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(p => p.name.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q) || p.category?.toLowerCase().includes(q));
    } else if (selectedCategory) {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }
    return filtered.sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));
  }, [products, selectedCategory, searchQuery]);

  const handleCategorySelect = useCallback((category: string) => { setSelectedCategory(category); setSearchQuery(""); }, []);
  const handleBack = useCallback(() => { setSelectedCategory(null); setSearchQuery(""); }, []);
  const handleProductClick = useCallback((product: Product) => { setSelectedProduct(product); setIsModalOpen(true); }, []);
  const handleCloseModal = useCallback(() => { setIsModalOpen(false); setTimeout(() => setSelectedProduct(null), 300); }, []);
  const handleEdit = useCallback((product: Product) => { setProductToEdit(product); setIsEditModalOpen(true); }, []);
  const handleDelete = useCallback((product: Product) => { setProductToDelete(product); setIsDeleteDialogOpen(true); }, []);
  const handleAddToCart = useCallback((product: Product) => { addItem(product, 1); toast.success(`تمت إضافة ${product.name} إلى السلة`); }, [addItem]);
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => { setSearchQuery(e.target.value); onSearchChange?.(e.target.value); }, [onSearchChange]);
  const clearSearch = useCallback(() => { setSearchQuery(""); onSearchChange?.(""); }, [onSearchChange]);

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

  const showCategories = !selectedCategory && !searchQuery.trim();

  return (
    <div className="min-h-screen -mx-4 sm:-mx-6 -mt-4 sm:-mt-6" style={{ background: "#faf9f6" }}>

      {/* ═══════ الهيدر الأنيق ═══════ */}
      <div className="relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${theme.primary}, ${theme.dark})` }}>
        {/* نمط هندسي خلفي */}
        <div className="absolute inset-0 opacity-[0.07]" style={{
          backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 20px, white 20px, white 21px),
                            repeating-linear-gradient(-45deg, transparent, transparent 20px, white 20px, white 21px)`,
        }} />
        
        <div className="relative z-10 pt-10 pb-8 px-5 text-center">
          {(storeName || isStoreOwner) && (
            <>
              {isStoreOwner && storeOwnerId ? (
                <InlineStoreNameEditor
                  storeName={storeName}
                  colorTheme={colorTheme || null}
                  fontSettings={fontSettings}
                  storeOwnerId={storeOwnerId}
                  onUpdate={() => refreshData?.()}
                />
              ) : (
                <motion.h1
                  initial={{ opacity: 0, y: -15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-3xl font-black text-white tracking-tight"
                  style={{
                    fontFamily: fontSettings?.storeName?.family !== 'inherit' ? fontSettings?.storeName?.family : "'Noto Kufi Arabic', sans-serif",
                    textShadow: "0 2px 20px rgba(0,0,0,0.15)",
                  }}
                >
                  {storeName}
                </motion.h1>
              )}
              {/* خط فاصل زخرفي */}
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="mx-auto mt-3 h-[2px] w-16 rounded-full bg-white/50"
              />
            </>
          )}
        </div>
        {/* موجة سفلية */}
        <svg className="w-full h-8 block" viewBox="0 0 1440 60" preserveAspectRatio="none">
          <path d="M0,60 L0,20 Q360,0 720,20 Q1080,40 1440,20 L1440,60 Z" fill="#faf9f6" />
        </svg>
      </div>

      {/* ═══════ المحتوى ═══════ */}
      <div className="px-4 pb-28 -mt-2">
        <AnimatePresence mode="wait">
          {showCategories ? (
            <motion.div
              key="categories"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35 }}
            >
              {/* عنوان القسم */}
              <div className="flex items-center gap-3 mb-5 mt-4">
                <Sparkles className="w-5 h-5" style={{ color: theme.primary }} />
                <h2 className="text-lg font-bold text-gray-800" style={{ fontFamily: "'Noto Kufi Arabic', sans-serif" }}>
                  الأقسام
                </h2>
                <div className="flex-1 h-px" style={{ background: `linear-gradient(to left, transparent, ${theme.mid})` }} />
              </div>

              {/* شبكة التصنيفات */}
              <div className="grid grid-cols-2 gap-3">
                {isLoading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-32 rounded-2xl animate-pulse bg-gray-100" />
                  ))
                ) : (
                  sortedCategories.map((category, index) => {
                    const catImage = categoryImages?.find(ci => ci.category === category);
                    const productCount = products.filter(p => p.category === category).length;
                    return (
                      <motion.button
                        key={category}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.06, type: "spring", stiffness: 250, damping: 20 }}
                        whileHover={{ y: -4 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => handleCategorySelect(category)}
                        className="relative rounded-2xl overflow-hidden text-right group"
                        style={{
                          height: catImage?.image_url ? "140px" : "120px",
                          boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
                        }}
                      >
                        {catImage?.image_url ? (
                          <>
                            <img src={catImage.image_url} alt={category} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" />
                            <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, transparent 30%, rgba(0,0,0,0.65) 100%)" }} />
                            <div className="absolute bottom-0 right-0 left-0 p-3 z-10">
                              <p className="text-white font-bold text-sm leading-tight">{category}</p>
                              <p className="text-white/70 text-[11px] mt-0.5">{productCount} منتج</p>
                            </div>
                          </>
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-2xl transition-all group-hover:border-solid" style={{ borderColor: theme.mid, background: theme.light }}>
                            <span className="text-3xl font-black" style={{ color: theme.primary }}>{category.charAt(0)}</span>
                            <p className="font-bold text-sm text-gray-700">{category}</p>
                            <p className="text-[11px] text-gray-400">{productCount} منتج</p>
                          </div>
                        )}
                        {/* شارة الزاوية */}
                        <div className="absolute top-2 left-2 w-7 h-7 rounded-full flex items-center justify-center backdrop-blur-sm" style={{ background: catImage?.image_url ? "rgba(255,255,255,0.25)" : theme.mid }}>
                          <ChevronRight className="w-4 h-4 rotate-180" style={{ color: catImage?.image_url ? "white" : theme.primary }} />
                        </div>
                      </motion.button>
                    );
                  })
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="products"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.3 }}
            >
              {/* شريط الرجوع + العنوان */}
              <div className="flex items-center gap-3 mt-4 mb-5">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleBack}
                  className="w-9 h-9 rounded-xl flex items-center justify-center shadow-sm border"
                  style={{ background: theme.light, borderColor: theme.mid }}
                >
                  <ChevronRight className="h-5 w-5" style={{ color: theme.primary }} />
                </motion.button>
                <div className="flex-1">
                  <h2 className="text-lg font-bold text-gray-800" style={{ fontFamily: "'Noto Kufi Arabic', sans-serif" }}>
                    {searchQuery ? `نتائج البحث` : selectedCategory}
                  </h2>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {searchQuery ? `"${searchQuery}"` : `${filteredProducts.length} منتج`}
                  </p>
                </div>
                <div className="h-px flex-1" style={{ background: `linear-gradient(to left, transparent, ${theme.mid})` }} />
              </div>

              {/* قائمة المنتجات */}
              {isLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="h-20 rounded-xl animate-pulse bg-gray-100" />
                  ))}
                </div>
              ) : filteredProducts.length === 0 ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
                  <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: theme.light }}>
                    <Minus className="w-8 h-8" style={{ color: theme.mid }} />
                  </div>
                  <p className="text-gray-500 font-medium">لا توجد منتجات في هذا القسم</p>
                </motion.div>
              ) : (
                <div className="space-y-2.5">
                  {filteredProducts.map((product, index) => {
                    const discounted = hasDiscount(product.discount_percentage, product.original_price, product.price);
                    const finalPrice = discounted ? getDiscountedPrice(product.price, product.discount_percentage, product.original_price) : product.price;
                    const origPrice = discounted ? getOriginalPrice(product.price, product.discount_percentage, product.original_price) : null;

                    return (
                      <motion.div
                        key={product.id}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.04, type: "spring", stiffness: 300, damping: 25 }}
                        onClick={() => handleProductClick(product)}
                        className="relative flex items-stretch rounded-xl bg-white cursor-pointer group overflow-hidden"
                        style={{
                          boxShadow: "0 1px 8px rgba(0,0,0,0.04)",
                          border: "1px solid #f0ede8",
                        }}
                      >
                        {/* خط ملون جانبي */}
                        <div className="w-1 rounded-r-full shrink-0" style={{ background: theme.primary }} />

                        {/* المحتوى */}
                        <div className="flex items-center justify-between flex-1 px-4 py-3.5 min-w-0">
                          {/* المعلومات */}
                          <div className="flex-1 min-w-0 pr-3">
                            <div className="flex items-center gap-2">
                              <p className="text-[15px] font-semibold text-gray-900 truncate leading-tight">
                                {product.name}
                              </p>
                              {product.is_new && (
                                <span className="shrink-0 text-[9px] px-1.5 py-0.5 rounded-full text-white font-bold" style={{ background: "#27ae60" }}>جديد</span>
                              )}
                              {product.is_popular && (
                                <Star className="w-3.5 h-3.5 shrink-0 fill-amber-400 text-amber-400" />
                              )}
                            </div>
                            {product.description && (
                              <p className="text-[12px] text-gray-400 truncate mt-1 leading-tight">{product.description}</p>
                            )}
                            {!product.is_available && (
                              <span className="inline-block text-[10px] text-red-400 font-medium mt-1 bg-red-50 px-1.5 py-0.5 rounded-full">غير متوفر</span>
                            )}
                          </div>

                          {/* السعر */}
                          <div className="shrink-0 text-left flex items-center gap-2">
                            <div>
                              {origPrice && (
                                <p className="text-[11px] text-gray-300 line-through text-center">{formatPrice(origPrice)}</p>
                              )}
                              <p className="text-base font-black tabular-nums" style={{ color: theme.primary }}>
                                {formatPrice(finalPrice)}
                                <span className="text-[10px] font-medium text-gray-400 mr-0.5">د.ع</span>
                              </p>
                            </div>

                            {/* زر إضافة */}
                            {((externalOrdersEnabled && !isStoreOwner) || isEmployeeView) && product.is_available !== false && (
                              <button
                                onClick={(e) => { e.stopPropagation(); handleAddToCart(product); }}
                                className="w-8 h-8 rounded-lg flex items-center justify-center text-white transition-transform active:scale-90"
                                style={{ background: theme.primary }}
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* أزرار المالك */}
                        {isStoreOwner && (
                          <div className="absolute top-1 left-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                            <button onClick={(e) => { e.stopPropagation(); handleEdit(product); }} className="p-1 rounded-md bg-blue-50 text-blue-500 text-xs">✏️</button>
                            <button onClick={(e) => { e.stopPropagation(); handleDelete(product); }} className="p-1 rounded-md bg-red-50 text-red-500 text-xs">🗑️</button>
                          </div>
                        )}

                        {/* تأثير hover */}
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" style={{ background: `linear-gradient(90deg, ${theme.light}, transparent)` }} />
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ═══════ العناصر المشتركة ═══════ */}
      {externalOrdersEnabled && !isStoreOwner && (
        <CartButton onClick={() => setIsCartOpen(true)} colorTheme={colorTheme} />
      )}

      <CartSheet isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} deliveryFee={deliveryFee} storePhone={contactInfo?.phone} storeName={storeName || undefined} />
      <LiveVisitCounter storeOwnerId={storeOwnerId} colorTheme={colorTheme} variant="editorial" />

      <BottomActionsBar
        slug={slug} storeOwnerId={storeOwnerId} colorTheme={colorTheme} socialLinks={socialLinks} contactInfo={contactInfo}
        searchQuery={searchQuery} onSearchChange={handleSearchChange} onClearSearch={clearSearch} isStoreOwner={isStoreOwner}
        storeName={storeName || undefined} fontSettings={fontSettings} products={products} externalOrdersEnabled={externalOrdersEnabled}
        deliveryFee={deliveryFee} logoUrl={logoUrl} favoritesCount={favoritesCount} onOpenFavorites={() => setIsFavoritesOpen(true)}
        categoryImages={categoryImages}
      />

      <ProductDetailsModal product={selectedProduct} isOpen={isModalOpen} onClose={handleCloseModal} colorTheme={colorTheme} isStoreOwner={isStoreOwner}
        onEdit={() => selectedProduct && handleEdit(selectedProduct)} onDelete={() => selectedProduct && handleDelete(selectedProduct)} />

      <EditProductModal product={productToEdit} isOpen={isEditModalOpen} onClose={() => { setIsEditModalOpen(false); setProductToEdit(null); }} onSaved={() => refreshData?.()} />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
            <AlertDialogDescription>هل أنت متأكد من حذف المنتج "{productToDelete?.name}"؟</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">حذف</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <FavoritesSheet isOpen={isFavoritesOpen} onClose={() => setIsFavoritesOpen(false)} favorites={favorites} products={products} colorTheme={colorTheme}
        onRemove={toggleFavorite} onClear={clearFavorites} onProductClick={(product) => { setIsFavoritesOpen(false); handleProductClick(product); }} />

      <ShareProductCard isOpen={!!shareProduct} onClose={() => setShareProduct(null)} product={shareProduct} storeName={storeName || undefined} slug={slug} colorTheme={colorTheme} storeOwnerId={storeOwnerId} />
    </div>
  );
};

export default TextOnlyTemplate;
