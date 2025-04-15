
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Star, TrendingUp } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Product } from "@/types/product";
import { Badge } from "@/components/ui/badge";

interface ProductsTableProps {
  products: Product[];
  onEdit: (productId: string) => void;
  onDelete: (productId: string) => void;
}

const ProductsTable = ({ products, onEdit, onDelete }: ProductsTableProps) => {
  return (
    <div className="rounded-md border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>اسم المنتج</TableHead>
            <TableHead className="hidden md:table-cell">السعر</TableHead>
            <TableHead className="hidden md:table-cell">التصنيف</TableHead>
            <TableHead className="hidden sm:table-cell">الخصائص</TableHead>
            <TableHead>الإجراءات</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product.id}>
              <TableCell className="font-medium">{product.name}</TableCell>
              <TableCell className="hidden md:table-cell">{product.price.toLocaleString()} د.ع</TableCell>
              <TableCell className="hidden md:table-cell">
                {product.category ? (
                  <Badge variant="outline" className="text-xs">
                    {product.category}
                  </Badge>
                ) : "—"}
              </TableCell>
              <TableCell className="hidden sm:table-cell">
                <div className="flex flex-wrap gap-1">
                  {product.is_new && (
                    <Badge variant="secondary" className="bg-yellow-500/90 text-white border-none text-xs">
                      <Star className="h-3 w-3 ml-1" />
                      جديد
                    </Badge>
                  )}
                  {product.is_popular && (
                    <Badge variant="secondary" className="bg-red-500/90 text-white border-none text-xs">
                      <TrendingUp className="h-3 w-3 ml-1" />
                      شائع
                    </Badge>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(product.id);
                    }}
                    className="h-8 text-xs"
                  >
                    <Edit className="h-3.5 w-3.5 ml-1" />
                    تعديل
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(product.id);
                    }}
                    className="h-8 text-xs"
                  >
                    <Trash2 className="h-3.5 w-3.5 ml-1" />
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
