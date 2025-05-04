
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, Lock } from "lucide-react";

interface PasswordInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  className?: string;
  id?: string;
  disabled?: boolean;
}

export const PasswordInput: React.FC<PasswordInputProps> = ({
  value,
  onChange,
  placeholder = "كلمة المرور",
  className,
  id = "password",
  disabled = false,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const togglePasswordVisibility = () => {
    setIsAnimating(true);
    setShowPassword(!showPassword);
    
    // إنهاء التأثير المتحرك بعد 400 مللي ثانية
    setTimeout(() => setIsAnimating(false), 400);
  };

  return (
    <div className="relative">
      <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
        <Lock className="h-4 w-4 text-muted-foreground" />
      </div>
      
      <Input
        id={id}
        type={showPassword ? "text" : "password"}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`ps-10 pe-12 ${className}`}
        disabled={disabled}
        dir="rtl"
      />
      
      {/* زر إظهار/إخفاء كلمة المرور مع تأثيرات متحركة */}
      <button
        type="button"
        onClick={togglePasswordVisibility}
        className="absolute inset-y-0 end-0 flex items-center pe-3 group"
        aria-label={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
      >
        <div className={`
          relative w-6 h-6 flex items-center justify-center
          before:absolute before:inset-0 
          ${showPassword ? 'before:animate-pulse before:bg-primary/10 before:rounded-full' : ''}
          transition-all duration-300
        `}>
          {showPassword ? (
            <Eye 
              className={`h-4 w-4 text-primary transition-all duration-300
                ${isAnimating ? 'animate-[scale-in_0.4s_ease-out]' : ''}
                group-hover:text-primary/80`}
            />
          ) : (
            <EyeOff 
              className={`h-4 w-4 text-muted-foreground transition-all duration-300
                ${isAnimating ? 'animate-[scale-in_0.4s_ease-out]' : ''}
                group-hover:text-primary`}
            />
          )}
        </div>
        
        {/* تأثير النيون عند النقر على الزر */}
        <span
          className={`absolute inset-0 rounded-full ${isAnimating ? 'animate-ping opacity-30 bg-primary' : 'opacity-0'} 
            transition-opacity duration-300`}
        ></span>
      </button>
      
      {/* تأثير كسر الزجاج عند تغيير حالة كلمة المرور */}
      {isAnimating && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className={`
            absolute inset-0 bg-gradient-to-r from-transparent via-primary/20 to-transparent
            ${showPassword ? 'animate-[slide-in-right_0.4s_ease-out]' : 'animate-[slide-out-right_0.4s_ease-out]'}
          `}></div>
        </div>
      )}
    </div>
  );
};
