import React from "react";
import FastResponseTemplate from "../fast-template/FastResponseTemplate";
import { Product } from "@/types/product";
import { CategoryImage } from "@/types/categoryImage";
import { ContactInfo, FontSettings, SocialLinks } from "@/types/store";

/**
 * قالب Modern Glass — تصميم Awwwards-level بطابع Glassmorphism حديث.
 * يلتفّ حول FastResponseTemplate ويعيد طبقة تصميم متقنة:
 *  - خلفية داكنة عميقة (#0f1115) مع توهجات لون مرجاني خفيفة
 *  - بطاقات بزجاج ضبابي (backdrop-blur) وحدود بيضاء شفافة
 *  - تدرج مرجاني/خوخي #ff7e5f → #feb47b للتمييزات
 *  - طباعة مزدوجة: Playfair Display للعناوين + Cairo للنصوص
 *  - شريط تصنيفات أنيق + بطاقات منتجات بمستوى عالي
 */
interface ModernGlassProps {
  products: Product[];
  colorTheme?: string | null;
  storeName?: string | null;
  onSearchChange?: (query: string) => void;
  contactInfo?: ContactInfo;
  slug?: string;
  storeOwnerId?: string;
  fontSettings?: FontSettings;
  socialLinks?: SocialLinks;
  categoryImages?: CategoryImage[];
  isStoreOwner?: boolean;
  refreshData?: () => void;
  isLoading?: boolean;
  logoUrl?: string | null;
  isEmployeeView?: boolean;
}

