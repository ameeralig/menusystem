
import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";

interface DashboardActionButtonProps {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  variant?: "default" | "secondary" | "outline";
  disabled?: boolean;
  colorClass?: string;
  size?: "sm" | "default" | "lg" | "icon";
}

const DashboardActionButton = ({
  icon: Icon,
  label,
  onClick,
  variant = "default",
  disabled = false,
  colorClass = "",
  size = "default"
}: DashboardActionButtonProps) => {
  const getBaseStyle = () => {
    return "w-full flex items-center justify-start gap-3 h-16 text-lg font-medium px-4 py-2 rounded-xl transition-all duration-300 hover:translate-y-[-2px] active:translate-y-[1px] shadow-sm hover:shadow-md";
  };

  const getVariantStyle = () => {
    // استخدام لون موحد لجميع الأزرار بغض النظر عن نوع الزر
    switch (variant) {
      case "default":
        return "bg-gradient-to-r from-purple-600 to-purple-500 text-white hover:from-purple-700 hover:to-purple-600 dark:glass-morphism";
      case "secondary":
        return "bg-gradient-to-r from-purple-600 to-purple-500 text-white hover:from-purple-700 hover:to-purple-600 dark:glass-morphism";
      case "outline":
        return "border-2 border-purple-300 text-purple-600 hover:bg-purple-50 dark:border-purple-700 dark:text-purple-400 dark:hover:bg-purple-900/20";
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
