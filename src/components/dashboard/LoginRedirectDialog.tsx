import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Store } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

interface LoginRedirectDialogProps {
  open: boolean;
  onClose: () => void;
  storeSlug: string | null;
}

const LoginRedirectDialog = ({ open, onClose, storeSlug }: LoginRedirectDialogProps) => {
  const navigate = useNavigate();

  const goToDashboard = () => {
    onClose();
  };

  const goToPreview = () => {
    if (storeSlug) {
      navigate(`/${storeSlug}`);
    }
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <DialogTitle className="text-xl">مرحبًا بعودتك! 👋</DialogTitle>
          <DialogDescription className="text-base">
            إلى أين تريد الذهاب؟
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 mt-6">
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              variant="outline"
              onClick={goToDashboard}
              className="w-full h-auto py-6 flex flex-col items-center gap-3 hover:bg-primary/5 hover:border-primary/50"
            >
              <div className="p-3 bg-primary/10 rounded-full">
                <LayoutDashboard className="h-6 w-6 text-primary" />
              </div>
              <div className="text-center">
                <p className="font-semibold">لوحة التحكم</p>
                <p className="text-xs text-muted-foreground mt-1">إدارة المتجر</p>
              </div>
            </Button>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              variant="outline"
              onClick={goToPreview}
              disabled={!storeSlug}
              className="w-full h-auto py-6 flex flex-col items-center gap-3 hover:bg-primary/5 hover:border-primary/50"
            >
              <div className="p-3 bg-primary/10 rounded-full">
                <Store className="h-6 w-6 text-primary" />
              </div>
              <div className="text-center">
                <p className="font-semibold">صفحة المتجر</p>
                <p className="text-xs text-muted-foreground mt-1">معاينة المتجر</p>
              </div>
            </Button>
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LoginRedirectDialog;
