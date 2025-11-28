import React, { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { Product } from "@/types/product";
import { CategoryImage } from "@/types/categoryImage";
import CategoryTabs from "./CategoryTabs";
import CompactProductCard from "./CompactProductCard";
import ProductDetailsModal from "./ProductDetailsModal";
import EditProductModal from "./EditProductModal";
import EmptyCategoryMessage from "../EmptyCategoryMessage";
import BottomActionsBar from "./BottomActionsBar";
import StoreHeader from "../StoreHeader";
import { ContactInfo, FontSettings, SocialLinks } from "@/types/store";
import { sortCategoriesByOrder } from "@/utils/categorySort";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useCart } from "@/contexts/CartContext";
import CartButton from "../external-orders/CartButton";
import CartSheet from "../external-orders/CartSheet";
import ExternalOrdersToggle from "../external-orders/ExternalOrdersToggle";
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

interface FastResponseTemplateProps {
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
}

const FastResponseTemplate: React.FC<FastResponseTemplateProps> = ({
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
  refreshData
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
  const { addItem } = useCart();

  // جلب إعدادات الطلبات الخارجية
  useEffect(() => {
    if (!storeOwnerId) return;

    const fetchExternalOrdersSettings = async () => {
      const { data } = await supabase
        .from('store_settings')
        .select('external_orders_enabled, delivery_fee')
        .eq('user_id', storeOwnerId)
        .single();

      if (data) {
        setExternalOrdersEnabled(data.external_orders_enabled || false);
        setDeliveryFee(data.delivery_fee || 0);
      }
    };

    fetchExternalOrdersSettings();

    // الاشتراك في التغييرات
    const channel = supabase
      .channel(`external-orders-${storeOwnerId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'store_settings',
          filter: `user_id=eq.${storeOwnerId}`,
        },
        (payload: any) => {
          if (payload.new) {
            setExternalOrdersEnabled(payload.new.external_orders_enabled || false);
            setDeliveryFee(payload.new.delivery_fee || 0);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [storeOwnerId]);

  // استخراج التصنيفات الفريدة من المنتجات (بدون ترتيب أبجدي)
  const categories = useMemo(() => {
    const uniqueCategories = new Set<string>();
    products.forEach(product => {
      if (product.category) {
        uniqueCategories.add(product.category);
      }
    });
    return Array.from(uniqueCategories);
  }, [products]);

  // تحديد أول تصنيف تلقائياً عند التحميل حسب الترتيب
  React.useEffect(() => {
    if (categories.length > 0 && selectedCategory === null && categoryImages) {
      // استخدام دالة الترتيب الموحدة
      const sortedCategories = sortCategoriesByOrder(categories, categoryImages);
      setSelectedCategory(sortedCategories[0]);
    }
  }, [categories, categoryImages, selectedCategory]);

  // تصفية المنتجات حسب التصنيف والبحث
  const filteredProducts = useMemo(() => {
    let filtered = products;

    // تصفية حسب التصنيف
    if (selectedCategory) {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    // تصفية حسب البحث
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(query) ||
        product.description?.toLowerCase().includes(query) ||
        product.category?.toLowerCase().includes(query)
      );
    }

    // ترتيب حسب display_order إذا كان موجوداً
    return filtered.sort((a, b) => {
      if (a.display_order !== undefined && b.display_order !== undefined) {
        return a.display_order - b.display_order;
      }
      return 0;
    });
  }, [products, selectedCategory, searchQuery]);

  // معالجة تغيير التصنيف
  const handleCategorySelect = useCallback((category: string | null) => {
    setSelectedCategory(category);
    setSearchQuery(""); // مسح البحث عند تغيير التصنيف
  }, []);

  // معالجة البحث
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (onSearchChange) {
      onSearchChange(query);
    }
  }, [onSearchChange]);

  // مسح البحث
  const clearSearch = useCallback(() => {
    setSearchQuery("");
    if (onSearchChange) {
      onSearchChange("");
    }
  }, [onSearchChange]);

  // معالجة فتح تفاصيل المنتج
  const handleProductClick = useCallback((product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  }, []);

  // معالجة إغلاق النافذة
  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedProduct(null), 300);
  }, []);

  // معالجة التعديل
  const handleEdit = useCallback((product: Product) => {
    setProductToEdit(product);
    setIsEditModalOpen(true);
  }, []);

  // معالجة الحذف
  const handleDelete = useCallback((product: Product) => {
    setProductToDelete(product);
    setIsDeleteDialogOpen(true);
  }, []);

  // معالجة الإضافة للسلة
  const handleAddToCart = useCallback((product: Product) => {
    addItem(product, 1);
    toast.success(`تمت إضافة ${product.name} إلى السلة`);
  }, [addItem]);

  // تأكيد الحذف
  const confirmDelete = useCallback(async () => {
    if (!productToDelete) return;

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productToDelete.id);

      if (error) throw error;

      // حذف الصورة من التخزين
      if (productToDelete.image_url) {
        const fileName = productToDelete.image_url.split('/').pop();
        if (fileName) {
          await supabase.storage
            .from('product-images')
            .remove([`${productToDelete.user_id}/${fileName}`]);
        }
      }

      toast.success("تم حذف المنتج بنجاح");
      refreshData?.();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error("حدث خطأ أثناء حذف المنتج");
    } finally {
      setIsDeleteDialogOpen(false);
      setProductToDelete(null);
    }
  }, [productToDelete, refreshData]);

  return (
    <div className="min-h-screen">
      {/* زر تفعيل/إيقاف الطلبات الخارجية */}
      {storeOwnerId && (
        <ExternalOrdersToggle 
          storeOwnerId={storeOwnerId} 
          isStoreOwner={isStoreOwner}
        />
      )}

      {/* رأس المتجر مع الأنيميشن */}
      {storeName && (
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 pt-2 pb-1 relative z-10">
          <div className="px-3">
      <StoreHeader 
        storeName={storeName} 
        colorTheme={colorTheme}
        fontSettings={fontSettings}
      />
          </div>
        </div>
      )}

      {/* شريط التصنيفات */}
      <CategoryTabs
        categories={categories}
        selectedCategory={selectedCategory}
        onCategorySelect={handleCategorySelect}
        colorTheme={colorTheme}
        categoryImages={categoryImages}
        isStoreOwner={isStoreOwner}
        storeOwnerId={storeOwnerId}
        refreshData={refreshData}
      />

      {/* منطقة المحتوى */}
      <div className="px-3 py-4 pb-24">
        {/* عرض عدد المنتجات */}
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {selectedCategory ? `${selectedCategory} (${filteredProducts.length})` : `جميع المنتجات (${filteredProducts.length})`}
          </p>
          {searchQuery && (
            <p className="text-xs text-muted-foreground">
              نتائج البحث: "{searchQuery}"
            </p>
          )}
        </div>

        {/* قائمة المنتجات */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredProducts.map((product) => (
              <CompactProductCard
                key={product.id}
                product={product}
                colorTheme={colorTheme}
                onClick={() => handleProductClick(product)}
                isStoreOwner={isStoreOwner}
                onEdit={() => handleEdit(product)}
                onDelete={() => handleDelete(product)}
                onAddToCart={handleAddToCart}
                showAddButton={externalOrdersEnabled && !isStoreOwner}
              />
            ))}
          </div>
        ) : (
          <EmptyCategoryMessage
            searchQuery={searchQuery}
            selectedCategory={selectedCategory}
          />
        )}
      </div>

      {/* زر السلة العائم */}
      {externalOrdersEnabled && !isStoreOwner && (
        <CartButton 
          onClick={() => setIsCartOpen(true)}
          colorTheme={colorTheme}
        />
      )}

      {/* نافذة السلة */}
      <CartSheet
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        deliveryFee={deliveryFee}
        storePhone={contactInfo?.phone}
        storeName={storeName || undefined}
      />

      {/* الشريط الأفقي السفلي مع البحث المدمج */}
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
      />

      {/* نافذة تفاصيل المنتج */}
      <ProductDetailsModal
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        colorTheme={colorTheme}
        isStoreOwner={isStoreOwner}
        onEdit={() => selectedProduct && handleEdit(selectedProduct)}
        onDelete={() => selectedProduct && handleDelete(selectedProduct)}
      />

      {/* نافذة تعديل المنتج */}
      <EditProductModal
        product={productToEdit}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setProductToEdit(null);
        }}
        onSaved={() => {
          refreshData?.();
        }}
      />

      {/* مربع تأكيد الحذف */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف المنتج "{productToDelete?.name}"؟ 
              لا يمكن التراجع عن هذا الإجراء.
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
    </div>
  );
};

export default FastResponseTemplate;
