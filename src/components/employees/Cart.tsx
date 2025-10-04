import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Minus, Plus, Trash2, ShoppingCart } from "lucide-react";
import { CartItem } from "@/hooks/employees/useCart";
import { ScrollArea } from "@/components/ui/scroll-area";

interface CartProps {
  items: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onUpdateNotes: (productId: string, notes: string) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
  total: number;
}

const Cart = ({ items, onUpdateQuantity, onUpdateNotes, onRemoveItem, onClearCart, total }: CartProps) => {
  if (items.length === 0) {
    return (
      <Card className="p-6">
        <div className="text-center space-y-4">
          <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground" />
          <p className="text-muted-foreground">السلة فارغة</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-lg">السلة</h3>
        <Button variant="ghost" size="sm" onClick={onClearCart}>
          <Trash2 className="h-4 w-4 ml-2" />
          إفراغ السلة
        </Button>
      </div>

      <ScrollArea className="max-h-[calc(100vh-400px)] mb-4">
        <div className="space-y-4 pr-4">
          {items.map((item) => (
            <Card key={item.product.id} className="p-3">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-medium">{item.product.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {Number(item.product.price).toFixed(0)} د.ع
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemoveItem(item.product.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => onUpdateQuantity(item.product.id, parseInt(e.target.value) || 1)}
                    className="w-20 text-center"
                    min="1"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                  <p className="text-sm font-medium mr-auto">
                    {(Number(item.product.price) * item.quantity).toFixed(0)} د.ع
                  </p>
                </div>

                <Textarea
                  placeholder="ملاحظات (اختياري)"
                  value={item.notes || ""}
                  onChange={(e) => onUpdateNotes(item.product.id, e.target.value)}
                  className="text-right text-sm"
                  rows={2}
                />
              </div>
            </Card>
          ))}
        </div>
      </ScrollArea>

      <div className="border-t pt-4 mt-4">
        <div className="flex items-center justify-between text-lg font-bold">
          <span>الإجمالي:</span>
          <span>{total.toFixed(0)} د.ع</span>
        </div>
      </div>
    </Card>
  );
};

export default Cart;
