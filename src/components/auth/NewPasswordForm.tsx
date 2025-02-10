
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
          كلمة المرور الجديدة
        </label>
        <Input
          type="password"
          value={newPassword}
          onChange={(e) => onPasswordChange(e.target.value)}
          required
          className="mt-1 text-right"
          dir="rtl"
          minLength={6}
        />
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onBack}>
          رجوع
        </Button>
        <Button type="submit" disabled={isResetting}>
          {isResetting ? "جاري تغيير كلمة السر..." : "تغيير كلمة السر"}
        </Button>
      </div>
    </form>
  );
};
