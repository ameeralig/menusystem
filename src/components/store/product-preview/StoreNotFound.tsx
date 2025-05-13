
import React from 'react';

const StoreNotFound = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
      <h1 className="text-2xl font-bold mb-4">هذا المتجر غير موجود</h1>
      <p className="text-muted-foreground mb-8">
        تأكد من الرابط وحاول مرة أخرى، أو قم بإنشاء متجرك الخاص
      </p>
    </div>
  );
};

export default StoreNotFound;
