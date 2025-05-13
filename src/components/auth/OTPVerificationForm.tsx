
import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { motion } from "framer-motion";

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
  // تأثيرات حركية للرمز المتحرك في الخلفية
  const codeDigits = Array(6).fill(0);
  
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <motion.div 
        className="mb-6 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <p className="text-sm text-muted-foreground">
          تم إرسال رمز التحقق إلى بريدك الإلكتروني
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          يرجى إدخال الرمز المكون من 6 أرقام
        </p>
      </motion.div>
      
      <motion.div 
        className="flex flex-col items-center space-y-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="relative">
          {/* تأثير خلفي للرمز */}
          <div className="absolute inset-0 flex justify-center opacity-5 overflow-hidden">
            {codeDigits.map((_, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: -20 }}
                animate={{ 
                  opacity: 1, 
                  y: 0,
                  transition: { 
                    delay: index * 0.1 + 0.5,
                    duration: 0.8,
                    repeat: Infinity,
                    repeatType: "reverse",
                    repeatDelay: 1
                  } 
                }}
                className="text-5xl mx-1 text-primary font-bold"
              >
                {Math.floor(Math.random() * 10)}
              </motion.div>
            ))}
          </div>
          
          <InputOTP
            maxLength={6}
            value={otp}
            onChange={onOTPChange}
            className="gap-2"
            render={({ slots }) => (
              <InputOTPGroup>
                {slots.map((slot, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: idx * 0.1 }}
                  >
                    <InputOTPSlot {...slot} index={idx} />
                  </motion.div>
                ))}
              </InputOTPGroup>
            )}
          />
        </div>
      </motion.div>
      
      <motion.div 
        className="flex justify-end gap-2"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.5 }}
      >
        <Button variant="outline" onClick={onBack} type="button">
          رجوع
        </Button>
        <Button type="submit" disabled={isResetting || otp.length !== 6}>
          {isResetting ? (
            <>
              <span className="mr-2">جاري التحقق...</span>
              <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
            </>
          ) : "تحقق من الرمز"}
        </Button>
      </motion.div>
    </form>
  );
};
