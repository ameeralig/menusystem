
import { useState } from 'react';
import { useDebounce } from '@/hooks/use-debounce';
import { supabase } from '@/integrations/supabase/client';

export const useSlugChecker = () => {
  const [slugError, setSlugError] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const checkSlug = async (slug: string, currentUserId: string) => {
    if (!slug) {
      setSlugError(null);
      return true;
    }

    setIsChecking(true);
    try {
      const { data, error } = await supabase
        .from('store_settings')
        .select('user_id')
        .eq('slug', slug)
        .maybeSingle();

      if (error) {
        console.error('Error checking slug:', error);
        setSlugError('حدث خطأ أثناء التحقق من الرابط');
        return false;
      }

      // إذا تم العثور على سجل وكان لمستخدم آخر
      if (data && data.user_id !== currentUserId) {
        setSlugError('هذا الرابط مستخدم بالفعل');
        return false;
      }

      setSlugError(null);
      return true;
    } finally {
      setIsChecking(false);
    }
  };

  return {
    slugError,
    isChecking,
    checkSlug,
  };
};
