
import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";

interface DashboardActionButtonProps {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  variant?: "default" | "secondary" | "outline";
  disabled?: boolean;
  colorClass?: string;
}

const DashboardActionButton = ({
  icon: Icon,
  label,
  onClick,
  variant = "default",
  disabled = false,
  colorClass = ""
}: DashboardActionButtonProps) => {
  const getBaseStyle = () => {
    return "w-full flex items-center justify-start gap-3 h-16 text-lg font-medium px-4 py-2 rounded-xl transition-all duration-300 hover:translate-y-[-2px] active:translate-y-[1px] shadow-sm hover:shadow-md";
  };

  const getVariantStyle = () => {
    switch (variant) {
      case "default":
        return colorClass || "bg-gradient-to-r from-primary/90 to-primary/70 text-primary-foreground hover:from-primary hover:to-primary/80 dark:glass-morphism";
      case "secondary":
        return colorClass || "bg-gradient-to-r from-secondary/90 to-secondary/70 text-secondary-foreground hover:from-secondary hover:to-secondary/80 dark:glass-morphism"; 
      case "outline":
        return "border-2 border-border hover:bg-accent/50 dark:border-border dark:hover:bg-accent/10";
      default:
        return "";
    }
  };

  return (
    <Button 
      variant="ghost"
      onClick={onClick}
      disabled={disabled}
      className={`${getBaseStyle()} ${getVariantStyle()}`}
    >
      <Icon className="h-6 w-6 shrink-0" />
      <span>{label}</span>
    </Button>
  );
};

export default DashboardActionButton;
