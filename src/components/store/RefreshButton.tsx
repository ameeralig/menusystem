
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface RefreshButtonProps {
  onRefresh: () => void;
}

const RefreshButton = ({ onRefresh }: RefreshButtonProps) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    onRefresh();
    setTimeout(() => {
      setIsRefreshing(false);
      toast({
        title: "تم التحديث",
        description: "تم تحديث بيانات المتجر بنجاح",
        duration: 2000,
      });
    }, 1500);
  };

  return (
    <Button
      onClick={handleManualRefresh}
      disabled={isRefreshing}
      className="fixed bottom-4 right-4 z-50 rounded-full shadow-lg flex items-center gap-2 px-4 py-2"
    >
      <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
      {isRefreshing ? "جاري التحديث..." : "تحديث الصفحة"}
    </Button>
  );
};

export default RefreshButton;
