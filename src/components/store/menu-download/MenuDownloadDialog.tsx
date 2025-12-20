import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Product } from '@/types/product';

interface MenuDownloadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  storeName: string;
  products: Product[];
  colorTheme?: string | null;
}

// تحويل الصورة إلى Base64
const imageToBase64 = async (url: string): Promise<string | null> => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    return null;
  }
};

const formatPrice = (price: number): string => {
  return price.toLocaleString('ar-IQ') + ' د.ع';
};

const generateMenuHTML = async (
  storeName: string,
  products: Product[],
  colorTheme: string | null,
  includeImages: boolean,
  onProgress?: (current: number, total: number) => void
): Promise<string> => {
  const productsByCategory = products.reduce((acc, product) => {
    const category = product.category || 'بدون تصنيف';
    if (!acc[category]) acc[category] = [];
    acc[category].push(product);
    return acc;
  }, {} as Record<string, Product[]>);

  let finalProductsByCategory = productsByCategory;

  if (includeImages) {
    const productsWithImages: Product[] = [];
    const totalProducts = products.length;
    let currentProduct = 0;

    for (const product of products) {
      currentProduct++;
      onProgress?.(currentProduct, totalProducts);

      let imageBase64: string | null = null;
      if (product.image_url) {
        imageBase64 = await imageToBase64(product.image_url);
      }

      productsWithImages.push({
        ...product,
        image_url: imageBase64 || undefined
      });
    }

    finalProductsByCategory = productsWithImages.reduce((acc, product) => {
      const category = product.category || 'بدون تصنيف';
      if (!acc[category]) acc[category] = [];
      acc[category].push(product);
      return acc;
    }, {} as Record<string, Product[]>);
  }

  const themeColor = colorTheme?.startsWith('#') ? colorTheme : '#3b82f6';

  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${storeName} - المنيو</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Tahoma, sans-serif; background: #f8fafc; color: #1e293b; }
    .container { max-width: 800px; margin: 0 auto; padding: 20px; }
    .header { text-align: center; padding: 30px; background: linear-gradient(135deg, ${themeColor}, ${themeColor}dd); color: white; border-radius: 16px; margin-bottom: 30px; }
    .header h1 { font-size: 2rem; margin-bottom: 8px; }
    .category { margin-bottom: 30px; }
    .category-title { font-size: 1.3rem; font-weight: 700; color: ${themeColor}; padding: 12px 0; border-bottom: 2px solid ${themeColor}20; margin-bottom: 16px; }
    .products-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 16px; }
    .product { background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
    .product-image { width: 100%; height: 140px; object-fit: cover; background: #f1f5f9; }
    .product-info { padding: 12px; }
    .product-name { font-weight: 600; margin-bottom: 4px; }
    .product-desc { font-size: 0.8rem; color: #64748b; margin-bottom: 8px; }
    .product-price { font-weight: 700; color: ${themeColor}; }
    .footer { text-align: center; padding: 20px; color: #94a3b8; font-size: 0.85rem; }
    @media print { body { background: white; } .container { max-width: 100%; } }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${storeName}</h1>
      <p>قائمة الطعام</p>
    </div>
    ${Object.entries(finalProductsByCategory).map(([category, prods]) => `
      <div class="category">
        <h2 class="category-title">${category}</h2>
        <div class="products-grid">
          ${(prods as Product[]).map(product => `
            <div class="product">
              ${includeImages && product.image_url ? `<img class="product-image" src="${product.image_url}" alt="${product.name}">` : ''}
              <div class="product-info">
                <div class="product-name">${product.name}</div>
                ${product.description ? `<div class="product-desc">${product.description}</div>` : ''}
                <div class="product-price">${formatPrice(product.price)}</div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `).join('')}
    <div class="footer">
      <p>تم إنشاء هذا المنيو بواسطة QR Menu</p>
    </div>
  </div>
</body>
</html>`;
};

const MenuDownloadDialog = ({ isOpen, onClose, storeName, products, colorTheme }: MenuDownloadDialogProps) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [includeImages, setIncludeImages] = useState(true);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(true);

  const categories = useMemo(() => {
    const uniqueCategories = new Set<string>();
    products.forEach(product => {
      if (product.category) uniqueCategories.add(product.category);
    });
    return Array.from(uniqueCategories);
  }, [products]);

  const handleSelectAllChange = (checked: boolean) => {
    setSelectAll(checked);
    if (checked) setSelectedCategories([]);
  };

  const toggleCategory = (category: string) => {
    if (selectAll) {
      setSelectAll(false);
      setSelectedCategories([category]);
    } else {
      setSelectedCategories(prev => {
        if (prev.includes(category)) {
          const newSelected = prev.filter(c => c !== category);
          if (newSelected.length === 0) setSelectAll(true);
          return newSelected;
        } else {
          return [...prev, category];
        }
      });
    }
  };

  const filteredProducts = useMemo(() => {
    if (selectAll) return products;
    return products.filter(p => p.category && selectedCategories.includes(p.category));
  }, [products, selectAll, selectedCategories]);

  const handleDownload = async () => {
    if (filteredProducts.length === 0) {
      toast.error('الرجاء اختيار تصنيف واحد على الأقل');
      return;
    }

    setIsDownloading(true);
    setProgress({ current: 0, total: filteredProducts.length });

    try {
      const html = await generateMenuHTML(
        storeName,
        filteredProducts,
        colorTheme || null,
        includeImages,
        (current, total) => setProgress({ current, total })
      );

      const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `menu-${storeName.replace(/\s+/g, '-')}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('تم تحميل المنيو بنجاح!');
      onClose();
    } catch (error) {
      console.error('خطأ في تحميل المنيو:', error);
      toast.error('فشل تحميل المنيو');
    } finally {
      setIsDownloading(false);
      setProgress({ current: 0, total: 0 });
    }
  };

  const themeColor = colorTheme?.startsWith('#') ? colorTheme : '#3b82f6';

  if (!isOpen) return null;

  return (
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

          {/* النافذة العائمة */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="pointer-events-auto w-full max-w-md">
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
                {/* تأثير الإضاءة */}
                <div 
                  className="absolute top-0 left-0 right-0 h-32 opacity-30 pointer-events-none"
                  style={{
                    background: 'linear-gradient(180deg, rgba(255,255,255,0.4) 0%, transparent 100%)',
                  }}
                />

                <div className="relative p-6 text-white">
                  {/* العنوان */}
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.1, type: "spring" }}
                    className="text-center mb-6"
                  >
                    <div className="mx-auto mb-3 w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-lg border border-white/30 flex items-center justify-center">
                      <Download className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-xl font-bold drop-shadow-lg">تحميل المنيو</h2>
                    <p className="text-white/80 text-sm mt-1">حمّل المنيو كملف جاهز للطباعة</p>
                  </motion.div>

                  {/* المحتوى */}
                  <div className="bg-white/95 rounded-2xl p-4 space-y-4">
                    {/* خيار الصور */}
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="include-images"
                        checked={includeImages}
                        onCheckedChange={(checked) => setIncludeImages(checked as boolean)}
                      />
                      <Label htmlFor="include-images" className="text-sm cursor-pointer text-gray-700">
                        تضمين صور المنتجات
                      </Label>
                    </div>

                    {/* اختيار التصنيفات */}
                    {categories.length > 1 && (
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">التصنيفات:</Label>
                        <div className="flex flex-wrap gap-2">
                          <div
                            onClick={() => handleSelectAllChange(true)}
                            className={`px-3 py-1.5 rounded-full text-xs cursor-pointer transition-all ${
                              selectAll 
                                ? 'text-white' 
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                            style={selectAll ? { backgroundColor: themeColor } : {}}
                          >
                            الكل
                          </div>
                          {categories.map(category => (
                            <div
                              key={category}
                              onClick={() => toggleCategory(category)}
                              className={`px-3 py-1.5 rounded-full text-xs cursor-pointer transition-all ${
                                !selectAll && selectedCategories.includes(category)
                                  ? 'text-white'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }`}
                              style={!selectAll && selectedCategories.includes(category) ? { backgroundColor: themeColor } : {}}
                            >
                              {category}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <p className="text-xs text-gray-500">
                      سيتم تحميل {filteredProducts.length} منتج
                    </p>

                    {/* شريط التقدم */}
                    {isDownloading && includeImages && (
                      <div className="space-y-1">
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full transition-all duration-300"
                            style={{ 
                              width: `${(progress.current / progress.total) * 100}%`,
                              backgroundColor: themeColor 
                            }}
                          />
                        </div>
                        <p className="text-xs text-center text-gray-500">
                          جاري تحميل الصور... {progress.current}/{progress.total}
                        </p>
                      </div>
                    )}

                    {/* زر التحميل */}
                    <Button 
                      onClick={handleDownload}
                      disabled={isDownloading || filteredProducts.length === 0}
                      className="w-full"
                      style={{ backgroundColor: themeColor }}
                    >
                      {isDownloading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          جاري التحميل...
                        </>
                      ) : (
                        <>
                          <Download className="h-4 w-4 mr-2" />
                          تحميل المنيو
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default MenuDownloadDialog;
