
import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";

interface DashboardActionButtonProps {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  variant?: "default" | "secondary" | "outline";
  disabled?: boolean;
  size?: "sm" | "default" | "lg" | "icon";
}

const DashboardActionButton = ({
  icon: Icon,
  label,
  onClick,
  variant = "default",
  disabled = false,
  size = "default"
}: DashboardActionButtonProps) => {
  const getBaseStyle = () => {
    return "w-full flex items-center justify-start gap-3 h-16 text-lg font-medium px-4 py-2 rounded-xl transition-all duration-300 hover:translate-y-[-2px] active:translate-y-[1px] shadow-sm hover:shadow-md";
  };

  const getVariantStyle = () => {
    // استخدام لون موحد لجميع الأزرار بغض النظر عن نوع الزر
    switch (variant) {
      case "default":
        return "bg-gradient-to-r from-[#ff9178] to-[#ff7d61] text-white hover:from-[#ff7d61] hover:to-[#ff6b4d] dark:glass-morphism";
      case "secondary":
        return "bg-gradient-to-r from-[#ff9178] to-[#ff7d61] text-white hover:from-[#ff7d61] hover:to-[#ff6b4d] dark:glass-morphism";
      case "outline":
        return "border-2 border-[#ffbcad] text-[#ff9178] hover:bg-[#fff5f2] dark:border-[#ff9178]/40 dark:text-[#ff9178] dark:hover:bg-[#ff9178]/10";
      default:
        return "";
    }
  };

  return (
    <Button 
      variant="ghost"
      onClick={onClick}
      disabled={disabled}
      size={size}
      className={`${getBaseStyle()} ${getVariantStyle()}`}
    >
      <Icon className="h-6 w-6 shrink-0" />
      <span>{label}</span>
    </Button>
  );
};

export default DashboardActionButton;
