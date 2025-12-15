/**
 * مكون تحميل المنيو كملف HTML جاهز للطباعة
 * يدعم اختيار تصنيفات محددة وخيار تضمين/استثناء الصور
 */

import { useState, useMemo } from 'react';
import { Download, Loader2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { Product } from '@/types/product';

interface MenuDownloaderProps {
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
    console.warn('فشل تحميل الصورة:', url);
    return null;
  }
};

// تنسيق السعر
const formatPrice = (price: number): string => {
  return price.toLocaleString('ar-IQ') + ' د.ع';
};

// توليد HTML للمنيو
const generateMenuHTML = async (
  storeName: string,
  products: Product[],
  colorTheme: string | null,
  includeImages: boolean,
  onProgress?: (current: number, total: number) => void
): Promise<string> => {
  // تجميع المنتجات حسب التصنيف
  const productsByCategory = products.reduce((acc, product) => {
    const category = product.category || 'بدون تصنيف';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(product);
    return acc;
  }, {} as Record<string, Product[]>);

  // تحميل الصور وتحويلها إلى Base64 (فقط إذا كان المستخدم يريد الصور)
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

    // إعادة تجميع المنتجات مع الصور
    finalProductsByCategory = productsWithImages.reduce((acc, product) => {
      const category = product.category || 'بدون تصنيف';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(product);
      return acc;
    }, {} as Record<string, Product[]>);
  }

  // تحديد لون الثيم
  const getThemeColor = (theme: string | null): string => {
    if (theme?.startsWith('#')) return theme;
    switch (theme) {
      case 'coral': return '#ff9178';
      case 'purple': return '#9333ea';
      case 'blue': return '#2563eb';
      case 'green': return '#16a34a';
      case 'pink': return '#ec4899';
      case 'teal': return '#14b8a6';
      case 'amber': return '#f59e0b';
      case 'indigo': return '#6366f1';
      case 'rose': return '#f43f5e';
      default: return '#3b82f6';
    }
  };

  const themeColor = getThemeColor(colorTheme);
  const currentDate = new Date().toLocaleDateString('ar-IQ', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // توليد HTML
  const categoriesHTML = Object.entries(finalProductsByCategory).map(([category, categoryProducts]) => {
    const productsHTML = categoryProducts.map(product => `
      <div class="product-card">
        ${includeImages && product.image_url ? `
          <div class="product-image">
            <img src="${product.image_url}" alt="${product.name}" onerror="this.style.display='none'">
          </div>
        ` : ''}
        <div class="product-info">
          <div class="product-header">
            <h3 class="product-name">${product.name}</h3>
            <span class="product-price">${formatPrice(product.price)}</span>
          </div>
          ${product.description ? `<p class="product-description">${product.description}</p>` : ''}
          <div class="product-badges">
            ${product.is_new ? '<span class="badge badge-new">جديد</span>' : ''}
            ${product.is_popular ? '<span class="badge badge-popular">مطلوب</span>' : ''}
            ${product.is_available === false ? '<span class="badge badge-unavailable">غير متوفر</span>' : ''}
          </div>
        </div>
      </div>
    `).join('');

    return `
      <div class="category-section">
        <h2 class="category-title">${category}</h2>
        <div class="products-grid">
          ${productsHTML}
        </div>
      </div>
    `;
  }).join('');

  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>منيو ${storeName}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Segoe UI', Tahoma, Arial, sans-serif;
      background: #f8fafc;
      color: #1e293b;
      line-height: 1.6;
      direction: rtl;
    }
    
    .container {
      max-width: 900px;
      margin: 0 auto;
      padding: 20px;
    }
    
    .header {
      text-align: center;
      padding: 40px 20px;
      background: linear-gradient(135deg, ${themeColor}, ${themeColor}dd);
      color: white;
      border-radius: 16px;
      margin-bottom: 30px;
      box-shadow: 0 10px 40px ${themeColor}40;
    }
    
    .header h1 {
      font-size: 2.5rem;
      margin-bottom: 10px;
    }
    
    .header .date {
      font-size: 0.9rem;
      opacity: 0.9;
    }
    
    .category-section {
      margin-bottom: 40px;
    }
    
    .category-title {
      font-size: 1.5rem;
      color: ${themeColor};
      padding: 10px 20px;
      background: linear-gradient(90deg, ${themeColor}15, transparent);
      border-right: 4px solid ${themeColor};
      margin-bottom: 20px;
      border-radius: 0 8px 8px 0;
    }
    
    .products-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(${includeImages ? '280px' : '200px'}, 1fr));
      gap: 20px;
    }
    
    .product-card {
      background: white;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 2px 10px rgba(0,0,0,0.08);
      transition: transform 0.2s, box-shadow 0.2s;
      page-break-inside: avoid;
    }
    
    .product-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(0,0,0,0.12);
    }
    
    .product-image {
      width: 100%;
      height: 180px;
      overflow: hidden;
      background: #f1f5f9;
    }
    
    .product-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    
    .product-info {
      padding: 16px;
    }
    
    .product-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 10px;
      margin-bottom: 8px;
    }
    
    .product-name {
      font-size: 1.1rem;
      font-weight: 600;
      color: #1e293b;
    }
    
    .product-price {
      font-size: 1rem;
      font-weight: 700;
      color: #16a34a;
      white-space: nowrap;
    }
    
    .product-description {
      font-size: 0.9rem;
      color: #64748b;
      margin-bottom: 10px;
    }
    
    .product-badges {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }
    
    .badge {
      font-size: 0.75rem;
      padding: 4px 10px;
      border-radius: 20px;
      font-weight: 500;
    }
    
    .badge-new {
      background: #dbeafe;
      color: #1d4ed8;
    }
    
    .badge-popular {
      background: #fef2f2;
      color: #dc2626;
    }
    
    .badge-unavailable {
      background: #f1f5f9;
      color: #64748b;
    }
    
    .footer {
      text-align: center;
      padding: 30px;
      color: #94a3b8;
      font-size: 0.9rem;
      border-top: 1px solid #e2e8f0;
      margin-top: 40px;
    }
    
    .total-products {
      background: ${themeColor}10;
      color: ${themeColor};
      padding: 10px 20px;
      border-radius: 8px;
      display: inline-block;
      margin-bottom: 20px;
      font-weight: 500;
    }
    
    @media print {
      body {
        background: white;
      }
      
      .header {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      
      .product-card {
        break-inside: avoid;
        box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      }
      
      .category-title {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
    }
    
    @media (max-width: 640px) {
      .header h1 {
        font-size: 1.8rem;
      }
      
      .products-grid {
        grid-template-columns: 1fr;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <header class="header">
      <h1>${storeName}</h1>
      <p class="date">تم التحديث: ${currentDate}</p>
    </header>
    
    <div class="total-products">
      إجمالي المنتجات: ${products.length} منتج في ${Object.keys(finalProductsByCategory).length} تصنيف
    </div>
    
    ${categoriesHTML}
    
    <footer class="footer">
      <p>تم إنشاء هذا المنيو تلقائياً من نظام QR Menu</p>
    </footer>
  </div>
</body>
</html>`;
};

const MenuDownloader = ({ storeName, products, colorTheme }: MenuDownloaderProps) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [includeImages, setIncludeImages] = useState(true);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(true);

  // استخراج التصنيفات الفريدة
  const categories = useMemo(() => {
    const uniqueCategories = new Set<string>();
    products.forEach(product => {
      if (product.category) {
        uniqueCategories.add(product.category);
      }
    });
    return Array.from(uniqueCategories);
  }, [products]);

  // تحديث التصنيفات المحددة عند تغيير "تحديد الكل"
  const handleSelectAllChange = (checked: boolean) => {
    setSelectAll(checked);
    if (checked) {
      setSelectedCategories([]);
    }
  };

  // التبديل لتصنيف معين
  const toggleCategory = (category: string) => {
    if (selectAll) {
      // عند إلغاء "تحديد الكل" وتحديد تصنيف معين
      setSelectAll(false);
      setSelectedCategories([category]);
    } else {
      setSelectedCategories(prev => {
        if (prev.includes(category)) {
          const newSelected = prev.filter(c => c !== category);
          // إذا أصبحت القائمة فارغة، نعود لتحديد الكل
          if (newSelected.length === 0) {
            setSelectAll(true);
          }
          return newSelected;
        } else {
          return [...prev, category];
        }
      });
    }
  };

  // تصفية المنتجات حسب التصنيفات المحددة
  const filteredProducts = useMemo(() => {
    if (selectAll) {
      return products;
    }
    return products.filter(p => p.category && selectedCategories.includes(p.category));
  }, [products, selectAll, selectedCategories]);

  const handleDownload = async () => {
    if (filteredProducts.length === 0) {
      toast.error('لا توجد منتجات للتحميل');
      return;
    }

    setIsDownloading(true);
    setProgress({ current: 0, total: includeImages ? filteredProducts.length : 0 });

    try {
      toast.info('جاري تحضير المنيو...', { duration: 2000 });

      const htmlContent = await generateMenuHTML(
        storeName,
        filteredProducts,
        colorTheme || null,
        includeImages,
        (current, total) => setProgress({ current, total })
      );

      // إنشاء ملف وتحميله
      const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `menu-${storeName.replace(/\s+/g, '-')}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('تم تحميل المنيو بنجاح!');
    } catch (error) {
      console.error('خطأ في تحميل المنيو:', error);
      toast.error('فشل تحميل المنيو');
    } finally {
      setIsDownloading(false);
      setProgress({ current: 0, total: 0 });
    }
  };

  if (products.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <Separator />
      
      <div>
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <Download className="h-5 w-5" style={{ color: colorTheme?.startsWith('#') ? colorTheme : undefined }} />
          تحميل المنيو
        </h3>

        {/* خيار تضمين الصور */}
        <div className="flex items-center gap-2 mb-3">
          <Checkbox
            id="include-images"
            checked={includeImages}
            onCheckedChange={(checked) => setIncludeImages(checked as boolean)}
          />
          <Label htmlFor="include-images" className="text-sm cursor-pointer">
            تضمين الصور (أبطأ لكن أجمل)
          </Label>
        </div>

        {/* خيار تحديد الكل */}
        <div className="flex items-center gap-2 mb-2">
          <Checkbox
            id="select-all"
            checked={selectAll}
            onCheckedChange={handleSelectAllChange}
          />
          <Label htmlFor="select-all" className="text-sm cursor-pointer font-medium">
            جميع التصنيفات ({products.length} منتج)
          </Label>
        </div>

        {/* قائمة التصنيفات */}
        <div className="max-h-32 overflow-y-auto space-y-1 pr-4 mb-3">
          {categories.map(category => {
            const categoryProductsCount = products.filter(p => p.category === category).length;
            const isChecked = selectAll || selectedCategories.includes(category);
            
            return (
              <div key={category} className="flex items-center gap-2">
                <Checkbox
                  id={`cat-${category}`}
                  checked={isChecked}
                  onCheckedChange={() => toggleCategory(category)}
                />
                <Label htmlFor={`cat-${category}`} className="text-sm cursor-pointer flex-1">
                  {category} ({categoryProductsCount})
                </Label>
              </div>
            );
          })}
        </div>

        {/* زر التحميل */}
        <Button
          onClick={handleDownload}
          disabled={isDownloading || filteredProducts.length === 0}
          className="w-full gap-2"
          style={{
            backgroundColor: colorTheme?.startsWith('#') ? colorTheme : undefined,
          }}
        >
          {isDownloading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {includeImages 
                ? `جاري التحميل... (${progress.current}/${progress.total})`
                : 'جاري التحميل...'
              }
            </>
          ) : (
            <>
              <Download className="h-4 w-4" />
              تحميل ({filteredProducts.length} منتج)
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default MenuDownloader;
