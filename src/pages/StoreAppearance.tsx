
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Image as ImageIcon, Upload, Trash2 } from "lucide-react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import ReactCrop, { type Crop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

const StoreAppearance = () => {
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [existingLogoUrl, setExistingLogoUrl] = useState<string | null>(null);
  const [existingBannerUrl, setExistingBannerUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCropOpen, setIsCropOpen] = useState(false);
  const [cropType, setCropType] = useState<'logo' | 'banner'>('logo');
  const [crop, setCrop] = useState<Crop>({ unit: '%', width: 90, height: 90, x: 5, y: 5 });
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchStoreSettings = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: storeSettings, error } = await supabase
          .from("store_settings")
          .select("logo_url, banner_url")
          .eq("user_id", user.id)
          .single();

        if (error) {
          console.error("Error fetching store settings:", error);
          return;
        }

        if (storeSettings) {
          setExistingLogoUrl(storeSettings.logo_url || null);
          setExistingBannerUrl(storeSettings.banner_url || null);
        }
      } catch (error) {
        console.error("Error fetching store settings:", error);
      }
    };

    fetchStoreSettings();
  }, []);

  // تهيئة المحصول عند فتح صورة جديدة
  function centerAspectCrop(mediaWidth: number, mediaHeight: number, aspect: number) {
    return centerCrop(
      makeAspectCrop(
        {
          unit: '%',
          width: 90,
        },
        aspect,
        mediaWidth,
        mediaHeight
      ),
      mediaWidth,
      mediaHeight
    );
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'banner') => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      
      // تحقق من نوع الملف
      if (!file.type.includes('image/')) {
        toast({
          title: "خطأ",
          description: "الرجاء اختيار ملف صورة صالح",
          variant: "destructive",
        });
        return;
      }
      
      const reader = new FileReader();
      
      reader.onload = (e) => {
        if (e.target && typeof e.target.result === 'string') {
          const result = e.target.result;
          
          if (type === 'logo') {
            setLogoFile(file);
            setImageToCrop(result);
            setCropType('logo');
          } else {
            setBannerFile(file);
            setImageToCrop(result);
            setCropType('banner');
          }
          setIsCropOpen(true);
          
          // تأكد من تحميل الصورة قبل ضبط المحصول
          const imgElement = new globalThis.Image();
          imgElement.src = result;
          imgElement.onload = () => {
            const aspect = type === 'logo' ? 1 : 16 / 9;
            setCrop(centerAspectCrop(imgElement.width, imgElement.height, aspect));
          };
        }
      };
      
      reader.onerror = () => {
        toast({
          title: "خطأ",
          description: "حدث خطأ أثناء قراءة الملف",
          variant: "destructive",
        });
      };
      
      reader.readAsDataURL(file);
    }
  };

  const getCroppedImg = (image: HTMLImageElement, crop: Crop): Promise<Blob> => {
    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    const cropWidth = crop.width ? Math.round(crop.width * scaleX) : 0;
    const cropHeight = crop.height ? Math.round(crop.height * scaleY) : 0;
    
    if (cropWidth === 0 || cropHeight === 0) {
      return Promise.reject(new Error('Invalid crop dimensions'));
    }
    
    canvas.width = cropWidth;
    canvas.height = cropHeight;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      return Promise.reject(new Error('Could not get canvas context'));
    }

    ctx.drawImage(
      image,
      crop.x ? Math.round(crop.x * scaleX) : 0,
      crop.y ? Math.round(crop.y * scaleY) : 0,
      cropWidth,
      cropHeight,
      0,
      0,
      cropWidth,
      cropHeight
    );

    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Canvas to Blob conversion failed'));
      }, 'image/jpeg', 0.95);
    });
  };

  const completeCrop = async () => {
    if (!imageRef.current || !crop.width || !crop.height) {
      toast({
        title: "خطأ",
        description: "يرجى تحديد منطقة القص أولاً",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const croppedImageBlob = await getCroppedImg(imageRef.current, crop);
      const croppedImageUrl = URL.createObjectURL(croppedImageBlob);
      
      const fileName = `cropped-${Date.now()}.jpeg`;
      const croppedFile = new File([croppedImageBlob], fileName, { type: 'image/jpeg' });

      if (cropType === 'logo') {
        setLogoFile(croppedFile);
        setLogoPreview(croppedImageUrl);
      } else {
        setBannerFile(croppedFile);
        setBannerPreview(croppedImageUrl);
      }

      setIsCropOpen(false);
      setImageToCrop(null); // تنظيف الصورة بعد الانتهاء
    } catch (error) {
      console.error('Error cropping image:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء قص الصورة",
        variant: "destructive",
      });
    }
  };

  const uploadToStorage = async (file: File, path: string): Promise<string | null> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("يجب تسجيل الدخول أولاً");

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `${path}/${fileName}`;

      console.log("Uploading file:", filePath, file.type, file.size);

      const { error: uploadError, data } = await supabase.storage
        .from('store-assets')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        throw uploadError;
      }

      if (!data) {
        throw new Error("لم يتم الحصول على بيانات بعد التحميل");
      }

      const { data: urlData } = supabase.storage
        .from('store-assets')
        .getPublicUrl(filePath);

      console.log("Uploaded successfully, URL:", urlData.publicUrl);
      return urlData.publicUrl;
    } catch (error) {
      console.error(`Error uploading ${path}:`, error);
      return null;
    }
  };

  const handleSave = async () => {
    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("يجب تسجيل الدخول أولاً");

      let logoUrl = existingLogoUrl;
      let bannerUrl = existingBannerUrl;

      if (logoFile) {
        const uploadedLogoUrl = await uploadToStorage(logoFile, 'logos');
        if (uploadedLogoUrl) logoUrl = uploadedLogoUrl;
      }

      if (bannerFile) {
        const uploadedBannerUrl = await uploadToStorage(bannerFile, 'banners');
        if (uploadedBannerUrl) bannerUrl = uploadedBannerUrl;
      }

      const { data: existingSettings } = await supabase
        .from("store_settings")
        .select("user_id")
        .eq("user_id", user.id)
        .single();

      if (existingSettings) {
        const { error: updateError } = await supabase
          .from("store_settings")
          .update({ 
            logo_url: logoUrl,
            banner_url: bannerUrl,
            updated_at: new Date().toISOString()
          })
          .eq("user_id", user.id);

        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from("store_settings")
          .insert([{ 
            user_id: user.id, 
            logo_url: logoUrl,
            banner_url: bannerUrl
          }]);

        if (insertError) throw insertError;
      }

      toast({
        title: "تم الحفظ بنجاح",
        description: "تم تحديث الطابع الشخصي للمتجر",
        duration: 3000,
      });

      setExistingLogoUrl(logoUrl);
      setExistingBannerUrl(bannerUrl);
      
      setLogoFile(null);
      setBannerFile(null);
      setLogoPreview(null);
      setBannerPreview(null);

    } catch (error: any) {
      console.error("Error saving store appearance:", error);
      toast({
        title: "حدث خطأ",
        description: error.message || "حدث خطأ أثناء حفظ التغييرات",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemove = async (type: 'logo' | 'banner') => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("يجب تسجيل الدخول أولاً");

      const updateData = type === 'logo' 
        ? { logo_url: null, updated_at: new Date().toISOString() }
        : { banner_url: null, updated_at: new Date().toISOString() };

      const { error } = await supabase
        .from("store_settings")
        .update(updateData)
        .eq("user_id", user.id);

      if (error) throw error;

      if (type === 'logo') {
        setExistingLogoUrl(null);
        setLogoPreview(null);
        setLogoFile(null);
      } else {
        setExistingBannerUrl(null);
        setBannerPreview(null);
        setBannerFile(null);
      }

      toast({
        title: "تم الحذف بنجاح",
        description: type === 'logo' ? "تم حذف الشعار" : "تم حذف صورة الغلاف",
        duration: 3000,
      });
    } catch (error: any) {
      console.error(`Error removing ${type}:`, error);
      toast({
        title: "حدث خطأ",
        description: error.message || "حدث خطأ أثناء حذف الصورة",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      <main className="container mx-auto p-6">
        <Button
          variant="ghost"
          onClick={() => navigate("/dashboard")}
          className="mb-6"
        >
          <ArrowLeft className="ml-2" />
          العودة للوحة التحكم
        </Button>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto space-y-6"
        >
          <h1 className="text-3xl font-bold mb-8 text-right">الطابع الشخصي</h1>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-right">شعار المتجر</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gray-50 dark:bg-gray-900">
                {(logoPreview || existingLogoUrl) ? (
                  <div className="relative w-full max-w-xs">
                    <img 
                      src={logoPreview || existingLogoUrl || ''} 
                      alt="شعار المتجر" 
                      className="mx-auto max-h-40 object-contain rounded-md"
                    />
                    <Button 
                      variant="destructive" 
                      size="icon" 
                      className="absolute top-2 right-2"
                      onClick={() => handleRemove('logo')}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="text-center">
                    <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-semibold text-gray-900 dark:text-gray-100">لا يوجد شعار</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">قم بتحميل شعار الخاص بمتجرك</p>
                  </div>
                )}
                
                <div className="mt-4">
                  <label className="block">
                    <Button className="flex items-center gap-2">
                      <Upload className="h-4 w-4" />
                      تحميل شعار
                      <Input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleFileChange(e, 'logo')}
                      />
                    </Button>
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-right">صورة الغلاف</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gray-50 dark:bg-gray-900">
                {(bannerPreview || existingBannerUrl) ? (
                  <div className="relative w-full">
                    <img 
                      src={bannerPreview || existingBannerUrl || ''} 
                      alt="صورة الغلاف" 
                      className="w-full h-40 object-cover rounded-md"
                    />
                    <Button 
                      variant="destructive" 
                      size="icon" 
                      className="absolute top-2 right-2"
                      onClick={() => handleRemove('banner')}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="text-center">
                    <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-semibold text-gray-900 dark:text-gray-100">لا توجد صورة غلاف</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">قم بتحميل صورة غلاف لمتجرك</p>
                  </div>
                )}
                
                <div className="mt-4">
                  <label className="block">
                    <Button className="flex items-center gap-2">
                      <Upload className="h-4 w-4" />
                      تحميل صورة الغلاف
                      <Input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleFileChange(e, 'banner')}
                      />
                    </Button>
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>

          <Button 
            onClick={handleSave} 
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? "جاري الحفظ..." : "حفظ التغييرات"}
          </Button>
        </motion.div>
      </main>

      <Sheet open={isCropOpen} onOpenChange={setIsCropOpen}>
        <SheetContent className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>قص الصورة</SheetTitle>
            <SheetDescription>
              قم بتحديد الجزء المطلوب من الصورة
            </SheetDescription>
          </SheetHeader>
          <div className="py-6">
            {imageToCrop && (
              <ReactCrop
                crop={crop}
                onChange={(newCrop) => setCrop(newCrop)}
                aspect={cropType === 'logo' ? 1 : 16/9}
                className="max-h-[400px] mx-auto"
              >
                <img 
                  src={imageToCrop} 
                  alt="صورة للقص"
                  onLoad={(e) => {
                    imageRef.current = e.currentTarget;
                    return false;
                  }} 
                />
              </ReactCrop>
            )}
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setIsCropOpen(false)}>
              إلغاء
            </Button>
            <Button onClick={completeCrop}>
              تأكيد
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default StoreAppearance;
