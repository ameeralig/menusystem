
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

// تعديل مكون حالة التحميل ليتضمن هياكل عظمية واضحة
const LoadingState: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 space-y-8">
      {/* هيكل عظمي للبانر */}
      <div className="w-full" style={{ height: '320px' }}>
        <Skeleton className="w-full h-full rounded-lg" />
      </div>
      
      {/* هيكل عظمي للمحتوى الرئيسي */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 space-y-6">
        {/* هيكل عظمي للعنوان */}
        <div className="flex flex-col items-center">
          <Skeleton className="h-10 w-60 mb-2" />
          <Skeleton className="h-4 w-40" />
        </div>
        
        {/* هيكل عظمي لشريط البحث */}
        <Skeleton className="h-12 w-full" />
        
        {/* هياكل عظمية للتصنيفات */}
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2">
          <Skeleton className="h-[140px] rounded-[30px]" />
          <Skeleton className="h-[140px] rounded-[30px]" />
        </div>
        
        {/* هياكل عظمية للمنتجات */}
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-[300px] rounded-xl" />
          <Skeleton className="h-[300px] rounded-xl" />
          <Skeleton className="h-[300px] rounded-xl" />
        </div>
        
        {/* هيكل عظمي للأزرار الاجتماعية */}
        <div className="flex justify-center">
          <Skeleton className="h-10 w-60" />
        </div>
      </div>
    </div>
  );
};

export default LoadingState;
