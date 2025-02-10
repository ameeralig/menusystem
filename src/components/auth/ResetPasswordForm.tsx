
import { EmailResetForm } from "./EmailResetForm";
import { OTPVerificationForm } from "./OTPVerificationForm";
import { NewPasswordForm } from "./NewPasswordForm";
import { usePasswordReset } from "@/hooks/use-password-reset";

interface ResetPasswordFormProps {
  onBack: () => void;
  onSuccess: () => void;
}

export const ResetPasswordForm = ({ onBack, onSuccess }: ResetPasswordFormProps) => {
  const {
    email,
    setEmail,
    isResetting,
    showOTPInput,
    showNewPasswordInput,
    otp,
    setOTP,
    newPassword,
    setNewPassword,
    handleSendOTP,
    handleVerifyOTP,
    handleResetPassword,
    setShowOTPInput,
    setShowNewPasswordInput
  } = usePasswordReset({ onSuccess });

  if (showNewPasswordInput) {
    return (
      <NewPasswordForm
        newPassword={newPassword}
        onPasswordChange={setNewPassword}
        onSubmit={handleResetPassword}
        onBack={() => setShowNewPasswordInput(false)}
        isResetting={isResetting}
      />
    );
  }

  if (showOTPInput) {
    return (
      <OTPVerificationForm
        otp={otp}
        onOTPChange={setOTP}
        onSubmit={handleVerifyOTP}
        onBack={() => setShowOTPInput(false)}
        isResetting={isResetting}
      />
    );
  }

  return (
    <EmailResetForm
      email={email}
      onEmailChange={setEmail}
      onSubmit={handleSendOTP}
      onBack={onBack}
      isResetting={isResetting}
    />
  );
};
