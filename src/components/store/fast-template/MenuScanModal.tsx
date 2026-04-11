import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import { X, Camera, Upload, Loader2, Check, Trash2, Edit3, Sparkles, ChevronDown, ChevronUp, ImagePlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ExtractedProduct {
  name: string;
  price: number;
  category: string;
  description: string;
  selected: boolean;
  editing: boolean;
}

interface MenuScanModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onProductsAdded?: () => void;
  colorTheme?: string | null;
}

const MenuScanModal = ({ isOpen, onOpenChange, onProductsAdded, colorTheme }: MenuScanModalProps) => {
  const [step, setStep] = useState<'upload' | 'extracting' | 'review' | 'saving'>('upload');
  const [products, setProducts] = useState<ExtractedProduct[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getThemeColor = () => {
    if (colorTheme?.startsWith('#')) return colorTheme;
    const colors: Record<string, string> = {
      coral: '#fb923c', purple: '#a855f7', blue: '#3b82f6', green: '#22c55e', red: '#ef4444',
    };
    return colors[colorTheme || ''] || '#3b82f6';
  };
  const themeColor = getThemeColor();

  const handleFileSelect = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('يرجى اختيار صورة');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('حجم الصورة كبير جداً (الحد الأقصى 10MB)');
      return;
    }

    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setStep('extracting');

    try {
      // Convert to base64
      const buffer = await file.arrayBuffer();
      const bytes = new Uint8Array(buffer);
      let binary = '';
      const chunkSize = 8192;
      for (let i = 0; i < bytes.length; i += chunkSize) {
        const chunk = bytes.subarray(i, i + chunkSize);
        binary += String.fromCharCode(...chunk);
      }
      const base64 = btoa(binary);

      const { data, error } = await supabase.functions.invoke('extract-menu-products', {
        body: { imageBase64: base64, mimeType: file.type },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      const extracted = (data?.products || []).map((p: any) => ({
        ...p,
        price: Number(p.price) || 0,
        selected: true,
        editing: false,
      }));

      if (extracted.length === 0) {
        toast.error('لم يتم العثور على منتجات في الصورة');
        setStep('upload');
        return;
      }

      setProducts(extracted);
      setStep('review');
      toast.success(`تم استخراج ${extracted.length} منتج بنجاح!`);
    } catch (err: any) {
      console.error('Extraction error:', err);
      toast.error(err.message || 'فشل في استخراج المنتجات');
      setStep('upload');
    }
  };

  const handleSaveProducts = async () => {
    const selectedProducts = products.filter(p => p.selected);
    if (selectedProducts.length === 0) {
      toast.error('اختر منتجاً واحداً على الأقل');
      return;
    }

    setStep('saving');
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('يجب تسجيل الدخول');

      const rows = selectedProducts.map(p => ({
        name: p.name,
        price: p.price,
        category: p.category || null,
        description: p.description || null,
        user_id: user.id,
        is_new: true,
      }));

      const { error } = await supabase.from('products').insert(rows);
      if (error) throw error;

      toast.success(`تم إضافة ${selectedProducts.length} منتج بنجاح! 🎉`);
      onProductsAdded?.();
      handleClose();
    } catch (err: any) {
      console.error('Save error:', err);
      toast.error(err.message || 'فشل في حفظ المنتجات');
      setStep('review');
    }
  };

  const toggleProduct = (index: number) => {
    setProducts(prev => prev.map((p, i) => i === index ? { ...p, selected: !p.selected } : p));
  };

  const updateProduct = (index: number, field: keyof ExtractedProduct, value: any) => {
    setProducts(prev => prev.map((p, i) => i === index ? { ...p, [field]: value } : p));
  };

  const removeProduct = (index: number) => {
    setProducts(prev => prev.filter((_, i) => i !== index));
  };

  const selectAll = () => setProducts(prev => prev.map(p => ({ ...p, selected: true })));
  const deselectAll = () => setProducts(prev => prev.map(p => ({ ...p, selected: false })));

  const handleClose = () => {
    setStep('upload');
    setProducts([]);
    setPreviewUrl(null);
    setExpandedIndex(null);
    onOpenChange(false);
  };

  const selectedCount = products.filter(p => p.selected).length;
  const categories = [...new Set(products.map(p => p.category).filter(Boolean))];

  if (!isOpen) return null;

  const content = (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={handleClose} className="fixed inset-0 z-50 backdrop-blur-md bg-black/40" />
          <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }} transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-3 pointer-events-none overflow-y-auto">
            <div className="pointer-events-auto w-full max-w-lg my-4">
              <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={handleClose}
                className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-white/20 backdrop-blur-lg border border-white/30 flex items-center justify-center text-white shadow-lg">
                <X className="w-4 h-4" />
              </motion.button>

              <div className="rounded-3xl overflow-hidden shadow-2xl border border-white/20"
                style={{ background: `linear-gradient(135deg, ${themeColor}ee, ${themeColor}cc)` }}>
                {/* Header */}
                <div className="relative p-5 text-center text-white border-b border-white/20">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.1, type: "spring" }}
                    className="mx-auto mb-3 w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-lg border border-white/30 flex items-center justify-center shadow-lg">
                    <Sparkles className="w-7 h-7 text-white" />
                  </motion.div>
                  <h2 className="text-xl font-bold drop-shadow-lg">استخراج المنتجات من المنيو</h2>
                  <p className="text-white/80 text-xs mt-1">ارفع صورة القائمة وسيتم استخراج المنتجات تلقائياً</p>
                </div>

                {/* Body */}
                <div className="bg-white dark:bg-gray-900 max-h-[65vh] overflow-y-auto">
                  {step === 'upload' && (
                    <UploadStep
                      fileInputRef={fileInputRef}
                      onFileSelect={handleFileSelect}
                      themeColor={themeColor}
                    />
                  )}

                  {step === 'extracting' && (
                    <ExtractingStep previewUrl={previewUrl} themeColor={themeColor} />
                  )}

                  {step === 'review' && (
                    <ReviewStep
                      products={products}
                      categories={categories}
                      selectedCount={selectedCount}
                      expandedIndex={expandedIndex}
                      themeColor={themeColor}
                      onToggle={toggleProduct}
                      onUpdate={updateProduct}
                      onRemove={removeProduct}
                      onExpand={setExpandedIndex}
                      onSelectAll={selectAll}
                      onDeselectAll={deselectAll}
                      onSave={handleSaveProducts}
                      onAddMore={() => { setStep('upload'); setPreviewUrl(null); }}
                    />
                  )}

                  {step === 'saving' && (
                    <div className="p-10 flex flex-col items-center gap-4">
                      <Loader2 className="w-10 h-10 animate-spin" style={{ color: themeColor }} />
                      <p className="font-bold text-foreground">جاري حفظ {selectedCount} منتج...</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  return createPortal(content, document.body);
};

/* ─── Upload Step ─── */
const UploadStep = ({ fileInputRef, onFileSelect, themeColor }: {
  fileInputRef: React.RefObject<HTMLInputElement>;
  onFileSelect: (file: File) => void;
  themeColor: string;
}) => (
  <div className="p-6 space-y-4" dir="rtl">
    <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
      onChange={(e) => e.target.files?.[0] && onFileSelect(e.target.files[0])} />

    <motion.button whileTap={{ scale: 0.97 }}
      onClick={() => fileInputRef.current?.click()}
      className="w-full border-2 border-dashed rounded-2xl p-8 flex flex-col items-center gap-3 transition-colors hover:bg-muted/30"
      style={{ borderColor: `${themeColor}60` }}>
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ backgroundColor: `${themeColor}15` }}>
        <Upload className="w-8 h-8" style={{ color: themeColor }} />
      </div>
      <p className="font-bold text-foreground">اختر صورة المنيو</p>
      <p className="text-xs text-muted-foreground">JPG, PNG, WEBP - حتى 10MB</p>
    </motion.button>

    <motion.button whileTap={{ scale: 0.97 }}
      onClick={() => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.capture = 'environment';
        input.onchange = (e) => {
          const file = (e.target as HTMLInputElement).files?.[0];
          if (file) onFileSelect(file);
        };
        input.click();
      }}
      className="w-full rounded-2xl p-4 flex items-center justify-center gap-2 text-white font-bold"
      style={{ backgroundColor: themeColor }}>
      <Camera className="w-5 h-5" />
      <span>التقط صورة بالكاميرا</span>
    </motion.button>

    <div className="bg-muted/30 rounded-xl p-3 space-y-1.5">
      <p className="text-xs font-bold text-foreground">💡 نصائح للحصول على أفضل نتيجة:</p>
      <ul className="text-[11px] text-muted-foreground space-y-1 list-disc list-inside">
        <li>تأكد أن الصورة واضحة وغير مشوشة</li>
        <li>يفضل تصوير صفحة واحدة في كل مرة</li>
        <li>تأكد من ظهور الأسعار بشكل واضح</li>
        <li>يمكنك رفع عدة صور بشكل متتالي</li>
      </ul>
    </div>
  </div>
);

