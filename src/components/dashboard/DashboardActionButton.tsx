import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";

interface DashboardActionButtonProps {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  variant?: "default" | "secondary" | "outline";
  disabled?: boolean;
}

const DashboardActionButton = ({
  icon: Icon,
  label,
  onClick,
  variant = "default",
  disabled = false
}: DashboardActionButtonProps) => {
  return (
    <Button 
      variant={variant} 
      className="w-full h-16 text-lg font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]" 
      onClick={onClick}
      disabled={disabled}
    >
      <Icon className="ml-2 h-5 w-5" />
      {label}
    </Button>
  );
};

export default DashboardActionButton;