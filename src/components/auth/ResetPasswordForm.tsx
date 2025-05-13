
import { EmailResetForm } from "./EmailResetForm";
import { OTPVerificationForm } from "./OTPVerificationForm";
import { NewPasswordForm } from "./NewPasswordForm";
import { usePasswordReset } from "@/hooks/use-password-reset";
import { motion, AnimatePresence } from "framer-motion";

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

  return (
    <AnimatePresence mode="wait">
      {showNewPasswordInput && (
        <motion.div
          key="new-password"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <NewPasswordForm
            newPassword={newPassword}
            onPasswordChange={setNewPassword}
            onSubmit={handleResetPassword}
            onBack={() => setShowNewPasswordInput(false)}
            isResetting={isResetting}
          />
        </motion.div>
      )}

      {showOTPInput && !showNewPasswordInput && (
        <motion.div
          key="otp"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <OTPVerificationForm
            otp={otp}
            onOTPChange={setOTP}
            onSubmit={handleVerifyOTP}
            onBack={() => setShowOTPInput(false)}
            isResetting={isResetting}
          />
        </motion.div>
      )}

      {!showOTPInput && !showNewPasswordInput && (
        <motion.div
          key="email"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <EmailResetForm
            email={email}
            onEmailChange={setEmail}
            onSubmit={handleSendOTP}
            onBack={onBack}
            isResetting={isResetting}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};
