import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface InlineDarkModeToggleProps {
  darkMode: boolean;
  storeOwnerId: string;
  onUpdate: () => void;
}

const InlineDarkModeToggle = ({
  darkMode,
  storeOwnerId,
  onUpdate,
}: InlineDarkModeToggleProps) => {
  const handleToggle = async () => {
    try {
      const { error } = await supabase
        .from("store_settings")
        .update({
          dark_mode: !darkMode,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", storeOwnerId);

      if (error) throw error;

      toast.success(darkMode ? "تم تفعيل الوضع الفاتح" : "تم تفعيل الوضع الداكن");
      onUpdate();
    } catch (error) {
      console.error("خطأ في تبديل الوضع:", error);
      toast.error("فشل تبديل الوضع");
    }
  };

  return (
    <Button
      onClick={handleToggle}
      variant="outline"
      size="sm"
      className="fixed bottom-4 left-4 z-50 shadow-lg"
    >
      {darkMode ? (
        <>
          <Sun className="h-4 w-4 ml-2" />
          الوضع الفاتح
        </>
      ) : (
        <>
          <Moon className="h-4 w-4 ml-2" />
          الوضع الداكن
        </>
      )}
    </Button>
  );
};

export default InlineDarkModeToggle;