const ModernGlassTemplate: React.FC<ModernGlassProps> = (props) => {
  // اللون الأساسي للقالب (مرجاني دافئ) ما لم يُحدد المستخدم لوناً
  const themeColor = props.colorTheme?.startsWith("#") ? props.colorTheme : "#ff7e5f";
  const themeColorEnd = "#feb47b";

  // إضافة كلاس على <html> لتفعيل القواعد على الـ Modals/Sheets الخارجة عن الشجرة
  React.useEffect(() => {
    const root = document.documentElement;
    root.classList.add("dark", "modern-glass-theme");
    return () => {
      root.classList.remove("modern-glass-theme");
    };
  }, []);

  // تحميل خط Playfair Display للعناوين
  React.useEffect(() => {
    const id = "modern-glass-fonts";
    if (document.getElementById(id)) return;
    const link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=Cairo:wght@400;600;700&display=swap";
    document.head.appendChild(link);
  }, []);

  return (
    <div className="modern-glass-root min-h-screen relative">
      {/* ديكور خلفي ناعم — توهجات */}
      <div className="mg-decor" aria-hidden="true">
        <div className="mg-glow mg-glow-1" />
        <div className="mg-glow mg-glow-2" />
        <div className="mg-noise" />
      </div>

      <div className="relative z-[1]">
        <FastResponseTemplate {...props} colorTheme={themeColor} />
      </div>

      <style>{`
        /* === الخلفية الأساسية === */
        .modern-glass-root {
          background: radial-gradient(140% 90% at 50% -10%, #1a1d23 0%, #0f1115 60%, #07080b 100%);
          color: #e4e4e7;
          font-family: 'Cairo', system-ui, sans-serif;
        }
        .mg-decor {
          position: fixed; inset: 0; pointer-events: none; z-index: 0; overflow: hidden;
        }
        .mg-glow {
          position: absolute;
          width: 460px; height: 460px;
          border-radius: 50%;
          filter: blur(120px);
          opacity: 0.35;
        }
        .mg-glow-1 {
          top: -140px; right: -120px;
          background: radial-gradient(circle, ${themeColor} 0%, transparent 70%);
        }
        .mg-glow-2 {
          bottom: -180px; left: -160px;
          background: radial-gradient(circle, ${themeColorEnd} 0%, transparent 70%);
          opacity: 0.25;
        }
        .mg-noise {
          position: absolute; inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px);
          background-size: 32px 32px;
          mask-image: radial-gradient(ellipse at top, #000 30%, transparent 80%);
        }

        /* === طباعة العناوين === */
        .modern-glass-root h1,
        .modern-glass-root h2 {
          font-family: 'Playfair Display', 'Cairo', serif;
          letter-spacing: -0.02em;
        }

        /* === إعادة تنسيق العناصر القادمة من القالب الأصلي === */
        .modern-glass-root .bg-white,
        .modern-glass-root .bg-white\\/80,
        .modern-glass-root [class*="bg-white"]:not([class*="text-"]) {
          background-color: rgba(26, 29, 35, 0.85) !important;
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
        }
        .modern-glass-root .border-gray-100,
        .modern-glass-root .border-gray-200,
        .modern-glass-root .border-b {
          border-color: rgba(255, 255, 255, 0.06) !important;
        }
        .modern-glass-root .text-gray-900,
        .modern-glass-root .text-gray-800,
        .modern-glass-root .text-gray-700 {
          color: #f4f4f5 !important;
        }
        .modern-glass-root .text-gray-600,
        .modern-glass-root .text-gray-500,
        .modern-glass-root .text-gray-400 {
          color: #a1a1aa !important;
        }

        /* === بطاقات المنتجات بزجاج ضبابي === */
        .modern-glass-root [class*="rounded-xl"][class*="bg-card"],
        .modern-glass-root [class*="rounded-2xl"][class*="bg-card"],
        .modern-glass-root .bg-card {
          background: linear-gradient(160deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%) !important;
          border: 1px solid rgba(255, 255, 255, 0.08) !important;
          border-radius: 24px !important;
          box-shadow:
            0 8px 32px -12px rgba(0, 0, 0, 0.5),
            inset 0 1px 0 rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          transition: transform 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
        }
        .modern-glass-root [class*="rounded-xl"][class*="bg-card"]:hover,
        .modern-glass-root [class*="rounded-2xl"][class*="bg-card"]:hover,
        .modern-glass-root .bg-card:hover {
          transform: translateY(-2px);
          border-color: rgba(255, 255, 255, 0.14) !important;
          box-shadow:
            0 14px 40px -12px rgba(255, 126, 95, 0.25),
            inset 0 1px 0 rgba(255, 255, 255, 0.08);
        }

        /* === رأس المتجر === */
        .modern-glass-root .bg-white.dark\\:bg-gray-800 {
          background: linear-gradient(180deg, rgba(26,29,35,0.92) 0%, rgba(15,17,21,0.85) 100%) !important;
          border-bottom: 1px solid rgba(255,255,255,0.06) !important;
        }

        /* === شريط الستوريز/التصنيفات اللاصق === */
        .modern-glass-root .sticky.top-0 {
          background: rgba(15, 17, 21, 0.78) !important;
          backdrop-filter: blur(24px) saturate(1.4);
          -webkit-backdrop-filter: blur(24px) saturate(1.4);
          border-bottom: 1px solid rgba(255,255,255,0.06) !important;
        }

        /* === حقول الإدخال === */
        .modern-glass-root input,
        .modern-glass-root textarea {
          background-color: rgba(255, 255, 255, 0.04) !important;
          border-color: rgba(255, 255, 255, 0.1) !important;
          color: #f4f4f5 !important;
          border-radius: 14px;
        }
        .modern-glass-root input::placeholder,
        .modern-glass-root textarea::placeholder {
          color: #71717a !important;
        }
        .modern-glass-root input:focus,
        .modern-glass-root textarea:focus {
          border-color: ${themeColor} !important;
          box-shadow: 0 0 0 3px ${themeColor}22 !important;
        }

        /* === السعر — تدرّج مرجاني === */
        .modern-glass-root [class*="text-primary"] {
          background: linear-gradient(135deg, ${themeColor}, ${themeColorEnd});
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          color: ${themeColor} !important;
        }

        /* === الأزرار الأساسية === */
        .modern-glass-root button[class*="bg-primary"] {
          background: linear-gradient(135deg, ${themeColor}, ${themeColorEnd}) !important;
          box-shadow: 0 8px 24px -8px ${themeColor}aa !important;
          border: none !important;
        }
        .modern-glass-root button[class*="bg-primary"]:hover {
          filter: brightness(1.08);
          transform: translateY(-1px);
        }

        /* === شريط الإجراءات السفلي العائم === */
        .modern-glass-root .fixed.bottom-0,
        .modern-glass-root [class*="bottom-actions"] {
          backdrop-filter: blur(28px) saturate(1.6) !important;
          -webkit-backdrop-filter: blur(28px) saturate(1.6) !important;
        }

        /* === Skeleton loader أكثر نعومة === */
        .modern-glass-root .animate-pulse {
          background: linear-gradient(90deg, rgba(255,255,255,0.04), rgba(255,255,255,0.08), rgba(255,255,255,0.04)) !important;
          background-size: 200% 100% !important;
          animation: mg-shimmer 1.6s ease-in-out infinite !important;
        }
        @keyframes mg-shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        /* === تحسينات صغيرة للحركة === */
        .modern-glass-root * {
          -webkit-tap-highlight-color: transparent;
        }
      `}</style>
    </div>
  );
};

export default ModernGlassTemplate;
