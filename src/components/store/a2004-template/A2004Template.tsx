import React from "react";
import FastResponseTemplate from "../fast-template/FastResponseTemplate";
import { Product } from "@/types/product";
import { CategoryImage } from "@/types/categoryImage";
import { ContactInfo, FontSettings, SocialLinks } from "@/types/store";

/**
 * قالب A2004 — تصميم Game Club داكن بطابع نيون بنفسجي.
 * يعيد استخدام كل ميزات القالب الأصلي (FastResponseTemplate) مع طبقة تصميم احترافية:
 * - خلفية داكنة عميقة (#0B0717)
 * - بطاقات بزوايا منحنية كبيرة وتدرجات نيون
 * - أزرار مستديرة بلمسة Glow بنفسجية
 * - تباين عالٍ ومناسب للقوائم الإلكترونية الحديثة
 */
interface A2004Props {
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

const A2004Template: React.FC<A2004Props> = (props) => {
  // فرض اللون البنفسجي النيون الخاص بالقالب
  const themeColor = props.colorTheme?.startsWith("#") ? props.colorTheme : "#8B5CF6";

  // إضافة كلاس على <html> لتفعيل التصميم على المكوّنات الفرعية (Modal/Sheet خارج الشجرة)
  React.useEffect(() => {
    const root = document.documentElement;
    root.classList.add("dark", "a2004-theme");
    return () => {
      root.classList.remove("a2004-theme");
    };
  }, []);

  return (
    <div className="a2004-root min-h-screen relative">
      {/* خلفية ديكور نيون */}
      <div className="a2004-bg-decor" aria-hidden="true">
        <div className="a2004-glow a2004-glow-1" />
        <div className="a2004-glow a2004-glow-2" />
        <div className="a2004-grid-overlay" />
      </div>

      <div className="relative z-[1]">
        <FastResponseTemplate {...props} colorTheme={themeColor} />
      </div>

      <style>{`
        /* === لوحة A2004 الداكنة === */
        .a2004-root {
          background: radial-gradient(120% 80% at 50% -10%, #1a0f33 0%, #0B0717 55%, #060312 100%);
          color: #EDE9FE;
        }

        .a2004-bg-decor {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 0;
          overflow: hidden;
        }
        .a2004-glow {
          position: absolute;
          width: 480px;
          height: 480px;
          border-radius: 50%;
          filter: blur(110px);
          opacity: 0.45;
        }
        .a2004-glow-1 {
          top: -120px; right: -120px;
          background: radial-gradient(circle, #8B5CF6 0%, transparent 70%);
        }
        .a2004-glow-2 {
          bottom: -160px; left: -140px;
          background: radial-gradient(circle, #6D28D9 0%, transparent 70%);
        }
        .a2004-grid-overlay {
          position: absolute; inset: 0;
          background-image:
            linear-gradient(rgba(139,92,246,0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(139,92,246,0.05) 1px, transparent 1px);
          background-size: 36px 36px;
          mask-image: radial-gradient(ellipse at top, #000 30%, transparent 80%);
        }

        /* === إعادة تنسيق العناصر القادمة من القالب الأصلي === */
        .a2004-root .bg-white,
        .a2004-root .bg-white\\/80,
        .a2004-root [class*="bg-white"]:not([class*="text-"]) {
          background-color: rgba(20, 12, 38, 0.85) !important;
          backdrop-filter: blur(14px);
        }
        .a2004-root .border-gray-100,
        .a2004-root .border-gray-200,
        .a2004-root .border-b {
          border-color: rgba(139, 92, 246, 0.15) !important;
        }
        .a2004-root .text-gray-900,
        .a2004-root .text-gray-800,
        .a2004-root .text-gray-700 {
          color: #EDE9FE !important;
        }
        .a2004-root .text-gray-600,
        .a2004-root .text-gray-500,
        .a2004-root .text-gray-400 {
          color: #A78BFA !important;
        }

        /* بطاقات المنتجات */
        .a2004-root [class*="rounded-xl"][class*="bg-card"],
        .a2004-root [class*="rounded-2xl"][class*="bg-card"],
        .a2004-root .bg-card {
          background: linear-gradient(160deg, rgba(35, 22, 66, 0.95) 0%, rgba(18, 10, 38, 0.95) 100%) !important;
          border: 1px solid rgba(139, 92, 246, 0.18) !important;
          box-shadow: 0 8px 28px -12px rgba(139, 92, 246, 0.45);
          border-radius: 22px !important;
        }

        /* الأزرار الأساسية */
        .a2004-root button[class*="bg-primary"],
        .a2004-root button[style*="background"] {
          box-shadow: 0 6px 22px -6px ${themeColor}99;
        }

        /* رأس المتجر */
        .a2004-root .bg-white.dark\\:bg-gray-800 {
          background: linear-gradient(180deg, rgba(20,12,38,0.95) 0%, rgba(15,8,30,0.85) 100%) !important;
          border-bottom: 1px solid rgba(139,92,246,0.2) !important;
        }

        /* شريط الستوريز/التصنيفات */
        .a2004-root .sticky.top-0 {
          background: rgba(11, 7, 23, 0.85) !important;
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(139,92,246,0.18) !important;
        }

        /* إدخالات البحث */
        .a2004-root input,
        .a2004-root textarea {
          background-color: rgba(30, 18, 55, 0.7) !important;
          border-color: rgba(139, 92, 246, 0.25) !important;
          color: #EDE9FE !important;
        }
        .a2004-root input::placeholder,
        .a2004-root textarea::placeholder {
          color: #8B7AB8 !important;
        }

        /* السعر يأخذ نيون بنفسجي */
        .a2004-root [class*="text-primary"] {
          color: ${themeColor} !important;
          text-shadow: 0 0 12px ${themeColor}55;
        }
      `}</style>
    </div>
  );
};

export default A2004Template;
