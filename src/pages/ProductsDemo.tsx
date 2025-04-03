
import { useState } from "react";
import { Product } from "@/types/product";
import StoreHeader from "@/components/store/StoreHeader";
import SearchBar from "@/components/store/SearchBar";
import CategoryGrid from "@/components/store/CategoryGrid";
import ProductGrid from "@/components/store/ProductGrid";
import { Instagram, Facebook, MessageSquare } from "lucide-react";

// Sample products data
const sampleProducts: Product[] = [
  {
    id: "1",
    name: "هاتف ذكي",
    description: "هاتف ذكي بمواصفات عالية وكاميرا متطورة",
    price: 250000,
    image_url: "/lovable-uploads/e78cce88-ead6-4a09-ba47-8f8b59485cbb.png",
    category: "إلكترونيات",
    is_new: true,
    is_popular: true
  },
  {
    id: "2",
    name: "حاسوب محمول",
    description: "حاسوب محمول خفيف الوزن مع بطارية طويلة العمر",
    price: 450000,
    image_url: "/lovable-uploads/e78cce88-ead6-4a09-ba47-8f8b59485cbb.png",
    category: "إلكترونيات",
    is_new: false,
    is_popular: true
  },
  {
    id: "3",
    name: "سماعات لاسلكية",
    description: "سماعات لاسلكية بجودة صوت عالية",
    price: 75000,
    image_url: "/lovable-uploads/e78cce88-ead6-4a09-ba47-8f8b59485cbb.png",
    category: "إلكترونيات",
    is_new: true,
    is_popular: false
  },
  {
    id: "4",
    name: "ساعة ذكية",
    description: "ساعة ذكية تتبع النشاط البدني وتنبيهات الهاتف",
    price: 120000,
    image_url: "/lovable-uploads/e78cce88-ead6-4a09-ba47-8f8b59485cbb.png",
    category: "اكسسوارات",
    is_new: false,
    is_popular: true
  },
  {
    id: "5",
    name: "حقيبة ظهر",
    description: "حقيبة ظهر عصرية مع مكان للحاسوب",
    price: 60000,
    image_url: "/lovable-uploads/e78cce88-ead6-4a09-ba47-8f8b59485cbb.png",
    category: "حقائب",
    is_new: true,
    is_popular: false
  },
  {
    id: "6",
    name: "طاولة مكتب",
    description: "طاولة مكتب خشبية أنيقة",
    price: 180000,
    image_url: "/lovable-uploads/e78cce88-ead6-4a09-ba47-8f8b59485cbb.png",
    category: "أثاث",
    is_new: false,
    is_popular: false
  }
];

const ProductsDemo = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  const categories = Array.from(new Set(sampleProducts.map(p => p.category).filter(Boolean)));
  
  const filteredProducts = selectedCategory
    ? sampleProducts.filter(p => 
        p.category === selectedCategory && 
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : sampleProducts.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
      );

  const getCategoryImage = (category: string) => {
    const categoryProduct = sampleProducts.find(p => p.category === category);
    return categoryProduct?.image_url || '/placeholder.svg';
  };

  const socialLinks = {
    instagram: "https://instagram.com",
    facebook: "https://facebook.com",
    telegram: "https://t.me"
  };

  const getSocialIcon = (platform: string, url: string) => {
    if (!url) return null;

    const iconClasses = "w-5 h-5 transition-colors duration-300";
    const linkClasses = "hover:opacity-75 transition-opacity";

    switch (platform) {
      case 'instagram':
        return (
          <a href={url} target="_blank" rel="noopener noreferrer" className={linkClasses}>
            <Instagram className={`${iconClasses} text-pink-500`} />
          </a>
        );
      case 'facebook':
        return (
          <a href={url} target="_blank" rel="noopener noreferrer" className={linkClasses}>
            <Facebook className={`${iconClasses} text-blue-500`} />
          </a>
        );
      case 'telegram':
        return (
          <a href={url} target="_blank" rel="noopener noreferrer" className={linkClasses}>
            <MessageSquare className={`${iconClasses} text-blue-400`} />
          </a>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100">
      <div className="container mx-auto py-6 px-4 max-w-6xl">
        <StoreHeader storeName="متجر نموذجي" colorTheme="default" />
        <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

        {!selectedCategory ? (
          <CategoryGrid
            categories={categories}
            getCategoryImage={getCategoryImage}
            onCategorySelect={setSelectedCategory}
          />
        ) : (
          <>
            <button
              onClick={() => setSelectedCategory(null)}
              className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors"
            >
              <span>← رجوع إلى التصنيفات</span>
            </button>
            <ProductGrid products={filteredProducts} />
          </>
        )}

        {selectedCategory && filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">
              لا توجد منتجات في هذا التصنيف
            </p>
          </div>
        )}

        <div className="fixed bottom-4 left-4 flex gap-4 bg-white/80 dark:bg-gray-800/80 p-3 rounded-full shadow-lg backdrop-blur-sm">
          {Object.entries(socialLinks).map(([platform, url]) => (
            getSocialIcon(platform, url)
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductsDemo;
