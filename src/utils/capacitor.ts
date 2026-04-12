import { Capacitor } from '@capacitor/core';

/**
 * أدوات مساعدة لـ Capacitor
 */

// هل التطبيق يعمل كتطبيق أصلي؟
export const isNativePlatform = (): boolean => {
  return Capacitor.isNativePlatform();
};

// الحصول على المنصة الحالية
export const getPlatform = (): string => {
  return Capacitor.getPlatform(); // 'web' | 'ios' | 'android'
};

// هل التطبيق يعمل على iOS؟
export const isIOS = (): boolean => {
  return Capacitor.getPlatform() === 'ios';
};

// هل التطبيق يعمل على Android؟
export const isAndroid = (): boolean => {
  return Capacitor.getPlatform() === 'android';
};

// تهيئة إضافات Capacitor
export const initCapacitorPlugins = async (): Promise<void> => {
  if (!isNativePlatform()) return;

  try {
    // تهيئة Status Bar
    const { StatusBar, Style } = await import('@capacitor/status-bar');
    await StatusBar.setStyle({ style: Style.Dark });
    await StatusBar.setBackgroundColor({ color: '#0a0a0a' });

    if (isAndroid()) {
      await StatusBar.setOverlaysWebView({ overlay: false });
    }
  } catch (e) {
    console.log('StatusBar plugin not available');
  }

  try {
    // إخفاء شاشة البداية بعد التحميل
    const { SplashScreen } = await import('@capacitor/splash-screen');
    await SplashScreen.hide();
  } catch (e) {
    console.log('SplashScreen plugin not available');
  }

  try {
    // التعامل مع زر الرجوع في Android
    const { App: CapApp } = await import('@capacitor/app');
    CapApp.addListener('backButton', ({ canGoBack }) => {
      if (canGoBack) {
        window.history.back();
      } else {
        CapApp.exitApp();
      }
    });
  } catch (e) {
    console.log('App plugin not available');
  }
};
