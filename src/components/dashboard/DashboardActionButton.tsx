import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";

interface DashboardActionButtonProps {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  variant?: "default" | "secondary" | "outline";
}

const DashboardActionButton = ({
  icon: Icon,
  label,
  onClick,
  variant = "default"
}: DashboardActionButtonProps) => {
  return (
    <Button variant={variant} className="w-48" onClick={onClick}>
      <Icon className="ml-2" />
      {label}
    </Button>
  );
};

export default DashboardActionButton;