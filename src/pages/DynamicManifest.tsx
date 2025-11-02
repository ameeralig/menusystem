import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

const DynamicManifest = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    const generateManifest = async () => {
      if (!slug) {
        navigate('/');
        return;
      }

      try {
        // جلب بيانات المتجر
        const { data: storeData, error } = await supabase
          .from('store_settings')
          .select('store_name, color_theme, banner_url')
          .eq('store_slug', slug)
          .single();

        if (error || !storeData) {
          console.error('خطأ في جلب بيانات المتجر:', error);
          navigate('/');
          return;
        }

        // تحديد لون الثيم
        const getThemeColor = (theme: string | null) => {
          if (theme && theme.startsWith('#')) {
            return theme;
          }
          
          const themeColors: Record<string, string> = {
            coral: '#ff9178',
            purple: '#8b5cf6',
            blue: '#3b82f6',
            green: '#10b981',
            pink: '#ec4899',
            teal: '#14b8a6',
            amber: '#f59e0b',
            indigo: '#6366f1',
            rose: '#f43f5e',
          };
          
          return themeColors[theme || ''] || '#3b82f6';
        };

        const themeColor = getThemeColor(storeData.color_theme);
        const storeName = storeData.store_name || 'متجري';
        const iconUrl = storeData.banner_url || '/qr-logo-og.png';

        // إنشاء manifest
        const manifest = {
          name: storeName,
          short_name: storeName,
          description: `تصفح منتجات ${storeName}`,
          start_url: `/products/${slug}`,
          scope: `/products/${slug}`,
          display: 'standalone',
          background_color: '#ffffff',
          theme_color: themeColor,
          orientation: 'portrait-primary',
          icons: [
            {
              src: iconUrl,
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any maskable'
            },
            {
              src: iconUrl,
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any maskable'
            }
          ],
          categories: ['shopping', 'business'],
          dir: 'rtl',
          lang: 'ar'
        };

        // تحويل manifest إلى JSON وإرساله
        const manifestJson = JSON.stringify(manifest, null, 2);
        const blob = new Blob([manifestJson], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        // تنزيل الملف
        const link = document.createElement('a');
        link.href = url;
        link.download = `manifest-${slug}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        // العودة إلى صفحة المتجر
        navigate(`/products/${slug}`);
      } catch (error) {
        console.error('خطأ في إنشاء manifest:', error);
        navigate('/');
      }
    };

    generateManifest();
  }, [slug, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">جاري تجهيز التطبيق...</p>
      </div>
    </div>
  );
};

export default DynamicManifest;
