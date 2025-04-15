
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Product } from "@/types/product";

interface ProductsTableProps {
  products: Product[];
  onEdit: (productId: string) => void;
  onDelete: (productId: string) => void;
}

const ProductsTable = ({ products, onEdit, onDelete }: ProductsTableProps) => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>اسم المنتج</TableHead>
            <TableHead>السعر</TableHead>
            <TableHead>التصنيف</TableHead>
            <TableHead>الإجراءات</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product.id}>
              <TableCell>{product.name}</TableCell>
              <TableCell>{product.price} دينار عراقي</TableCell>
              <TableCell>{product.category || "—"}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(product.id)}
                  >
                    <Edit className="h-4 w-4 ml-2" />
                    تعديل
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => onDelete(product.id)}
                  >
                    <Trash2 className="h-4 w-4 ml-2" />
                    حذف
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ProductsTable;
