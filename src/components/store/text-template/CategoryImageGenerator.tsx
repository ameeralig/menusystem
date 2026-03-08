import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wand2, Loader2, Check, X, ImagePlus, Sparkles, Image, Palette, Pencil, MessageSquare } from "lucide-react";
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
import { CategoryImage } from "@/types/categoryImage";

type ImageStyle = 'icon' | 'realistic' | 'cartoon' | 'custom';

interface StyleOption {
  id: ImageStyle;
  label: string;
  icon: React.ReactNode;
  description: string;
}

interface CategoryImageGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
  categories: string[];
  categoryImages?: CategoryImage[];
  storeOwnerId: string;
  storeName?: string | null;
  colorTheme?: string | null;
  onGenerated?: () => void;
}

interface GenerationStatus {
  [category: string]: 'idle' | 'generating' | 'done' | 'error';
}

const CategoryImageGenerator: React.FC<CategoryImageGeneratorProps> = ({
  isOpen,
  onClose,
  categories,
  categoryImages,
  storeOwnerId,
  storeName,
  colorTheme,
  onGenerated,
}) => {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [generationStatus, setGenerationStatus] = useState<GenerationStatus>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState<ImageStyle>('icon');
  const [customPrompt, setCustomPrompt] = useState('');

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
    { id: 'icon', label: 'أيقونة', icon: <Sparkles className="h-5 w-5" />, description: 'أيقونة بسيطة وأنيقة' },
    { id: 'realistic', label: 'صورة حقيقية', icon: <Image className="h-5 w-5" />, description: 'صورة واقعية عالية الجودة' },
    { id: 'cartoon', label: 'رسم كرتوني', icon: <Palette className="h-5 w-5" />, description: 'رسم كرتوني ملون وجذاب' },
    { id: 'custom', label: 'مخصص', icon: <MessageSquare className="h-5 w-5" />, description: 'أدخل وصفك الخاص' },
  ];

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const selectAll = () => {
    if (selectedCategories.length === categories.length) {
      setSelectedCategories([]);
    } else {
      setSelectedCategories([...categories]);
    }
  };

  const getCategoryImage = (category: string) => {
    return categoryImages?.find(ci => ci.category === category);
  };

  const generateForCategory = async (category: string): Promise<boolean> => {
    try {
      setGenerationStatus(prev => ({ ...prev, [category]: 'generating' }));

      const { data, error } = await supabase.functions.invoke('generate-category-image', {
        body: {
          categoryName: category,
          storeName,
          style: selectedStyle,
          customPrompt: selectedStyle === 'custom' ? customPrompt : undefined,
        },
      });

      if (error) throw error;
      if (!data?.success || !data?.imageUrl) {
        throw new Error(data?.error || 'فشل التوليد');
      }

      const existingImage = getCategoryImage(category);

      if (existingImage?.id) {
        const { error: updateError } = await supabase
          .from('category_images')
          .update({ image_url: data.imageUrl })
          .eq('id', existingImage.id);
        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from('category_images')
          .insert({
            category,
            image_url: data.imageUrl,
            user_id: storeOwnerId,
          });
        if (insertError) throw insertError;
      }

      setGenerationStatus(prev => ({ ...prev, [category]: 'done' }));
      return true;
    } catch (err: any) {
      console.error(`Error generating image for ${category}:`, err);
      setGenerationStatus(prev => ({ ...prev, [category]: 'error' }));
      return false;
    }
  };

  const handleGenerate = async () => {
    if (selectedCategories.length === 0) {
      toast.error("اختر تصنيفاً واحداً على الأقل");
      return;
    }
    if (selectedStyle === 'custom' && !customPrompt.trim()) {
      toast.error("أدخل وصفاً مخصصاً للتوليد");
      return;
    }

    setIsGenerating(true);
    let successCount = 0;

    for (const category of selectedCategories) {
      const success = await generateForCategory(category);
      if (success) successCount++;
    }

    setIsGenerating(false);

    if (successCount > 0) {
      toast.success(`تم توليد ${successCount} صورة بنجاح`);
      onGenerated?.();
    }

    if (successCount < selectedCategories.length) {
      toast.error(`فشل توليد ${selectedCategories.length - successCount} صورة`);
    }
  };

  const handleClose = () => {
    if (!isGenerating) {
      setSelectedCategories([]);
      setGenerationStatus({});
      setSelectedStyle('icon');
      setCustomPrompt('');
      onClose();
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={handleClose}>
      <SheetContent side="bottom" className="rounded-t-3xl max-h-[85vh] overflow-y-auto">
        <SheetHeader className="text-center pb-4">
          <SheetTitle className="flex items-center justify-center gap-2 text-xl">
            <Sparkles className="h-5 w-5" style={{ color: themeColor }} />
            توليد صور التصنيفات بالذكاء الاصطناعي
          </SheetTitle>
          <p className="text-sm text-muted-foreground">
            اختر نمط الصورة والتصنيفات المطلوبة
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
                  placeholder="مثال: صورة بتصميم ياباني تقليدي مع ألوان هادئة..."
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  disabled={isGenerating}
                  className="text-right"
                  dir="rtl"
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* زر تحديد الكل */}
          <Button
            variant="outline"
            size="sm"
            onClick={selectAll}
            className="w-full gap-2"
            disabled={isGenerating}
          >
            {selectedCategories.length === categories.length ? (
              <>
                <X className="h-4 w-4" />
                إلغاء تحديد الكل
              </>
            ) : (
              <>
                <Check className="h-4 w-4" />
                تحديد الكل ({categories.length})
              </>
            )}
          </Button>

          {/* قائمة التصنيفات */}
          <div className="space-y-2">
            {categories.map((category) => {
              const status = generationStatus[category] || 'idle';
              const existingImage = getCategoryImage(category);
              const isSelected = selectedCategories.includes(category);

              return (
                <motion.div
                  key={category}
                  layout
                  className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all cursor-pointer ${
                    isSelected ? 'border-opacity-100 bg-opacity-5' : 'border-border'
                  }`}
                  style={isSelected ? { borderColor: themeColor, backgroundColor: `${themeColor}10` } : {}}
                  onClick={() => !isGenerating && toggleCategory(category)}
                >
                  <Checkbox
                    checked={isSelected}
                    disabled={isGenerating}
                    className="data-[state=checked]:border-current"
                    style={isSelected ? { borderColor: themeColor, backgroundColor: themeColor } : {}}
                  />

                  {existingImage?.image_url ? (
                    <img
                      src={existingImage.image_url}
                      alt={category}
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

                  <span className="flex-1 font-medium text-sm">{category}</span>

                  <AnimatePresence mode="wait">
                    {status === 'generating' && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                      >
                        <Loader2 className="h-5 w-5 animate-spin" style={{ color: themeColor }} />
                      </motion.div>
                    )}
                    {status === 'done' && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center"
                      >
                        <Check className="h-4 w-4 text-white" />
                      </motion.div>
                    )}
                    {status === 'error' && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center"
                      >
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
            disabled={isGenerating || selectedCategories.length === 0}
            className="w-full h-12 text-base font-bold gap-2 text-white"
            style={{ background: `linear-gradient(135deg, ${themeColor}, ${themeColor}cc)` }}
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                جاري التوليد...
              </>
            ) : (
              <>
                <Wand2 className="h-5 w-5" />
                توليد صور ({selectedCategories.length})
              </>
            )}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default CategoryImageGenerator;
