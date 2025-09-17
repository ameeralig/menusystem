import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const FloatingActionButton = () => {
  const navigate = useNavigate();

  return (
    <Button
      onClick={() => navigate("/add-product")}
      className="fixed bottom-20 left-4 md:bottom-6 md:left-6 z-40 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 bg-primary hover:bg-primary/90 hover:scale-110 active:scale-95"
      size="icon"
    >
      <Plus className="h-6 w-6 text-primary-foreground" />
    </Button>
  );
};

export default FloatingActionButton;