
import { FitMode, PositionConfig } from "@/components/shared/ImageUploadPreview";
import React, { CSSProperties } from "react";

/**
 * خدمة معالجة الصور لتطبيق إعدادات المستخدم والحفاظ على تنسيق الصورة
 */
export const imageProcessingService = {
  /**
   * إنشاء CSS استناداً إلى إعدادات المستخدم
   * @param config إعدادات موضع الصورة والتكبير والتدوير
   * @param fitMode وضع ملاءمة الصورة
   * @returns أنماط CSS كسلسلة نصية
   */
  generateImageStyles: (config: PositionConfig, fitMode: FitMode): CSSProperties => {
    let styles: CSSProperties = {
      transformOrigin: `${config.x}% ${config.y}%`,
      transform: `translate(-${config.x}%, -${config.y}%) scale(${config.scale}) rotate(${config.rotation}deg)`
    };
    
    switch (fitMode) {
      case "cover":
        styles = {
          ...styles,
          objectFit: 'cover',
          width: '100%',
          height: '100%'
        };
        break;
      case "contain":
        styles = {
          ...styles,
          objectFit: 'contain',
          maxWidth: '100%',
          maxHeight: '100%'
        };
        break;
      case "fill":
        styles = {
          ...styles,
          objectFit: 'fill',
          width: '100%',
          height: '100%'
        };
        break;
      case "center":
        styles = {
          ...styles,
          objectFit: 'none',
          objectPosition: 'center',
          maxWidth: '100%',
          maxHeight: '100%'
        };
        break;
    }
    
    return styles;
  },
  
  /**
   * تخزين إعدادات الصورة في localStorage
   * @param imageKey مفتاح فريد للصورة
   * @param config إعدادات موضع الصورة
   * @param fitMode وضع ملاءمة الصورة
   */
  saveImageSettings: (imageKey: string, config: PositionConfig, fitMode: FitMode): void => {
    try {
      const imageSettings = {
        config,
        fitMode,
        timestamp: new Date().getTime()
      };
      localStorage.setItem(`image_settings_${imageKey}`, JSON.stringify(imageSettings));
    } catch (error) {
      console.error("فشل في حفظ إعدادات الصورة:", error);
    }
  },
  
  /**
   * استرجاع إعدادات الصورة من localStorage
   * @param imageKey مفتاح فريد للصورة
   * @returns إعدادات الصورة أو القيم الافتراضية في حالة عدم وجود إعدادات محفوظة
   */
  getImageSettings: (imageKey: string): { config: PositionConfig, fitMode: FitMode } => {
    const defaultSettings = {
      config: { x: 50, y: 50, scale: 1, rotation: 0 },
      fitMode: "cover" as FitMode
    };
    
    try {
      const savedSettings = localStorage.getItem(`image_settings_${imageKey}`);
      if (!savedSettings) return defaultSettings;
      
      const settings = JSON.parse(savedSettings);
      
      // التحقق من عمر الإعدادات (7 أيام)
      const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 أيام بالميللي ثانية
      if (Date.now() - settings.timestamp > maxAge) {
        localStorage.removeItem(`image_settings_${imageKey}`);
        return defaultSettings;
      }
      
      return {
        config: settings.config,
        fitMode: settings.fitMode
      };
    } catch (error) {
      console.error("فشل في استرجاع إعدادات الصورة:", error);
      return defaultSettings;
    }
  },
  
  /**
   * تنظيف إعدادات الصورة من localStorage
   * @param imageKey مفتاح فريد للصورة
   */
  clearImageSettings: (imageKey: string): void => {
    try {
      localStorage.removeItem(`image_settings_${imageKey}`);
    } catch (error) {
      console.error("فشل في حذف إعدادات الصورة:", error);
    }
  }
};

/**
 * Hook استخدام لتتبع إعدادات الصورة وتطبيقها
 * @param imageUrl رابط الصورة
 * @param imageKey مفتاح فريد للصورة (اختياري، سيتم استخدام imageUrl إذا لم يتم توفيره)
 * @returns أنماط CSS كسلسلة نصية
 */
export const useImageSettings = (imageUrl: string, imageKey?: string): CSSProperties => {
  const key = imageKey || imageUrl;
  
  if (!key) return {};
  
  const { config, fitMode } = imageProcessingService.getImageSettings(key);
  return imageProcessingService.generateImageStyles(config, fitMode);
};

/**
 * مكون لعرض صورة مع تطبيق الإعدادات المحفوظة
 */
export const StyledImage = ({ 
  src, 
  alt, 
  className = "", 
  imageKey 
}: { 
  src: string; 
  alt: string; 
  className?: string; 
  imageKey?: string;
}): JSX.Element => {
  const styles = useImageSettings(src, imageKey);
  
  return (
    <img 
      src={src} 
      alt={alt} 
      className={className} 
      style={styles}
    />
  );
};
