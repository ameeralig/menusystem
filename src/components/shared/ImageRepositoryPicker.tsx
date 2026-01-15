import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import { 
  X, 
  Image as ImageIcon, 
  Search, 
  Loader2,
  Check,
  Filter
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SharedImage {
  id: string;
  name: string;
  description: string | null;
  image_url: string;
  category: string;
}

interface ImageRepositoryPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (imageUrl: string, imageId: string) => void;
  colorTheme?: string | null;
}

const CATEGORIES = ['عام', 'منتجات', 'خلفيات', 'أيقونات', 'بانرات', 'أخرى'];

const ImageRepositoryPicker = ({ 
  isOpen, 
  onClose, 
  onSelect,
  colorTheme 
}: ImageRepositoryPickerProps) => {
  const [images, setImages] = useState<SharedImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedImage, setSelectedImage] = useState<SharedImage | null>(null);

  // الحصول على لون الثيم
  const getThemeColor = () => {
    if (colorTheme?.startsWith('#')) return colorTheme;
    const themeColors: { [key: string]: string } = {
      coral: '#fb923c',
      purple: '#a855f7',
      blue: '#3b82f6',
      green: '#22c55e',
      red: '#ef4444',
    };
    return themeColors[colorTheme || ''] || '#3b82f6';
  };

  const themeColor = getThemeColor();

  useEffect(() => {
    if (isOpen) {
      fetchImages();
    }
  }, [isOpen]);

  const fetchImages = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('shared_images')
        .select('id, name, description, image_url, category')
        .order('usage_count', { ascending: false });

      if (error) throw error;
      setImages(data || []);
    } catch (error) {
      console.error("Error fetching shared images:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = async () => {
    if (!selectedImage) return;
    
    // زيادة عداد الاستخدام
    try {
      await supabase.rpc('increment_image_usage', { image_id: selectedImage.id });
    } catch (error) {
      console.error("Error incrementing usage:", error);
    }

    onSelect(selectedImage.image_url, selectedImage.id);
    onClose();
    setSelectedImage(null);
    setSearchQuery("");
    setCategoryFilter("all");
  };

  // اختيار مباشر بضغطة واحدة
  const handleDirectSelect = async (image: SharedImage) => {
    // زيادة عداد الاستخدام
    try {
      await supabase.rpc('increment_image_usage', { image_id: image.id });
    } catch (error) {
      console.error("Error incrementing usage:", error);
    }

    onSelect(image.image_url, image.id);
    onClose();
    setSelectedImage(null);
    setSearchQuery("");
    setCategoryFilter("all");
  };

  const filteredImages = images.filter(img => {
    const matchesSearch = img.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (img.description?.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = categoryFilter === "all" || img.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  if (!isOpen) return null;

  const content = (
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

          {/* البطاقة العائمة */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none overflow-y-auto"
          >
            <div className="pointer-events-auto w-full max-w-2xl my-8">
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
                {/* تأثير الإضاءة العلوي */}
                <div 
                  className="absolute top-0 left-0 right-0 h-32 opacity-30 pointer-events-none"
                  style={{
                    background: 'linear-gradient(180deg, rgba(255,255,255,0.4) 0%, transparent 100%)',
                  }}
                />

                {/* رأس البطاقة */}
                <div className="relative p-6 text-center text-white border-b border-white/20">
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.1, type: "spring" }}
                    className="mx-auto mb-4 w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-lg border border-white/30 flex items-center justify-center shadow-lg"
                  >
                    <ImageIcon className="w-8 h-8 text-white" />
                  </motion.div>

                  <motion.h2 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="text-2xl font-bold drop-shadow-lg"
                  >
                    اختر من المستودع
                  </motion.h2>
                  <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-white/80 text-sm mt-2"
                  >
                    اختر صورة من مستودع الصور المشتركة
                  </motion.p>
                </div>

                {/* محتوى البطاقة */}
                <div className="relative p-4 bg-white dark:bg-gray-900 max-h-[60vh] overflow-y-auto">
                  {/* فلاتر البحث */}
                  <div className="flex gap-2 mb-4">
                    <div className="relative flex-1">
                      <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="بحث..."
                        className="pr-10"
                      />
                    </div>
                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                      <SelectTrigger className="w-32">
                        <Filter className="w-4 h-4 ml-1" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">الكل</SelectItem>
                        {CATEGORIES.map(cat => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* شبكة الصور */}
                  {loading ? (
                    <div className="flex justify-center py-12">
                      <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                  ) : filteredImages.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <ImageIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>لا توجد صور</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-3">
                      {filteredImages.map((image) => (
                        <motion.div
                          key={image.id}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleDirectSelect(image)}
                          className={`relative aspect-square rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${
                            selectedImage?.id === image.id 
                              ? 'border-primary ring-2 ring-primary/30' 
                              : 'border-transparent hover:border-primary/50'
                          }`}
                        >
                          <img
                            src={image.image_url}
                            alt={image.name}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                          {selectedImage?.id === image.id && (
                            <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                                <Check className="w-5 h-5 text-white" />
                              </div>
                            </div>
                          )}
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                            <p className="text-xs text-white truncate">{image.name}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}

                  {/* الصورة المحددة */}
                  {selectedImage && (
                    <div className="mt-4 p-3 bg-muted rounded-xl flex items-center gap-3">
                      <img
                        src={selectedImage.image_url}
                        alt={selectedImage.name}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate">{selectedImage.name}</h4>
                        <Badge variant="secondary" className="text-xs mt-1">
                          {selectedImage.category}
                        </Badge>
                      </div>
                    </div>
                  )}

                  {/* زر الاختيار */}
                  <Button
                    onClick={handleSelect}
                    disabled={!selectedImage}
                    className="w-full mt-4"
                    style={{ backgroundColor: themeColor }}
                  >
                    <Check className="w-4 h-4 ml-2" />
                    اختيار الصورة
                  </Button>
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

export default ImageRepositoryPicker;
