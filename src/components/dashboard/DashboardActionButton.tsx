
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
  disabled = false,
  size = "default"
}: DashboardActionButtonProps) => {
  return (
    <Button 
      variant="default"
      onClick={onClick}
      disabled={disabled}
      size={size}
      className="w-full flex items-center justify-start gap-3 h-16 text-lg font-medium px-4 py-2 rounded-xl transition-all duration-300 hover:translate-y-[-2px] active:translate-y-[1px] shadow-sm hover:shadow-md bg-primary/10 border-2 border-primary/20 text-primary hover:bg-primary/15"
    >
      <Icon className="h-6 w-6 shrink-0" />
      <span>{label}</span>
    </Button>
  );
};

export default DashboardActionButton;
