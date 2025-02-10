
import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

interface OTPVerificationFormProps {
  otp: string;
  onOTPChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onBack: () => void;
  isResetting: boolean;
}

export const OTPVerificationForm = ({
  otp,
  onOTPChange,
  onSubmit,
  onBack,
  isResetting
}: OTPVerificationFormProps) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="flex flex-col items-center space-y-4">
        <InputOTP
          maxLength={6}
          value={otp}
          onChange={onOTPChange}
          render={({ slots }) => (
            <InputOTPGroup>
              {slots.map((slot, idx) => (
                <InputOTPSlot key={idx} {...slot} index={idx} />
              ))}
            </InputOTPGroup>
          )}
        />
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onBack}>
          رجوع
        </Button>
        <Button type="submit" disabled={isResetting || otp.length !== 6}>
          {isResetting ? "جاري التحقق..." : "تحقق من الرمز"}
        </Button>
      </div>
    </form>
  );
};
