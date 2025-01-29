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
        bg-gradient-to-r
        ${variant === 'default' ? 'from-[#9b87f5] to-[#7E69AB] hover:from-[#8b77e5] hover:to-[#6E59A5] text-white' : 
          variant === 'secondary' ? 'from-[#E5DEFF] to-[#D6BCFA] hover:from-[#D5CEFF] hover:to-[#C6ACFA] text-[#6E59A5]' :
          'border-2 border-[#9b87f5] text-[#6E59A5] hover:bg-[#E5DEFF]'}
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