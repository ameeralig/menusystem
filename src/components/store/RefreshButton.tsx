
import React from 'react';
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";

interface RefreshButtonProps {
  onClick: () => void;
  isAutoRefresh?: boolean;
}

const RefreshButton: React.FC<RefreshButtonProps> = ({ onClick, isAutoRefresh = false }) => {
  if (isAutoRefresh) return null;
  
  return (
    <button 
      onClick={onClick}
      className="fixed bottom-4 right-4 bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-full shadow-lg z-50 flex items-center gap-2"
      title="الإعدادات"
    >
      <Settings className="h-4 w-4" />
      <span>الإعدادات</span>
    </button>
  );
};

export default RefreshButton;