/* ─── Extracting Step ─── */
const ExtractingStep = ({ previewUrl, themeColor }: { previewUrl: string | null; themeColor: string }) => (
  <div className="p-6 flex flex-col items-center gap-4">
    {previewUrl && (
      <div className="w-full h-40 rounded-xl overflow-hidden">
        <img src={previewUrl} alt="Menu" className="w-full h-full object-cover" />
      </div>
    )}
    <Loader2 className="w-10 h-10 animate-spin" style={{ color: themeColor }} />
    <div className="text-center">
      <p className="font-bold text-foreground">جاري تحليل الصورة بالذكاء الاصطناعي...</p>
      <p className="text-xs text-muted-foreground mt-1">قد يستغرق الأمر بضع ثوانٍ</p>
    </div>
  </div>
);

/* ─── Review Step ─── */
const ReviewStep = ({ products, categories, selectedCount, expandedIndex, themeColor,
  onToggle, onUpdate, onRemove, onExpand, onSelectAll, onDeselectAll, onSave, onAddMore }: {
  products: ExtractedProduct[];
  categories: string[];
  selectedCount: number;
  expandedIndex: number | null;
  themeColor: string;
  onToggle: (i: number) => void;
  onUpdate: (i: number, field: keyof ExtractedProduct, value: any) => void;
  onRemove: (i: number) => void;
  onExpand: (i: number | null) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onSave: () => void;
  onAddMore: () => void;
}) => (
  <div className="p-4 space-y-3" dir="rtl">
    {/* Summary Bar */}
    <div className="flex items-center justify-between bg-muted/30 rounded-xl p-3">
      <div className="flex gap-2">
        <button onClick={onSelectAll} className="text-[11px] font-bold px-2 py-1 rounded-lg bg-muted hover:bg-muted/80">
          تحديد الكل
        </button>
        <button onClick={onDeselectAll} className="text-[11px] font-bold px-2 py-1 rounded-lg bg-muted hover:bg-muted/80">
          إلغاء الكل
        </button>
      </div>
      <p className="text-xs font-bold text-foreground">
        {selectedCount}/{products.length} منتج محدد
      </p>
    </div>

    {/* Categories */}
    {categories.length > 1 && (
      <div className="flex gap-1.5 flex-wrap">
        {categories.map(cat => (
          <span key={cat} className="text-[10px] font-bold px-2 py-1 rounded-full" 
            style={{ backgroundColor: `${themeColor}15`, color: themeColor }}>
            {cat}
          </span>
        ))}
      </div>
    )}

    {/* Products */}
    <div className="space-y-2 max-h-[40vh] overflow-y-auto">
      {products.map((product, index) => (
        <motion.div key={index} layout
          className={cn(
            "rounded-xl border-2 p-3 transition-all",
            product.selected ? "bg-background" : "bg-muted/20 opacity-60"
          )}
          style={{ borderColor: product.selected ? `${themeColor}40` : 'transparent' }}>
          
          <div className="flex items-center gap-2">
            <button onClick={() => onToggle(index)}
              className={cn("w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all",
                product.selected ? "border-transparent" : "border-muted-foreground/30")}
              style={product.selected ? { backgroundColor: themeColor } : {}}>
              {product.selected && <Check className="w-3 h-3 text-white" />}
            </button>

            <div className="flex-1 min-w-0" onClick={() => onExpand(expandedIndex === index ? null : index)}>
              <p className="text-sm font-bold text-foreground truncate">{product.name}</p>
              <p className="text-[11px] text-muted-foreground">{product.category}</p>
            </div>

            <span className="text-sm font-bold shrink-0" style={{ color: themeColor }}>
              {product.price > 0 ? product.price.toLocaleString() : '—'}
            </span>

            <button onClick={() => onExpand(expandedIndex === index ? null : index)}
              className="p-1 rounded-lg hover:bg-muted shrink-0">
              {expandedIndex === index ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>

          {/* Expanded Edit */}
          <AnimatePresence>
            {expandedIndex === index && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                <div className="pt-3 mt-3 border-t border-muted space-y-2">
                  <div>
                    <label className="text-[11px] font-bold text-muted-foreground">الاسم</label>
                    <input value={product.name} onChange={(e) => onUpdate(index, 'name', e.target.value)}
                      className="w-full text-sm p-2 rounded-lg border bg-background focus:outline-none" style={{ borderColor: `${themeColor}30` }} />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-bold text-muted-foreground">السعر</label>
                      <input type="number" value={product.price} onChange={(e) => onUpdate(index, 'price', Number(e.target.value))}
                        className="w-full text-sm p-2 rounded-lg border bg-background focus:outline-none" style={{ borderColor: `${themeColor}30` }} />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-muted-foreground">التصنيف</label>
                      <input value={product.category} onChange={(e) => onUpdate(index, 'category', e.target.value)}
                        className="w-full text-sm p-2 rounded-lg border bg-background focus:outline-none" style={{ borderColor: `${themeColor}30` }} />
                    </div>
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-muted-foreground">الوصف</label>
                    <textarea value={product.description} onChange={(e) => onUpdate(index, 'description', e.target.value)}
                      rows={2} className="w-full text-sm p-2 rounded-lg border bg-background focus:outline-none resize-none" style={{ borderColor: `${themeColor}30` }} />
                  </div>
                  <button onClick={() => onRemove(index)}
                    className="flex items-center gap-1 text-xs text-red-500 hover:text-red-600 font-bold">
                    <Trash2 className="w-3.5 h-3.5" /> حذف المنتج
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ))}
    </div>

    {/* Actions */}
    <div className="flex gap-2 pt-2">
      <button onClick={onAddMore}
        className="flex-1 py-3 rounded-xl font-bold text-sm border-2 flex items-center justify-center gap-1.5"
        style={{ borderColor: `${themeColor}40`, color: themeColor }}>
        <ImagePlus className="w-4 h-4" /> رفع صورة أخرى
      </button>
      <motion.button whileTap={{ scale: 0.97 }} onClick={onSave} disabled={selectedCount === 0}
        className="flex-[2] py-3 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-1.5 disabled:opacity-50"
        style={{ backgroundColor: themeColor }}>
        <Check className="w-4 h-4" /> حفظ {selectedCount} منتج
      </motion.button>
    </div>
  </div>
);

export default MenuScanModal;
