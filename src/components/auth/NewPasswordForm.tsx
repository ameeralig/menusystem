
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Lock } from "lucide-react";

interface NewPasswordFormProps {
  newPassword: string;
  onPasswordChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onBack: () => void;
  isResetting: boolean;
}

export const NewPasswordForm = ({
  newPassword,
  onPasswordChange,
  onSubmit,
  onBack,
  isResetting
}: NewPasswordFormProps) => {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <motion.div 
          className="mb-6 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <p className="text-sm text-muted-foreground">
            أدخل كلمة المرور الجديدة
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            يجب أن تكون كلمة المرور على الأقل 6 أحرف
          </p>
        </motion.div>
        
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
          كلمة المرور الجديدة
        </label>
        <div className="relative mt-1">
          <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
            <Lock className="h-4 w-4 text-muted-foreground" />
          </div>
          <Input
            type="password"
            value={newPassword}
            onChange={(e) => onPasswordChange(e.target.value)}
            required
            className="ps-10 mt-1 text-right"
            dir="rtl"
            placeholder="أدخل كلمة المرور الجديدة"
            minLength={6}
          />
        </div>
      </motion.div>
      
      <motion.div 
        className="flex justify-end gap-2"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        <Button variant="outline" onClick={onBack} type="button">
          رجوع
        </Button>
        <Button type="submit" disabled={isResetting}>
          {isResetting ? (
            <>
              <span className="mr-2">جاري تغيير كلمة السر...</span>
              <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
            </>
          ) : "تغيير كلمة السر"}
        </Button>
      </motion.div>
    </form>
  );
};
