import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2, Users } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { Table } from "@/types/employee";

interface TablesListProps {
  tables: Table[];
  isLoading: boolean;
  onDelete: (id: string) => Promise<boolean>;
}

const TablesList = ({ tables, isLoading, onDelete }: TablesListProps) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-10">
        <Spinner className="h-6 w-6 ml-2" />
        جاري تحميل البيانات...
      </div>
    );
  }

  if (tables.length === 0) {
    return (
      <div className="text-center py-10 text-muted-foreground">
        لم يتم إضافة أي طاولات بعد
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {tables.map((table) => (
        <Card key={table.id} className={table.is_occupied ? "border-orange-500" : ""}>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-2xl font-bold">طاولة {table.table_number}</h3>
                <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>{table.capacity} أشخاص</span>
                </div>
              </div>
              <Badge variant={table.is_occupied ? "destructive" : "success"}>
                {table.is_occupied ? "مشغولة" : "متاحة"}
              </Badge>
            </div>

            <div className="flex justify-end">
              <Button
                size="sm"
                variant="destructive"
                onClick={() => onDelete(table.id)}
                disabled={table.is_occupied}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default TablesList;
