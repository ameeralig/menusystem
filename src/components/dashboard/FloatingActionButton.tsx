import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const FloatingActionButton = () => {
  const navigate = useNavigate();

  return (
    <Button
      onClick={() => navigate("/add-product")}
      className="fixed bottom-28 left-4 z-40 h-14 w-14 rounded-full glass-morphism border border-white/30 hover:border-white/50 hover:scale-110 active:scale-95 transition-all duration-300 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]"
      size="icon"
    >
      <Plus className="h-6 w-6 text-primary" />
    </Button>
  );
};

export default FloatingActionButton;