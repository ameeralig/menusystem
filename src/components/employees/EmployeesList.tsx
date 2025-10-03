import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Trash2, Mail, Phone } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { Employee } from "@/types/employee";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";

interface EmployeesListProps {
  employees: Employee[];
  isLoading: boolean;
  onToggleStatus: (id: string, currentStatus: boolean) => Promise<boolean>;
  onDelete: (id: string) => Promise<boolean>;
}

const EmployeesList = ({ employees, isLoading, onToggleStatus, onDelete }: EmployeesListProps) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-10">
        <Spinner className="h-6 w-6 ml-2" />
        جاري تحميل البيانات...
      </div>
    );
  }

  if (employees.length === 0) {
    return (
      <div className="text-center py-10 text-muted-foreground">
        لم يتم إضافة أي موظفين بعد
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>الاسم</TableHead>
            <TableHead>البريد الإلكتروني</TableHead>
            <TableHead>رقم الهاتف</TableHead>
            <TableHead>الحالة</TableHead>
            <TableHead>تاريخ الإضافة</TableHead>
            <TableHead>نشط</TableHead>
            <TableHead>الإجراءات</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {employees.map((employee) => (
            <TableRow key={employee.id}>
              <TableCell className="font-medium">{employee.full_name}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  {employee.email}
                </div>
              </TableCell>
              <TableCell>
                {employee.phone ? (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    {employee.phone}
                  </div>
                ) : (
                  <span className="text-muted-foreground">غير متوفر</span>
                )}
              </TableCell>
              <TableCell>
                {employee.user_id ? (
                  <Badge variant="success" className="bg-green-500">
                    مسجل
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                    قيد الانتظار
                  </Badge>
                )}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {formatDistanceToNow(new Date(employee.created_at), {
                  addSuffix: true,
                  locale: ar
                })}
              </TableCell>
              <TableCell>
                <Switch
                  checked={employee.is_active}
                  onCheckedChange={() => onToggleStatus(employee.id, employee.is_active)}
                />
              </TableCell>
              <TableCell>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => onDelete(employee.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default EmployeesList;
