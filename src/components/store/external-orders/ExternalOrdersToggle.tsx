import { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Settings } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface ExternalOrdersToggleProps {
  storeOwnerId: string;
  isStoreOwner: boolean;
}

const ExternalOrdersToggle = ({ storeOwnerId, isStoreOwner }: ExternalOrdersToggleProps) => {
  const [enabled, setEnabled] = useState(false);
  const [deliveryFee, setDeliveryFee] = useState("0");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isStoreOwner || !storeOwnerId) return;

    const fetchSettings = async () => {
      const { data } = await supabase
        .from("store_settings")
        .select("external_orders_enabled, delivery_fee")
        .eq("user_id", storeOwnerId)
        .single();

      if (data) {
        setEnabled(data.external_orders_enabled || false);
        setDeliveryFee(data.delivery_fee?.toString() || "0");
      }
    };

    fetchSettings();
  }, [storeOwnerId, isStoreOwner]);

  const handleToggle = async (checked: boolean) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("store_settings")
        .update({ external_orders_enabled: checked })
        .eq("user_id", storeOwnerId);

      if (error) throw error;

      setEnabled(checked);
      toast.success(checked ? "تم تفعيل الطلبات الخارجية" : "تم إيقاف الطلبات الخارجية");
    } catch (error) {
      console.error("Error toggling external orders:", error);
      toast.error("حدث خطأ أثناء التحديث");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveDeliveryFee = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("store_settings")
        .update({ delivery_fee: parseFloat(deliveryFee) || 0 })
        .eq("user_id", storeOwnerId);

      if (error) throw error;

      toast.success("تم حفظ مبلغ التوصيل");
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error saving delivery fee:", error);
      toast.error("حدث خطأ أثناء الحفظ");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isStoreOwner) return null;

  return (
    <div className="fixed top-4 left-4 z-50 flex items-center gap-2 bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-2">
        <Switch
          checked={enabled}
          onCheckedChange={handleToggle}
          disabled={isLoading}
        />
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          طلبات خارجية
        </span>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Settings className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>إعدادات الطلبات الخارجية</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="delivery-fee">مبلغ التوصيل (د.ع)</Label>
              <Input
                id="delivery-fee"
                type="number"
                min="0"
                step="0.01"
                value={deliveryFee}
                onChange={(e) => setDeliveryFee(e.target.value)}
                placeholder="0"
              />
            </div>
            <Button 
              onClick={handleSaveDeliveryFee} 
              disabled={isLoading}
              className="w-full"
            >
              حفظ
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ExternalOrdersToggle;
