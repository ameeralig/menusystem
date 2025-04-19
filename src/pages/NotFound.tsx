
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold mb-4">404</h1>
      <p className="text-lg text-gray-600 mb-8">عذراً، لم نتمكن من العثور على هذه الصفحة</p>
      <Link to="/">
        <Button variant="default" className="flex items-center gap-2">
          <Home size={20} />
          العودة للصفحة الرئيسية
        </Button>
      </Link>
    </div>
  );
};

export default NotFound;
