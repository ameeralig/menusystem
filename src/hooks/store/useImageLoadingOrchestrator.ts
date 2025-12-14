/**
 * نظام إدارة تحميل الصور بترتيب أولوية صارم
 * Banner → Category Icons → Active Category Products
 * مع إلغاء الطلبات عند تغيير التصنيف
 */

import { useState, useCallback, useRef, useEffect } from 'react';

// حالات التحميل
export type LoadingState = 'idle' | 'loading' | 'loaded' | 'error';

// حالة تحميل كل مرحلة
export interface StageState {
  banner: LoadingState;
  categories: LoadingState;
  products: Map<string, LoadingState>;
}

// مخزن الصور المحملة
const imageCache = new Map<string, HTMLImageElement>();

// التحقق من وجود الصورة في الكاش
export const isImageCached = (url: string): boolean => {
  return imageCache.has(url);
};

// تحميل صورة واحدة مع دعم الإلغاء
export const loadImage = (
  url: string,
  signal?: AbortSignal
): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    // التحقق من الكاش أولاً
    if (imageCache.has(url)) {
      resolve(imageCache.get(url)!);
      return;
    }

    const img = new Image();
    
    // معالجة الإلغاء
    if (signal) {
      signal.addEventListener('abort', () => {
        img.src = '';
        reject(new DOMException('Aborted', 'AbortError'));
      });
    }

    img.onload = () => {
      imageCache.set(url, img);
      resolve(img);
    };

    img.onerror = () => {
      reject(new Error(`Failed to load image: ${url}`));
    };

    img.src = url;
  });
};

// تحميل مجموعة صور مع إلغاء
export const loadImages = async (
  urls: string[],
  signal?: AbortSignal,
  onProgress?: (loaded: number, total: number) => void
): Promise<HTMLImageElement[]> => {
  const results: HTMLImageElement[] = [];
  let loaded = 0;

  for (const url of urls) {
    if (signal?.aborted) {
      throw new DOMException('Aborted', 'AbortError');
    }

    try {
      const img = await loadImage(url, signal);
      results.push(img);
      loaded++;
      onProgress?.(loaded, urls.length);
    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        throw error;
      }
      // تجاهل أخطاء الصور الفردية
      console.warn(`Failed to load: ${url}`);
    }
  }

  return results;
};

// Hook الرئيسي للتنسيق
export const useImageLoadingOrchestrator = () => {
  const [stageState, setStageState] = useState<StageState>({
    banner: 'idle',
    categories: 'idle',
    products: new Map()
  });

  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const bannerLoadedRef = useRef(false);
  const categoriesLoadedRef = useRef(false);

  // تحديث حالة مرحلة معينة
  const updateStageState = useCallback((
    stage: keyof StageState,
    state: LoadingState,
    categoryName?: string
  ) => {
    setStageState(prev => {
      if (stage === 'products' && categoryName) {
        const newProducts = new Map(prev.products);
        newProducts.set(categoryName, state);
        return { ...prev, products: newProducts };
      }
      return { ...prev, [stage]: state };
    });
  }, []);

  // المرحلة 1: تحميل البانر (LCP)
  const loadBanner = useCallback(async (bannerUrl: string | null) => {
    if (!bannerUrl || bannerLoadedRef.current) return;

    updateStageState('banner', 'loading');
    
    try {
      await loadImage(bannerUrl);
      bannerLoadedRef.current = true;
      updateStageState('banner', 'loaded');
    } catch (error) {
      updateStageState('banner', 'error');
    }
  }, [updateStageState]);

  // المرحلة 2: تحميل صور التصنيفات (بعد البانر)
  const loadCategoryImages = useCallback(async (categoryUrls: string[]) => {
    if (categoriesLoadedRef.current || categoryUrls.length === 0) return;
    
    // الانتظار حتى اكتمال البانر أو عدم وجوده
    if (stageState.banner === 'loading') return;

    updateStageState('categories', 'loading');
    
    try {
      await loadImages(categoryUrls);
      categoriesLoadedRef.current = true;
      updateStageState('categories', 'loaded');
    } catch (error) {
      updateStageState('categories', 'error');
    }
  }, [stageState.banner, updateStageState]);

  // المرحلة 3: تحميل صور المنتجات للتصنيف النشط فقط
  const loadProductImages = useCallback(async (
    categoryName: string,
    productUrls: string[],
    onProgress?: (loaded: number, total: number) => void
  ) => {
    // إلغاء أي تحميل سابق
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // إنشاء AbortController جديد
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    setActiveCategory(categoryName);
    updateStageState('products', 'loading', categoryName);

    try {
      await loadImages(productUrls, signal, onProgress);
      updateStageState('products', 'loaded', categoryName);
    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        console.log(`تم إلغاء تحميل صور ${categoryName}`);
        return;
      }
      updateStageState('products', 'error', categoryName);
    }
  }, [updateStageState]);

  // إلغاء جميع التحميلات الجارية
  const cancelAllLoading = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  // تغيير التصنيف النشط (مع إلغاء التحميل السابق)
  const switchCategory = useCallback((
    categoryName: string,
    productUrls: string[],
    onProgress?: (loaded: number, total: number) => void
  ) => {
    // التحقق من وجود صور محملة مسبقاً
    const currentState = stageState.products.get(categoryName);
    if (currentState === 'loaded') {
      setActiveCategory(categoryName);
      return;
    }

    // تحميل صور التصنيف الجديد
    loadProductImages(categoryName, productUrls, onProgress);
  }, [stageState.products, loadProductImages]);

  // تنظيف عند الإلغاء
  useEffect(() => {
    return () => {
      cancelAllLoading();
    };
  }, [cancelAllLoading]);

  // إعادة التهيئة
  const reset = useCallback(() => {
    cancelAllLoading();
    bannerLoadedRef.current = false;
    categoriesLoadedRef.current = false;
    setStageState({
      banner: 'idle',
      categories: 'idle',
      products: new Map()
    });
    setActiveCategory(null);
  }, [cancelAllLoading]);

  return {
    stageState,
    activeCategory,
    loadBanner,
    loadCategoryImages,
    loadProductImages,
    switchCategory,
    cancelAllLoading,
    reset,
    isImageCached
  };
};

export default useImageLoadingOrchestrator;
