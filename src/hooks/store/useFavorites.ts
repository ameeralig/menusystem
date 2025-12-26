import { useState, useEffect, useCallback } from 'react';

const FAVORITES_KEY = 'store_favorites';

export interface FavoritesStore {
  [storeSlug: string]: string[]; // product IDs
}

export const useFavorites = (storeSlug: string) => {
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

  // إضافة/إزالة من المفضلة
  const toggleFavorite = useCallback((productId: string) => {
    setFavorites(prev => {
      const newFavorites = prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId];
      
      saveFavorites(newFavorites);
      return newFavorites;
    });
  }, [saveFavorites]);

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
