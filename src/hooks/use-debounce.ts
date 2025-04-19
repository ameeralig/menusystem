
import { useState, useEffect } from 'react';

/**
 * هوك لتأخير تحديث قيمة لمدة محددة (بالمللي ثانية)
 * مفيد للحد من استدعاءات API المتكررة أثناء الكتابة
 */
export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // تعيين مؤقت لتأخير تحديث القيمة
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // تنظيف المؤقت عند تغيير القيمة
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}
