
import React from 'react';
import { useEffect } from 'react';

interface ThemeWrapperProps {
  children: React.ReactNode;
}

/**
 * مكون مخصص لتطبيق سمات التصميم العامة على التطبيق
 * يمكن استخدام هذا المكون لإضافة تأثيرات وسمات عامة للتصميم
 */
const ThemeWrapper: React.FC<ThemeWrapperProps> = ({ children }) => {
  useEffect(() => {
    // تطبيق الخلفية الرئيسية في body
    document.body.classList.add('bg-background');
    
    // يمكن إضافة أي منطق إضافي للسمات هنا
    
    return () => {
      // إزالة الفئات عند إلغاء تحميل المكون
      document.body.classList.remove('bg-background');
    };
  }, []);

  return (
    <div className="theme-wrapper">
      {/* تأثيرات الخلفية المتحركة */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div 
          className="absolute top-0 right-0 w-1/3 h-1/3 rounded-full opacity-20 animate-float"
          style={{
            background: 'radial-gradient(circle at center, #c156f1, transparent 70%)',
            filter: 'blur(80px)',
            animation: 'float 15s ease-in-out infinite'
          }}
        />
        <div 
          className="absolute bottom-1/4 left-1/4 w-1/4 h-1/4 rounded-full opacity-10 animate-float"
          style={{
            background: 'radial-gradient(circle at center, #41fadc, transparent 70%)',
            filter: 'blur(60px)',
            animation: 'float 18s ease-in-out infinite reverse'
          }}
        />
      </div>
      
      {/* محتوى التطبيق */}
      {children}
    </div>
  );
};

export default ThemeWrapper;
