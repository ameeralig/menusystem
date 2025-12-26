import { useState, useEffect, useCallback } from 'react';
import { logVisitorActivity, VisitorActionType } from '@/hooks/analytics/useActivityLogger';

const FAVORITES_KEY = 'store_favorites';

export interface FavoritesStore {
  [storeSlug: string]: string[]; // product IDs
}

export const useFavorites = (storeSlug: string, storeOwnerId?: string) => {
  const [favorites, setFavorites] = useState<string[]>([]);

  // تحميل المفضلات من localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(FAVORITES_KEY);
      if (stored) {
        const allFavorites: FavoritesStore = JSON.parse(stored);
        setFavorites(allFavorites[storeSlug] || []);
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  }, [storeSlug]);

  // حفظ المفضلات في localStorage
  const saveFavorites = useCallback((newFavorites: string[]) => {
    try {
      const stored = localStorage.getItem(FAVORITES_KEY);
      const allFavorites: FavoritesStore = stored ? JSON.parse(stored) : {};
      allFavorites[storeSlug] = newFavorites;
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(allFavorites));
    } catch (error) {
      console.error('Error saving favorites:', error);
    }
  }, [storeSlug]);

  // إضافة/إزالة من المفضلة مع تتبع النشاط
  const toggleFavorite = useCallback((productId: string, productName?: string) => {
    setFavorites(prev => {
      const isRemoving = prev.includes(productId);
      const newFavorites = isRemoving
        ? prev.filter(id => id !== productId)
        : [...prev, productId];
      
      saveFavorites(newFavorites);
      
      // تسجيل نشاط الزائر
      if (storeOwnerId) {
        const actionType: VisitorActionType = isRemoving ? 'remove_from_favorites' : 'add_to_favorites';
        logVisitorActivity(storeOwnerId, actionType, { 
          product_id: productId,
          product_name: productName 
        });
      }
      
      return newFavorites;
    });
  }, [saveFavorites, storeOwnerId]);

  // التحقق إذا المنتج مفضل
  const isFavorite = useCallback((productId: string) => {
    return favorites.includes(productId);
  }, [favorites]);

  // مسح كل المفضلات
  const clearFavorites = useCallback(() => {
    setFavorites([]);
    saveFavorites([]);
  }, [saveFavorites]);

  return {
    favorites,
    toggleFavorite,
    isFavorite,
    clearFavorites,
    favoritesCount: favorites.length,
  };
};
