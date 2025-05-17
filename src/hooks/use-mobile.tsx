
import * as React from "react"

const MOBILE_BREAKPOINT = 768
const SMALL_MOBILE_BREAKPOINT = 480

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean>(() => {
    // التهيئة بعرض النافذة الحالي إذا كان متاحًا
    if (typeof window !== 'undefined') {
      return window.innerWidth < MOBILE_BREAKPOINT
    }
    // الافتراضي هو false إذا لم تكن النافذة متاحة (SSR)
    return false
  })

  React.useEffect(() => {
    // معالجة لاستدعائها عند تغيير حجم النافذة
    const handleResize = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    
    // إضافة مستمع الحدث
    window.addEventListener('resize', handleResize)
    
    // استدعاء المعالج فورًا للتهيئة مع الحالة الحالية
    handleResize()
    
    // التنظيف عند إلغاء التثبيت
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return isMobile
}

export function useIsSmallMobile() {
  const [isSmallMobile, setIsSmallMobile] = React.useState<boolean>(() => {
    // التهيئة بعرض النافذة الحالي إذا كان متاحًا
    if (typeof window !== 'undefined') {
      return window.innerWidth < SMALL_MOBILE_BREAKPOINT
    }
    // الافتراضي هو false إذا لم تكن النافذة متاحة (SSR)
    return false
  })

  React.useEffect(() => {
    // معالجة لاستدعائها عند تغيير حجم النافذة
    const handleResize = () => {
      setIsSmallMobile(window.innerWidth < SMALL_MOBILE_BREAKPOINT)
    }
    
    // إضافة مستمع الحدث
    window.addEventListener('resize', handleResize)
    
    // استدعاء المعالج فورًا للتهيئة مع الحالة الحالية
    handleResize()
    
    // التنظيف عند إلغاء التثبيت
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return isSmallMobile
}
