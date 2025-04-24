
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home, ArrowLeft } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full text-center space-y-6 p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <h1 className="text-6xl font-bold mb-2 text-red-500">404</h1>
        <p className="text-xl font-medium text-gray-700 dark:text-gray-300 mb-6">عذراً، لم نتمكن من العثور على هذه الصفحة</p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">الصفحة التي تبحث عنها قد تكون محذوفة أو تم تغيير عنوانها</p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/">
            <Button variant="default" className="flex items-center gap-2 w-full">
              <Home size={18} />
              العودة للصفحة الرئيسية
            </Button>
          </Link>
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={() => window.history.back()}
          >
            <ArrowLeft size={18} />
            الرجوع للخلف
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
