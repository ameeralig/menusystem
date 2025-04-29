
import React from 'react';
import { Button } from "@/components/ui/button";
import { Settings, RefreshCw, WifiOff } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface RefreshButtonProps {
  onClick: () => void;
  isAutoRefresh: boolean;
  setIsAutoRefresh: (value: boolean) => void;
}

const RefreshButton: React.FC<RefreshButtonProps> = ({ onClick, isAutoRefresh, setIsAutoRefresh }) => {
  return (
    <div className="fixed bottom-4 right-4 bg-white/90 dark:bg-gray-800/90 p-3 rounded-lg shadow-lg z-50 flex flex-col gap-2 backdrop-blur-sm">
      <div className="flex items-center justify-between gap-4">
        <Label htmlFor="auto-refresh" className="text-sm whitespace-nowrap">التحديث التلقائي</Label>
        <Switch 
          id="auto-refresh" 
          checked={isAutoRefresh} 
          onCheckedChange={setIsAutoRefresh} 
        />
      </div>
      
      <div className="flex gap-2">
        <Button 
          onClick={onClick}
          variant="outline"
          className="flex items-center gap-2 text-sm"
          title="تحديث المحتوى"
          size="sm"
        >
          <RefreshCw className="h-4 w-4" />
          <span>تحديث</span>
        </Button>
        
        <Button 
          variant="outline"
          className="flex items-center gap-2 text-sm"
          title="الإعدادات"
          size="sm"
        >
          <Settings className="h-4 w-4" />
          <span>الإعدادات</span>
        </Button>
      </div>

      <div className="text-xs text-muted-foreground flex items-center gap-1 justify-center">
        {isAutoRefresh ? 
          <span className="flex items-center gap-1">متصل <span className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></span></span> : 
          <span className="flex items-center gap-1">غير متصل <WifiOff className="h-3 w-3" /></span>
        }
      </div>
    </div>
  );
};

export default RefreshButton;
