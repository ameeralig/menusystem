import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogOut, ShoppingCart, ClipboardList } from "lucide-react";
import { Employee, Table } from "@/types/employee";
import { useTables } from "@/hooks/employees/useTables";
import { useCart } from "@/hooks/employees/useCart";
import Cart from "./Cart";
import { Product } from "@/types/product";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

interface EmployeePanelProps {
  employee: Employee;
  onLogout: () => void;
  products: Product[];
  storeOwnerId: string;
}

const EmployeePanel = ({ employee, onLogout, products, storeOwnerId }: EmployeePanelProps) => {
  const { tables, isLoading: tablesLoading } = useTables();
  const { items, addItem, updateQuantity, updateNotes, removeItem, clearCart, getTotal } = useCart();
  const [selectedTable, setSelectedTable] = useState<string>("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");

  const availableProducts = products.filter(p => p.is_available);

  return (
    <div className="fixed top-0 left-0 right-0 bg-background border-b shadow-sm z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="text-sm">
              <p className="font-medium">{employee.full_name}</p>
              <p className="text-muted-foreground text-xs">موظف</p>
            </div>
            <Button variant="ghost" size="sm" onClick={onLogout}>
              <LogOut className="h-4 w-4 ml-2" />
              تسجيل خروج
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm">
                  <ShoppingCart className="h-4 w-4 ml-2" />
                  السلة ({items.length})
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full sm:max-w-lg">
                <SheetHeader>
                  <SheetTitle className="text-right">السلة</SheetTitle>
                </SheetHeader>
                <div className="mt-6 space-y-4">
                  <Cart
                    items={items}
                    onUpdateQuantity={updateQuantity}
                    onUpdateNotes={updateNotes}
                    onRemoveItem={removeItem}
                    onClearCart={clearCart}
                    total={getTotal()}
                  />
                  
                  {items.length > 0 && (
                    <Card className="p-4 space-y-4">
                      <div className="space-y-2">
                        <Label>الطاولة</Label>
                        <Select value={selectedTable} onValueChange={setSelectedTable}>
                          <SelectTrigger>
                            <SelectValue placeholder="اختر الطاولة" />
                          </SelectTrigger>
                          <SelectContent>
                            {tables
                              .filter(t => !t.is_occupied)
                              .map((table) => (
                                <SelectItem key={table.id} value={table.id}>
                                  طاولة {table.table_number}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>اسم الزبون (اختياري)</Label>
                        <Input
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          placeholder="اسم الزبون"
                          className="text-right"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>رقم الهاتف (اختياري)</Label>
                        <Input
                          value={customerPhone}
                          onChange={(e) => setCustomerPhone(e.target.value)}
                          placeholder="رقم الهاتف"
                          className="text-right"
                        />
                      </div>

                      <Button className="w-full" disabled={!selectedTable}>
                        <ClipboardList className="h-4 w-4 ml-2" />
                        إنشاء طلب
                      </Button>
                    </Card>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeePanel;
