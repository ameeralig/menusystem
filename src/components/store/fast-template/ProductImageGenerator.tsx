import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wand2, Loader2, Check, X, ImagePlus, Sparkles, Image, Palette, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Product } from "@/types/product";

type ImageStyle = 'icon' | 'realistic' | 'cartoon' | 'custom';

interface StyleOption {
  id: ImageStyle;
  label: string;
  icon: React.ReactNode;
  description: string;
}

interface ProductImageGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  colorTheme?: string | null;
  onGenerated?: () => void;
}

interface GenerationStatus {
  [productId: string]: 'idle' | 'generating' | 'done' | 'error';
}

const ProductImageGenerator: React.FC<ProductImageGeneratorProps> = ({
  isOpen,
  onClose,
  products,
  colorTheme,
  onGenerated,
}) => {
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [generationStatus, setGenerationStatus] = useState<GenerationStatus>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState<ImageStyle>('realistic');
  const [customPrompt, setCustomPrompt] = useState('');
  const [filterNoImage, setFilterNoImage] = useState(false);

  const themeColor = useMemo(() => {
    if (colorTheme?.startsWith("#")) return colorTheme;
    const colors: Record<string, string> = {
      coral: "#fb923c", purple: "#a855f7", blue: "#3b82f6",
      green: "#22c55e", red: "#ef4444", pink: "#ec4899",
      teal: "#14b8a6", amber: "#f59e0b", indigo: "#6366f1", rose: "#f43f5e",
    };
    return colors[colorTheme || ""] || "#3b82f6";
  }, [colorTheme]);

  const styleOptions: StyleOption[] = [
    { id: 'realistic', label: 'صورة حقيقية', icon: <Image className="h-5 w-5" />, description: 'تصوير احترافي واقعي' },
    { id: 'icon', label: 'أيقونة', icon: <Sparkles className="h-5 w-5" />, description: 'أيقونة بسيطة وأنيقة' },
    { id: 'cartoon', label: 'رسم كرتوني', icon: <Palette className="h-5 w-5" />, description: 'رسم كرتوني ملون' },
    { id: 'custom', label: 'مخصص', icon: <MessageSquare className="h-5 w-5" />, description: 'أدخل وصفك الخاص' },
  ];

  const displayProducts = useMemo(() => {
    if (filterNoImage) return products.filter(p => !p.image_url);
    return products;
  }, [products, filterNoImage]);

  const productsWithoutImages = useMemo(() => products.filter(p => !p.image_url).length, [products]);

  const toggleProduct = (productId: string) => {
    setSelectedProducts(prev =>
      prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]
    );
  };

  const selectAll = () => {
    const ids = displayProducts.map(p => p.id);
    if (selectedProducts.length === ids.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(ids);
    }
  };

  const generateForProduct = async (product: Product): Promise<boolean> => {
    try {
      setGenerationStatus(prev => ({ ...prev, [product.id]: 'generating' }));

      const { data, error } = await supabase.functions.invoke('generate-product-image', {
        body: {
          productName: product.name,
          category: product.category,
          style: selectedStyle,
          customPrompt: selectedStyle === 'custom' ? customPrompt : undefined,
          oldImageUrl: product.image_url || undefined,
        },
      });

      if (error) throw error;
      if (!data?.success || !data?.imageUrl) {
        throw new Error(data?.error || 'فشل التوليد');
      }

      // Update product image_url
      const { error: updateError } = await supabase
        .from('products')
        .update({ image_url: data.imageUrl })
        .eq('id', product.id);

      if (updateError) throw updateError;

      setGenerationStatus(prev => ({ ...prev, [product.id]: 'done' }));
      return true;
    } catch (err: any) {
      console.error(`Error generating image for ${product.name}:`, err);
      setGenerationStatus(prev => ({ ...prev, [product.id]: 'error' }));
      return false;
    }
  };

  const handleGenerate = async () => {
    if (selectedProducts.length === 0) {
      toast.error("اختر منتجاً واحداً على الأقل");
      return;
    }
    if (selectedStyle === 'custom' && !customPrompt.trim()) {
      toast.error("أدخل وصفاً مخصصاً للتوليد");
      return;
    }

    setIsGenerating(true);
    let successCount = 0;

    for (const productId of selectedProducts) {
      const product = products.find(p => p.id === productId);
      if (product) {
        const success = await generateForProduct(product);
        if (success) successCount++;
      }
    }

    setIsGenerating(false);

    if (successCount > 0) {
      toast.success(`تم توليد ${successCount} صورة بنجاح`);
      onGenerated?.();
    }
    if (successCount < selectedProducts.length) {
      toast.error(`فشل توليد ${selectedProducts.length - successCount} صورة`);
    }
  };

  const handleClose = () => {
    if (!isGenerating) {
      setSelectedProducts([]);
      setGenerationStatus({});
      setSelectedStyle('realistic');
      setCustomPrompt('');
      setFilterNoImage(false);
      onClose();
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={handleClose}>
      <SheetContent side="bottom" className="rounded-t-3xl max-h-[85vh] overflow-y-auto">
        <SheetHeader className="text-center pb-4">
          <SheetTitle className="flex items-center justify-center gap-2 text-xl">
            <Sparkles className="h-5 w-5" style={{ color: themeColor }} />
            توليد صور المنتجات بالذكاء الاصطناعي
          </SheetTitle>
          <p className="text-sm text-muted-foreground">
            اختر نمط الصورة والمنتجات المطلوبة (WebP مضغوط)
          </p>
        </SheetHeader>

        <div className="space-y-4 py-4">
          {/* اختيار نمط الصورة */}
          <div className="space-y-2">
            <p className="text-sm font-semibold text-foreground">نمط الصورة</p>
            <div className="grid grid-cols-2 gap-2">
              {styleOptions.map((style) => {
                const isActive = selectedStyle === style.id;
                return (
                  <motion.button
                    key={style.id}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => !isGenerating && setSelectedStyle(style.id)}
                    className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all text-right ${
                      isActive ? 'shadow-md' : 'border-border'
                    }`}
                    style={isActive ? { borderColor: themeColor, backgroundColor: `${themeColor}10` } : {}}
                    disabled={isGenerating}
                  >
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                      style={{ backgroundColor: isActive ? `${themeColor}20` : undefined, color: isActive ? themeColor : undefined }}
                    >
                      {style.icon}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate">{style.label}</p>
                      <p className="text-[11px] text-muted-foreground truncate">{style.description}</p>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* حقل الوصف المخصص */}
          <AnimatePresence>
            {selectedStyle === 'custom' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <Input
                  placeholder="مثال: صورة بإضاءة دافئة وخلفية خشبية..."
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  disabled={isGenerating}
                  className="text-right"
                  dir="rtl"
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* فلتر بدون صورة */}
          {productsWithoutImages > 0 && (
            <Button
              variant={filterNoImage ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setFilterNoImage(!filterNoImage);
                setSelectedProducts([]);
              }}
              className="w-full gap-2"
              disabled={isGenerating}
              style={filterNoImage ? { background: themeColor } : {}}
            >
              <ImagePlus className="h-4 w-4" />
              {filterNoImage ? `عرض الكل (${products.length})` : `المنتجات بدون صور فقط (${productsWithoutImages})`}
            </Button>
          )}

          {/* زر تحديد الكل */}
          <Button
            variant="outline"
            size="sm"
            onClick={selectAll}
            className="w-full gap-2"
            disabled={isGenerating}
          >
            {selectedProducts.length === displayProducts.length && displayProducts.length > 0 ? (
              <><X className="h-4 w-4" /> إلغاء تحديد الكل</>
            ) : (
              <><Check className="h-4 w-4" /> تحديد الكل ({displayProducts.length})</>
            )}
          </Button>

          {/* قائمة المنتجات */}
          <div className="space-y-2 max-h-[35vh] overflow-y-auto">
            {displayProducts.map((product) => {
              const status = generationStatus[product.id] || 'idle';
              const isSelected = selectedProducts.includes(product.id);

              return (
                <motion.div
                  key={product.id}
                  layout
                  className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all cursor-pointer ${
                    isSelected ? 'border-opacity-100' : 'border-border'
                  }`}
                  style={isSelected ? { borderColor: themeColor, backgroundColor: `${themeColor}10` } : {}}
                  onClick={() => !isGenerating && toggleProduct(product.id)}
                >
                  <Checkbox
                    checked={isSelected}
                    disabled={isGenerating}
                    className="data-[state=checked]:border-current"
                    style={isSelected ? { borderColor: themeColor, backgroundColor: themeColor } : {}}
                  />

                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-10 h-10 rounded-lg object-cover"
                    />
                  ) : (
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${themeColor}20` }}
                    >
                      <ImagePlus className="h-5 w-5" style={{ color: themeColor }} />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{product.name}</p>
                    {product.category && (
                      <p className="text-[11px] text-muted-foreground truncate">{product.category}</p>
                    )}
                  </div>

                  <AnimatePresence mode="wait">
                    {status === 'generating' && (
                      <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }}>
                        <Loader2 className="h-5 w-5 animate-spin" style={{ color: themeColor }} />
                      </motion.div>
                    )}
                    {status === 'done' && (
                      <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }}
                        className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                        <Check className="h-4 w-4 text-white" />
                      </motion.div>
                    )}
                    {status === 'error' && (
                      <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }}
                        className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center">
                        <X className="h-4 w-4 text-white" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>

          {/* زر التوليد */}
          <Button
            onClick={handleGenerate}
            disabled={isGenerating || selectedProducts.length === 0}
            className="w-full h-12 text-base font-bold gap-2 text-white"
            style={{ background: `linear-gradient(135deg, ${themeColor}, ${themeColor}cc)` }}
          >
            {isGenerating ? (
              <><Loader2 className="h-5 w-5 animate-spin" /> جاري التوليد...</>
            ) : (
              <><Wand2 className="h-5 w-5" /> توليد صور ({selectedProducts.length})</>
            )}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ProductImageGenerator;
