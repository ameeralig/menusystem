import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogOut, ShoppingCart, ClipboardList, History } from "lucide-react";
import { Employee } from "@/types/employee";
import { useTables } from "@/hooks/employees/useTables";
import { useCart } from "@/contexts/CartContext";
import { useOrders } from "@/hooks/employees/useOrders";
import Cart from "./Cart";
import OrderInvoice from "./OrderInvoice";
import OrdersHistory from "./OrdersHistory";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface EmployeePanelProps {
  employee: Employee;
  onLogout: () => void;
  storeOwnerId: string;
}

const EmployeePanel = ({ employee, onLogout, storeOwnerId }: EmployeePanelProps) => {
  const { tables, isLoading: tablesLoading } = useTables(storeOwnerId);
  const { items, updateQuantity, updateNotes, removeItem, clearCart, getTotal } = useCart();
  const { createOrder, getOrderWithItems, getEmployeeOrders, isCreating } = useOrders();
  const [selectedTable, setSelectedTable] = useState<string>("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [currentOrder, setCurrentOrder] = useState<any>(null);
  const [showInvoice, setShowInvoice] = useState(false);
  const [employeeOrders, setEmployeeOrders] = useState<any[]>([]);
  const [showOrdersHistory, setShowOrdersHistory] = useState(false);

  // جلب طلبات الموظف
  useEffect(() => {
    if (employee?.id) {
      loadEmployeeOrders();
    }
  }, [employee?.id]);

  const loadEmployeeOrders = async () => {
    if (employee?.id) {
      const orders = await getEmployeeOrders(employee.id);
      setEmployeeOrders(orders || []);
    }
  };

  

  const handleCreateOrder = async () => {
    if (!selectedTable || items.length === 0) return;

    const order = await createOrder(
      storeOwnerId,
      employee.id,
      selectedTable,
      items,
      customerName || undefined,
      customerPhone || undefined
    );

    if (order) {
      // جلب الطلب مع العناصر
      const orderData = await getOrderWithItems(order.id);
      if (orderData) {
        setCurrentOrder(orderData);
        setShowInvoice(true);
        clearCart();
        setSelectedTable("");
        setCustomerName("");
        setCustomerPhone("");
        // تحديث قائمة الطلبات
        loadEmployeeOrders();
      }
    }
  };

  const handlePrintInvoice = () => {
    window.print();
  };

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
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowOrdersHistory(true)}
            >
              <History className="h-4 w-4 ml-2" />
              السجل ({employeeOrders.length})
            </Button>

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

                      <Button 
                        className="w-full" 
                        disabled={!selectedTable || isCreating}
                        onClick={handleCreateOrder}
                      >
                        <ClipboardList className="h-4 w-4 ml-2" />
                        {isCreating ? "جاري الإنشاء..." : "إنشاء طلب"}
                      </Button>
                    </Card>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      {/* نافذة الفاتورة */}
      <Dialog open={showInvoice} onOpenChange={setShowInvoice}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-right">الفاتورة</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[70vh]">
            {currentOrder && (
              <OrderInvoice
                order={currentOrder.order}
                items={currentOrder.items}
                onPrint={handlePrintInvoice}
              />
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* نافذة سجل الطلبات */}
      <Dialog open={showOrdersHistory} onOpenChange={setShowOrdersHistory}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="text-right">سجل الطلبات</DialogTitle>
          </DialogHeader>
          <OrdersHistory
            orders={employeeOrders}
            onRefresh={loadEmployeeOrders}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EmployeePanel;
