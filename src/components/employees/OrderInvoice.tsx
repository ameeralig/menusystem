import { Order, OrderItem } from "@/types/employee";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Printer, Download } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

interface OrderInvoiceProps {
  order: Order;
  items: OrderItem[];
  storeName?: string;
  onPrint: () => void;
}

const OrderInvoice = ({ order, items, storeName, onPrint }: OrderInvoiceProps) => {
  return (
    <Card className="p-6 space-y-6" id="invoice-content">
      {/* رأس الفاتورة */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-foreground">{storeName || "المتجر"}</h2>
        <p className="text-sm text-muted-foreground">فاتورة رقم: {order.id.slice(0, 8)}</p>
        <p className="text-sm text-muted-foreground">
          {format(new Date(order.created_at), "dd MMMM yyyy - hh:mm a", { locale: ar })}
        </p>
      </div>

      <Separator />

      {/* معلومات الطلب */}
      <div className="grid grid-cols-2 gap-4 text-sm">
        {order.table_number && (
          <div>
            <span className="text-muted-foreground">الطاولة: </span>
            <span className="font-medium">{order.table_number}</span>
          </div>
        )}
        {order.customer_name && (
          <div>
            <span className="text-muted-foreground">العميل: </span>
            <span className="font-medium">{order.customer_name}</span>
          </div>
        )}
        {order.customer_phone && (
          <div>
            <span className="text-muted-foreground">الهاتف: </span>
            <span className="font-medium">{order.customer_phone}</span>
          </div>
        )}
        <div>
          <span className="text-muted-foreground">الحالة: </span>
          <span className="font-medium">
            {order.status === "pending" && "قيد الانتظار"}
            {order.status === "preparing" && "قيد التحضير"}
            {order.status === "ready" && "جاهز"}
            {order.status === "completed" && "مكتمل"}
            {order.status === "cancelled" && "ملغي"}
          </span>
        </div>
      </div>

      <Separator />

      {/* عناصر الطلب */}
      <div className="space-y-3">
        <h3 className="font-semibold">العناصر</h3>
        <div className="space-y-2">
          {items.map((item) => (
            <div key={item.id} className="flex items-start justify-between text-sm">
              <div className="flex-1">
                <p className="font-medium">{item.product_name}</p>
                {item.notes && (
                  <p className="text-xs text-muted-foreground">ملاحظة: {item.notes}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  {item.quantity} × {Number(item.unit_price).toFixed(2)} ر.س
                </p>
              </div>
              <span className="font-medium">{Number(item.subtotal).toFixed(2)} ر.س</span>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* الإجمالي */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">المجموع الفرعي</span>
          <span>{Number(order.total_amount).toFixed(2)} ر.س</span>
        </div>
        
        {order.tax_amount > 0 && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">الضريبة</span>
            <span>{Number(order.tax_amount).toFixed(2)} ر.س</span>
          </div>
        )}
        
        {order.discount_amount > 0 && (
          <div className="flex items-center justify-between text-sm text-green-600">
            <span>الخصم</span>
            <span>-{Number(order.discount_amount).toFixed(2)} ر.س</span>
          </div>
        )}
        
        <Separator />
        
        <div className="flex items-center justify-between text-lg font-bold">
          <span>الإجمالي</span>
          <span className="text-primary">{Number(order.final_amount).toFixed(2)} ر.س</span>
        </div>
      </div>

      {/* أزرار الطباعة */}
      <div className="flex gap-2 pt-4">
        <Button onClick={onPrint} className="flex-1">
          <Printer className="h-4 w-4 ml-2" />
          طباعة
        </Button>
      </div>
    </Card>
  );
};

export default OrderInvoice;
