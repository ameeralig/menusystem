
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Image, Upload, X, ArrowLeft, Save, RefreshCw } from "lucide-react";
import ReactCrop, { Crop as CropType, PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

const StoreAppearance = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"logo" | "banner">("logo");
  
  // Logo state
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoCrop, setLogoCrop] = useState<CropType>({
    unit: '%',
    width: 80,
    height: 80,
    x: 10,
    y: 10
  });
  const [completedLogoCrop, setCompletedLogoCrop] = useState<PixelCrop | null>(null);
  
  // Banner state
  const [bannerUrl, setBannerUrl] = useState<string | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [bannerCrop, setBannerCrop] = useState<CropType>({
    unit: '%',
    width: 90,
    height: 50,
    x: 5,
    y: 25
  });
  const [completedBannerCrop, setCompletedBannerCrop] = useState<PixelCrop | null>(null);
  
  const logoImageRef = useRef<HTMLImageElement | null>(null);
  const bannerImageRef = useRef<HTMLImageElement | null>(null);

  // Load existing store appearance settings
  useEffect(() => {
    const fetchStoreAppearance = async () => {
      try {
        setIsLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          navigate('/login');
          return;
        }
        
        const { data, error } = await supabase
          .from('store_settings')
          .select('logo_url, banner_url')
          .eq('user_id', user.id)
          .maybeSingle();
          
        if (error && error.code !== 'PGRST116') {
          console.error("Error fetching store appearance:", error);
          toast({
            title: "خطأ في تحميل بيانات المتجر",
            description: error.message,
            variant: "destructive",
          });
        } else if (data) {
          setLogoUrl(data.logo_url);
          setBannerUrl(data.banner_url);
          setLogoPreview(data.logo_url);
          setBannerPreview(data.banner_url);
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchStoreAppearance();
  }, [navigate, toast]);

  // Handle file uploads
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, type: "logo" | "banner") => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.addEventListener('load', () => {
      if (type === "logo") {
        setLogoFile(file);
        setLogoPreview(reader.result as string);
      } else {
        setBannerFile(file);
        setBannerPreview(reader.result as string);
      }
    });
    reader.readAsDataURL(file);
  };

  // Generate cropped image
  const getCroppedImg = (image: HTMLImageElement, crop: PixelCrop, fileName: string): Promise<Blob> => {
    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    canvas.width = crop.width;
    canvas.height = crop.height;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      throw new Error('Could not get 2D context from canvas');
    }
    
    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width,
      crop.height
    );
    
    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Canvas is empty'));
            return;
          }
          resolve(blob);
        },
        'image/jpeg',
        0.95
      );
    });
  };

  // Handle save
  const handleSave = async () => {
    try {
      setIsSaving(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "خطأ في تحميل بيانات المستخدم",
          description: "يرجى تسجيل الدخول مرة أخرى",
          variant: "destructive",
        });
        return;
      }
      
      let newLogoUrl = logoUrl;
      let newBannerUrl = bannerUrl;
      
      // Process and upload logo if changed
      if (logoFile && logoPreview && completedLogoCrop && logoImageRef.current) {
        const blob = await getCroppedImg(logoImageRef.current, completedLogoCrop, 'cropped-logo.jpg');
        const file = new File([blob], 'store-logo.jpg', { type: 'image/jpeg' });
        
        // Upload to Supabase Storage
        const { data: logoData, error: logoError } = await supabase.storage
          .from('store-assets')
          .upload(`${user.id}/logo.jpg`, file, { upsert: true });
          
        if (logoError) {
          console.error("Error uploading logo:", logoError);
          throw new Error("فشل في رفع الشعار");
        }
        
        // Get public URL
        const { data: logoUrlData } = supabase.storage
          .from('store-assets')
          .getPublicUrl(`${user.id}/logo.jpg`);
          
        newLogoUrl = logoUrlData.publicUrl;
      }
      
      // Process and upload banner if changed
      if (bannerFile && bannerPreview && completedBannerCrop && bannerImageRef.current) {
        const blob = await getCroppedImg(bannerImageRef.current, completedBannerCrop, 'cropped-banner.jpg');
        const file = new File([blob], 'store-banner.jpg', { type: 'image/jpeg' });
        
        // Upload to Supabase Storage
        const { data: bannerData, error: bannerError } = await supabase.storage
          .from('store-assets')
          .upload(`${user.id}/banner.jpg`, file, { upsert: true });
          
        if (bannerError) {
          console.error("Error uploading banner:", bannerError);
          throw new Error("فشل في رفع صورة الغلاف");
        }
        
        // Get public URL
        const { data: bannerUrlData } = supabase.storage
          .from('store-assets')
          .getPublicUrl(`${user.id}/banner.jpg`);
          
        newBannerUrl = bannerUrlData.publicUrl;
      }
      
      // Update store settings with new URLs
      const { error: updateError } = await supabase
        .from('store_settings')
        .update({
          logo_url: newLogoUrl,
          banner_url: newBannerUrl
        })
        .eq('user_id', user.id);
        
      if (updateError) {
        console.error("Error updating store settings:", updateError);
        throw new Error("فشل في تحديث إعدادات المتجر");
      }
      
      toast({
        title: "تم حفظ التغييرات بنجاح",
        description: "تم تحديث مظهر المتجر",
        duration: 3000,
      });
      
      navigate('/dashboard');
    } catch (error: any) {
      console.error("Error saving store appearance:", error);
      toast({
        title: "حدث خطأ",
        description: error.message || "فشل في حفظ التغييرات",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const resetImage = (type: "logo" | "banner") => {
    if (type === "logo") {
      setLogoFile(null);
      setLogoPreview(logoUrl);
      setCompletedLogoCrop(null);
    } else {
      setBannerFile(null);
      setBannerPreview(bannerUrl);
      setCompletedBannerCrop(null);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 flex items-center justify-center min-h-[50vh]">
        <div className="text-center space-y-4">
          <RefreshCw className="animate-spin h-8 w-8 mx-auto text-primary" />
          <p className="text-lg">جاري تحميل بيانات المتجر...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-6">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          العودة للوحة التحكم
        </Button>
        <h1 className="text-2xl font-bold">الطابع الشخصي للصفحة</h1>
      </div>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>تخصيص مظهر المتجر</CardTitle>
          <CardDescription>
            قم بتخصيص مظهر متجرك عن طريق تحميل شعار وصورة غلاف خاصة بك
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "logo" | "banner")}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="logo">شعار المتجر</TabsTrigger>
              <TabsTrigger value="banner">صورة الغلاف</TabsTrigger>
            </TabsList>
            
            <TabsContent value="logo" className="space-y-4">
              <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gray-50 dark:bg-gray-900 hover:border-primary/50 transition-colors">
                {logoPreview ? (
                  <div className="space-y-4 w-full">
                    <div className="flex justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => resetImage("logo")}
                        className="text-gray-500"
                      >
                        <X className="h-4 w-4 mr-1" />
                        إلغاء
                      </Button>
                    </div>
                    <div className="max-w-md mx-auto">
                      <ReactCrop
                        crop={logoCrop}
                        onChange={(c) => setLogoCrop(c)}
                        onComplete={(c) => setCompletedLogoCrop(c)}
                        aspect={1}
                        circularCrop
                      >
                        <img
                          ref={logoImageRef}
                          src={logoPreview}
                          alt="شعار المتجر"
                          className="max-w-full"
                        />
                      </ReactCrop>
                    </div>
                    <p className="text-sm text-gray-500 text-center mt-2">
                      قم بسحب الصورة لتعديل موضعها ثم اضغط على حفظ التغييرات
                    </p>
                  </div>
                ) : (
                  <div className="text-center space-y-4">
                    <div className="w-20 h-20 bg-gray-200 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto">
                      <Image className="h-10 w-10 text-gray-400" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-lg font-medium">قم بتحميل شعار المتجر</h3>
                      <p className="text-sm text-gray-500 max-w-md mx-auto">
                        قم بتحميل صورة بصيغة JPG أو PNG بحجم مناسب ليتم عرضها كشعار لمتجرك
                      </p>
                    </div>
                    <label className="cursor-pointer">
                      <Input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleFileUpload(e, "logo")}
                      />
                      <Button variant="outline" className="gap-2">
                        <Upload className="h-4 w-4" />
                        تحميل صورة
                      </Button>
                    </label>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="banner" className="space-y-4">
              <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gray-50 dark:bg-gray-900 hover:border-primary/50 transition-colors">
                {bannerPreview ? (
                  <div className="space-y-4 w-full">
                    <div className="flex justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => resetImage("banner")}
                        className="text-gray-500"
                      >
                        <X className="h-4 w-4 mr-1" />
                        إلغاء
                      </Button>
                    </div>
                    <div className="w-full">
                      <ReactCrop
                        crop={bannerCrop}
                        onChange={(c) => setBannerCrop(c)}
                        onComplete={(c) => setCompletedBannerCrop(c)}
                        aspect={16/5}
                      >
                        <img
                          ref={bannerImageRef}
                          src={bannerPreview}
                          alt="صورة الغلاف"
                          className="max-w-full"
                        />
                      </ReactCrop>
                    </div>
                    <p className="text-sm text-gray-500 text-center mt-2">
                      قم بسحب الصورة لتعديل موضعها ثم اضغط على حفظ التغييرات
                    </p>
                  </div>
                ) : (
                  <div className="text-center space-y-4">
                    <div className="w-full h-32 bg-gray-200 dark:bg-gray-800 rounded-lg flex items-center justify-center mx-auto">
                      <Image className="h-12 w-12 text-gray-400" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-lg font-medium">قم بتحميل صورة الغلاف</h3>
                      <p className="text-sm text-gray-500 max-w-md mx-auto">
                        قم بتحميل صورة بصيغة JPG أو PNG بحجم مناسب ليتم عرضها كغلاف لمتجرك
                      </p>
                    </div>
                    <label className="cursor-pointer">
                      <Input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleFileUpload(e, "banner")}
                      />
                      <Button variant="outline" className="gap-2">
                        <Upload className="h-4 w-4" />
                        تحميل صورة
                      </Button>
                    </label>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="flex justify-end mt-6">
            <Button 
              onClick={handleSave} 
              disabled={isSaving} 
              className="gap-2"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  جاري الحفظ...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  حفظ التغييرات
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StoreAppearance;
