import { useState, useEffect, useCallback } from 'react';

interface StoreCache {
  [slug: string]: {
    data: any;
    timestamp: number;
    ttl: number; // Time to live in milliseconds
  }
}

const CACHE_KEY = 'lovable_store_cache';
const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

// تقليل مدة الكاش لصور التصنيفات لضمان التحديث السريع
const CATEGORY_CACHE_DURATION = 30 * 1000; // 30 ثانية فقط

export const useStoreCache = () => {
  const [cache, setCache] = useState<StoreCache>({});

  // تحميل الـ cache من localStorage عند التهيئة
  useEffect(() => {
    try {
      const cachedData = localStorage.getItem(CACHE_KEY);
      if (cachedData) {
        const parsedCache = JSON.parse(cachedData);
        // تنظيف البيانات المنتهية الصلاحية
        const currentTime = Date.now();
        const validCache: StoreCache = {};
        
        Object.keys(parsedCache).forEach(slug => {
          const cacheItem = parsedCache[slug];
          if (currentTime - cacheItem.timestamp < cacheItem.ttl) {
            validCache[slug] = cacheItem;
          }
        });
        
        setCache(validCache);
        localStorage.setItem(CACHE_KEY, JSON.stringify(validCache));
      }
    } catch (error) {
      console.error('خطأ في تحميل الـ cache:', error);
    }
  }, []);

  // حفظ الـ cache في localStorage عند التحديث
  useEffect(() => {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
    } catch (error) {
      console.error('خطأ في حفظ الـ cache:', error);
    }
  }, [cache]);

  const getCachedData = useCallback((slug: string) => {
    const cacheItem = cache[slug];
    if (!cacheItem) return null;
    
    const isExpired = Date.now() - cacheItem.timestamp > cacheItem.ttl;
    if (isExpired) {
      // إزالة البيانات المنتهية الصلاحية
      setCache(prev => {
        const newCache = { ...prev };
        delete newCache[slug];
        return newCache;
      });
      return null;
    }
    
    return cacheItem.data;
  }, [cache]);

  const setCachedData = useCallback((slug: string, data: any, ttl: number = DEFAULT_TTL) => {
    setCache(prev => ({
      ...prev,
      [slug]: {
        data,
        timestamp: Date.now(),
        ttl
      }
    }));
  }, []);

  const clearCache = useCallback((slug?: string) => {
    if (slug) {
      setCache(prev => {
        const newCache = { ...prev };
        delete newCache[slug];
        return newCache;
      });
    } else {
      setCache({});
      localStorage.removeItem(CACHE_KEY);
    }
  }, []);

  const isCached = useCallback((slug: string) => {
    const cacheItem = cache[slug];
    if (!cacheItem) return false;
    
    const isExpired = Date.now() - cacheItem.timestamp > cacheItem.ttl;
    return !isExpired;
  }, [cache]);

  return {
    getCachedData,
    setCachedData,
    clearCache,
    isCached
  };
};