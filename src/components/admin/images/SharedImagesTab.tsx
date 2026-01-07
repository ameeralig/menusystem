import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Image as ImageIcon, 
  Upload, 
  Trash2, 
  Search,
  Loader2,
  Plus,
  X,
  Filter
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { optimizeImage, uploadImage } from "@/utils/storageHelpers";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
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
  usage_count: number;
  created_at: string;
}

const CATEGORIES = ['عام', 'منتجات', 'خلفيات', 'أيقونات', 'بانرات', 'أخرى'];

const SharedImagesTab = () => {
  const [images, setImages] = useState<SharedImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  
  // حقول الإضافة
  const [newImage, setNewImage] = useState({
    name: "",
    description: "",
    category: "عام",
    file: null as File | null,
    preview: null as string | null,
  });

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('shared_images')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setImages(data || []);
    } catch (error) {
      console.error("Error fetching shared images:", error);
      toast.error("فشل في جلب الصور");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error("حجم الصورة كبير جداً. الحد الأقصى 10 ميجابايت");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewImage(prev => ({
          ...prev,
          file,
          preview: reader.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!newImage.file || !newImage.name.trim()) {
      toast.error("يرجى اختيار صورة وإدخال اسم");
      return;
    }

    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("يجب تسجيل الدخول");
        return;
      }

      // تحسين ورفع الصورة
      const optimizedFile = await optimizeImage(newImage.file);
      const imageUrl = await uploadImage("product-images", optimizedFile, "shared", "");

      if (!imageUrl) throw new Error("فشل في رفع الصورة");

      // حفظ في قاعدة البيانات
      const { error } = await supabase.from('shared_images').insert({
        name: newImage.name.trim(),
        description: newImage.description.trim() || null,
        image_url: imageUrl,
        category: newImage.category,
        uploaded_by: user.id
      });

      if (error) throw error;

      toast.success("تم رفع الصورة بنجاح");
      setNewImage({ name: "", description: "", category: "عام", file: null, preview: null });
      setDialogOpen(false);
      fetchImages();
    } catch (error: any) {
      console.error("Error uploading image:", error);
      toast.error(error.message || "فشل في رفع الصورة");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (image: SharedImage) => {
    if (image.usage_count > 0) {
      const confirm = window.confirm(`هذه الصورة مستخدمة ${image.usage_count} مرة. هل تريد حذفها؟`);
      if (!confirm) return;
    }

    try {
      // حذف من التخزين
      const fileName = image.image_url.split('/').pop()?.split('?')[0];
      if (fileName) {
        await supabase.storage.from('product-images').remove([`shared/${fileName}`]);
      }

      // حذف من قاعدة البيانات
      const { error } = await supabase
        .from('shared_images')
        .delete()
        .eq('id', image.id);

      if (error) throw error;

      toast.success("تم حذف الصورة");
      fetchImages();
    } catch (error) {
      console.error("Error deleting image:", error);
      toast.error("فشل في حذف الصورة");
    }
  };

  const filteredImages = images.filter(img => {
    const matchesSearch = img.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (img.description?.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = categoryFilter === "all" || img.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold">مستودع الصور المشتركة</h2>
          <p className="text-sm text-muted-foreground">
            إدارة الصور المشتركة التي يمكن للمستخدمين استخدامها في منتجاتهم
          </p>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 ml-2" />
              إضافة صورة
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>إضافة صورة جديدة</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {/* معاينة الصورة */}
              <div className="border-2 border-dashed border-border rounded-lg p-4">
                {newImage.preview ? (
                  <div className="relative">
                    <img 
                      src={newImage.preview} 
                      alt="معاينة" 
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={() => setNewImage(prev => ({ ...prev, file: null, preview: null }))}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center h-48 cursor-pointer hover:bg-muted/50 transition-colors rounded-lg">
                    <Upload className="w-10 h-10 text-muted-foreground mb-2" />
                    <span className="text-sm text-muted-foreground">اختر صورة للرفع</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              <div>
                <Label>اسم الصورة *</Label>
                <Input
                  value={newImage.name}
                  onChange={(e) => setNewImage(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="أدخل اسم الصورة"
                />
              </div>

              <div>
                <Label>الوصف</Label>
                <Textarea
                  value={newImage.description}
                  onChange={(e) => setNewImage(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="وصف اختياري للصورة"
                  rows={2}
                />
              </div>

              <div>
                <Label>التصنيف</Label>
                <Select
                  value={newImage.category}
                  onValueChange={(value) => setNewImage(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button 
                onClick={handleUpload} 
                disabled={uploading || !newImage.file || !newImage.name.trim()}
                className="w-full"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                    جاري الرفع...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 ml-2" />
                    رفع الصورة
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* فلاتر البحث */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="بحث بالاسم أو الوصف..."
                className="pr-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="w-4 h-4 ml-2" />
                <SelectValue placeholder="كل التصنيفات" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">كل التصنيفات</SelectItem>
                {CATEGORIES.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* شبكة الصور */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : filteredImages.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <ImageIcon className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">لا توجد صور</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredImages.map((image) => (
            <Card key={image.id} className="overflow-hidden group">
              <div className="relative aspect-square">
                <img
                  src={image.image_url}
                  alt={image.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => handleDelete(image)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <CardContent className="p-3">
                <h4 className="font-medium text-sm truncate">{image.name}</h4>
                <div className="flex items-center justify-between mt-2">
                  <Badge variant="secondary" className="text-xs">
                    {image.category}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    استخدام: {image.usage_count}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* إحصائيات */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">إحصائيات المستودع</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-muted rounded-lg">
              <p className="text-2xl font-bold text-primary">{images.length}</p>
              <p className="text-sm text-muted-foreground">إجمالي الصور</p>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <p className="text-2xl font-bold text-primary">
                {images.reduce((sum, img) => sum + img.usage_count, 0)}
              </p>
              <p className="text-sm text-muted-foreground">إجمالي الاستخدام</p>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <p className="text-2xl font-bold text-primary">
                {new Set(images.map(img => img.category)).size}
              </p>
              <p className="text-sm text-muted-foreground">التصنيفات</p>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <p className="text-2xl font-bold text-primary">
                {images.filter(img => img.usage_count > 0).length}
              </p>
              <p className="text-sm text-muted-foreground">صور مستخدمة</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SharedImagesTab;
