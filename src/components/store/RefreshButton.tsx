
import React from 'react';
import { Button } from "@/components/ui/button";

interface RefreshButtonProps {
  onClick: () => void;
}

const RefreshButton: React.FC<RefreshButtonProps> = ({ onClick }) => {
  return (
    <button 
      onClick={onClick}
      className="fixed bottom-4 right-4 bg-primary text-white px-4 py-2 rounded-full shadow-lg z-50"
    >
      تحديث الصفحة
    </button>
  );
};

export default RefreshButton;
