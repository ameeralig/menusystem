
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface EmailResetFormProps {
  email: string;
  onEmailChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onBack: () => void;
  isResetting: boolean;
}

export const EmailResetForm = ({
  email,
  onEmailChange,
  onSubmit,
  onBack,
  isResetting
}: EmailResetFormProps) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
          البريد الإلكتروني
        </label>
        <Input
          type="email"
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
          required
          className="mt-1 text-right"
          dir="rtl"
        />
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onBack}>
          إلغاء
        </Button>
        <Button type="submit" disabled={isResetting}>
          {isResetting ? "جاري إرسال الرمز..." : "إرسال رمز التحقق"}
        </Button>
      </div>
    </form>
  );
};
