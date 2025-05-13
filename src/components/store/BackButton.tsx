
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BackButtonProps {
  onClick?: () => void;
}

const BackButton = ({ onClick }: BackButtonProps) => {
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      window.history.back();
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      className="flex items-center text-muted-foreground hover:text-foreground"
      onClick={handleClick}
    >
      <ChevronRight className="mr-1 h-4 w-4" />
      العودة
    </Button>
  );
};

export default BackButton;
