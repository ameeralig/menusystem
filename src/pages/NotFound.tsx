
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home, AlertCircle } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E5DEFF] to-white flex flex-col items-center justify-center p-6">
      <div className="glass-morphism max-w-md w-full bg-white bg-opacity-90 backdrop-blur-sm rounded-3xl border border-[#f2f1fa] shadow-xl p-8 text-center">
        <div className="mx-auto mb-6 bg-red-50 rounded-full p-3 w-16 h-16 flex items-center justify-center">
          <AlertCircle className="text-red-500 h-10 w-10" />
        </div>
        
        <h1 className="text-4xl font-bold mb-2 text-gradient bg-gradient-to-r from-[#9b87f5] via-[#ff9178] to-[#9b87f5] bg-clip-text text-transparent">404</h1>
        <h2 className="text-xl font-medium mb-4 text-gray-700">الصفحة غير موجودة</h2>
        <p className="text-gray-600 mb-8">
          عذراً، لم نتمكن من العثور على الصفحة التي تبحث عنها. قد تكون الصفحة قد تم نقلها أو حذفها أو ربما كان هناك خطأ في الرابط.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/">
            <Button variant="default" className="w-full flex items-center gap-2 bg-[#9b87f5] hover:bg-[#8a75f0]">
              <Home size={18} />
              العودة للصفحة الرئيسية
            </Button>
          </Link>
          
          <Button 
            variant="outline" 
            className="w-full border-[#9b87f5] text-[#9b87f5] hover:bg-[#9b87f5]/10"
            onClick={() => window.history.back()}
          >
            العودة للصفحة السابقة
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
