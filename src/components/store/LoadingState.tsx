
import React from 'react';

const LoadingState: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 flex items-center justify-center">
      <div className="text-lg text-gray-600 dark:text-gray-400">جاري التحميل...</div>
    </div>
  );
};

export default LoadingState;
