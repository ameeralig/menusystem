
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
      variant="ghost"
      onClick={onClick}
      disabled={disabled}
      size={size}
      className="group w-full flex flex-col items-center justify-center gap-2 h-20 md:h-24 p-3 rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-lg active:scale-95 border border-border/40 hover:border-primary/30 bg-card/30 hover:bg-primary/5 disabled:opacity-50 disabled:hover:scale-100"
    >
      <div className="p-2 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors duration-300">
        <Icon className="h-5 w-5 md:h-6 md:w-6 shrink-0 text-primary group-hover:text-primary transition-colors duration-300" />
      </div>
      <span className="text-xs md:text-sm font-medium text-center leading-tight text-foreground group-hover:text-primary transition-colors duration-300">
        {label}
      </span>
    </Button>
  );
};

export default DashboardActionButton;
