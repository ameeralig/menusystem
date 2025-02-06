
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
      className={`
        w-full h-20 text-lg font-medium 
        transition-all duration-300 
        hover:scale-[1.02] hover:shadow-lg 
        active:scale-[0.98]
        rounded-xl
        bg-gradient-to-r dark:glass-morphism
        ${variant === 'default' ? 'from-[#9b87f5] to-[#7E69AB] hover:from-[#8b77e5] hover:to-[#6E59A5] text-white dark:from-background dark:to-background/90 dark:border dark:border-white/10 dark:text-white' : 
          variant === 'secondary' ? 'from-[#E5DEFF] to-[#D6BCFA] hover:from-[#D5CEFF] hover:to-[#C6ACFA] text-[#6E59A5] dark:from-background dark:to-background/90 dark:border dark:border-white/10 dark:text-white' :
          'border-2 border-[#9b87f5] text-[#6E59A5] dark:border-white/20 dark:text-white hover:bg-white/5'}
      `}
      onClick={onClick}
      disabled={disabled}
    >
      <Icon className="mr-3 h-6 w-6" />
      {label}
    </Button>
  );
};

export default DashboardActionButton;
