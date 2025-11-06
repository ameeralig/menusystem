/**
 * نظام تخزين مؤقت ذكي للصور
 * يستخدم IndexedDB لتخزين الصور وبياناتها
 */

interface CachedImage {
  url: string;
  blob: Blob;
  timestamp: number;
  etag?: string;
}

class ImageCacheManager {
  private dbName = 'qrm_image_cache';
  private storeName = 'images';
  private dbVersion = 1;
  private db: IDBDatabase | null = null;
  private memoryCache = new Map<string, string>(); // URL -> ObjectURL
  private maxAge = 7 * 24 * 60 * 60 * 1000; // 7 أيام

  async init(): Promise<void> {
    if (this.db) return;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName, { keyPath: 'url' });
        }
      };
    });
  }

  /**
   * حفظ صورة في الـ cache
   */
  async saveImage(url: string, blob: Blob, etag?: string): Promise<void> {
    await this.init();
    if (!this.db) return;

    const cachedImage: CachedImage = {
      url,
      blob,
      timestamp: Date.now(),
      etag
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.put(cachedImage);

      request.onsuccess = () => {
        // حفظ في الذاكرة المؤقتة أيضاً
        const objectUrl = URL.createObjectURL(blob);
        this.memoryCache.set(url, objectUrl);
        resolve();
      };
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * استرجاع صورة من الـ cache
   */
  async getImage(url: string): Promise<string | null> {
    // أولاً: تحقق من الذاكرة المؤقتة
    if (this.memoryCache.has(url)) {
      return this.memoryCache.get(url)!;
    }

    // ثانياً: تحقق من IndexedDB
    await this.init();
    if (!this.db) return null;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.get(url);

      request.onsuccess = () => {
        const cached = request.result as CachedImage | undefined;
        
        if (!cached) {
          resolve(null);
          return;
        }

        // تحقق من صلاحية الـ cache
        const isExpired = Date.now() - cached.timestamp > this.maxAge;
        if (isExpired) {
          this.deleteImage(url);
          resolve(null);
          return;
        }

        // إنشاء Object URL وحفظه في الذاكرة
        const objectUrl = URL.createObjectURL(cached.blob);
        this.memoryCache.set(url, objectUrl);
        resolve(objectUrl);
      };

      request.onerror = () => reject(request.error);
    });
  }

  /**
   * حذف صورة من الـ cache
   */
  async deleteImage(url: string): Promise<void> {
    // حذف من الذاكرة المؤقتة
    const objectUrl = this.memoryCache.get(url);
    if (objectUrl) {
      URL.revokeObjectURL(objectUrl);
      this.memoryCache.delete(url);
    }

    // حذف من IndexedDB
    await this.init();
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.delete(url);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * مسح الـ cache القديم
   */
  async cleanOldCache(): Promise<void> {
    await this.init();
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.openCursor();

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          const cached = cursor.value as CachedImage;
          const isExpired = Date.now() - cached.timestamp > this.maxAge;
          
          if (isExpired) {
            cursor.delete();
            // حذف من الذاكرة أيضاً
            const objectUrl = this.memoryCache.get(cached.url);
            if (objectUrl) {
              URL.revokeObjectURL(objectUrl);
              this.memoryCache.delete(cached.url);
            }
          }
          
          cursor.continue();
        } else {
          resolve();
        }
      };

      request.onerror = () => reject(request.error);
    });
  }

  /**
   * مسح كل الـ cache
   */
  async clearAll(): Promise<void> {
    // مسح الذاكرة المؤقتة
    this.memoryCache.forEach((objectUrl) => {
      URL.revokeObjectURL(objectUrl);
    });
    this.memoryCache.clear();

    // مسح IndexedDB
    await this.init();
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * تحميل صورة مع التخزين المؤقت
   */
  async loadImage(url: string): Promise<string> {
    // محاولة استرجاع من الـ cache
    const cachedUrl = await this.getImage(url);
    if (cachedUrl) {
      return cachedUrl;
    }

    // تحميل من الخادم
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Failed to load image: ${response.status}`);

      const blob = await response.blob();
      const etag = response.headers.get('etag') || undefined;

      // حفظ في الـ cache
      await this.saveImage(url, blob, etag);

      // إرجاع Object URL
      return URL.createObjectURL(blob);
    } catch (error) {
      console.error('خطأ في تحميل الصورة:', error);
      // إرجاع الـ URL الأصلي كـ fallback
      return url;
    }
  }
}

// إنشاء instance واحد للاستخدام في كل التطبيق
export const imageCache = new ImageCacheManager();

// تنظيف الـ cache القديم عند تحميل التطبيق
imageCache.init().then(() => {
  imageCache.cleanOldCache();
});
