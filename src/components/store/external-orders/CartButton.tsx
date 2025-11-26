import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";

interface CartButtonProps {
  onClick: () => void;
  colorTheme?: string | null;
}

const CartButton = ({ onClick, colorTheme }: CartButtonProps) => {
  const { items } = useCart();
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  if (itemCount === 0) return null;

  return (
    <Button
      onClick={onClick}
      className="fixed bottom-20 left-4 z-40 rounded-full h-14 w-14 shadow-lg"
      size="icon"
      style={{
        backgroundColor: colorTheme?.startsWith('#') ? colorTheme : undefined,
      }}
    >
      <ShoppingCart className="h-6 w-6" />
      {itemCount > 0 && (
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
          {itemCount}
        </span>
      )}
    </Button>
  );
};

export default CartButton;
