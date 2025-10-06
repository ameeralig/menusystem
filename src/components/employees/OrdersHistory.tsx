import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Receipt, Eye, Calendar, DollarSign } from "lucide-react";
import { Order, OrderItem } from "@/types/employee";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import OrderInvoice from "./OrderInvoice";

interface OrdersHistoryProps {
  orders: any[];
  onRefresh: () => void;
}

const OrdersHistory = ({ orders, onRefresh }: OrdersHistoryProps) => {
  const [selectedOrder, setSelectedOrder] = useState<{ order: Order; items: OrderItem[] } | null>(null);
  const [showInvoice, setShowInvoice] = useState(false);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: "قيد الانتظار", variant: "secondary" as const },
      preparing: { label: "قيد التحضير", variant: "default" as const },
      ready: { label: "جاهز", variant: "default" as const },
      completed: { label: "مكتمل", variant: "default" as const },
      cancelled: { label: "ملغي", variant: "destructive" as const },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const handleViewInvoice = (order: any) => {
    setSelectedOrder({
      order: order,
      items: order.order_items || [],
    });
    setShowInvoice(true);
  };

  const handlePrintInvoice = () => {
    window.print();
  };

  if (orders.length === 0) {
    return (
      <Card className="p-8">
        <div className="text-center space-y-4">
          <Receipt className="h-16 w-16 mx-auto text-muted-foreground" />
          <div>
            <h3 className="text-lg font-semibold">لا توجد طلبات</h3>
            <p className="text-sm text-muted-foreground mt-2">
              لم تقم بإنشاء أي طلبات بعد
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">سجل الطلبات</h3>
          <Badge variant="secondary">{orders.length} طلب</Badge>
        </div>

        <ScrollArea className="h-[calc(100vh-250px)]">
          <div className="space-y-3 pr-4">
            {orders.map((order) => (
              <Card key={order.id} className="p-4 hover:shadow-md transition-shadow">
                <div className="space-y-3">
                  {/* رأس الطلب */}
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Receipt className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">
                          #{order.id.slice(0, 8)}
                        </span>
                        {getStatusBadge(order.status)}
                      </div>
                      
                      {order.table_number && (
                        <p className="text-sm text-muted-foreground">
                          الطاولة: {order.table_number}
                        </p>
                      )}
                      
                      {order.customer_name && (
                        <p className="text-sm text-muted-foreground">
                          العميل: {order.customer_name}
                        </p>
                      )}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewInvoice(order)}
                    >
                      <Eye className="h-4 w-4 ml-2" />
                      عرض
                    </Button>
                  </div>

                  {/* تفاصيل الطلب */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        {format(new Date(order.created_at), "dd/MM/yyyy - hh:mm a", { locale: ar })}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm justify-end">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      <span className="font-bold text-green-600">
                        {Number(order.final_amount).toFixed(0)} د.ع
                      </span>
                    </div>
                  </div>

                  {/* عدد العناصر */}
                  <div className="text-xs text-muted-foreground">
                    {order.order_items?.length || 0} عنصر
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* نافذة الفاتورة */}
      <Dialog open={showInvoice} onOpenChange={setShowInvoice}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-right">الفاتورة</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[70vh]">
            {selectedOrder && (
              <OrderInvoice
                order={selectedOrder.order}
                items={selectedOrder.items}
                onPrint={handlePrintInvoice}
              />
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default OrdersHistory;
