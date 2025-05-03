
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import UsersList from "@/components/admin/users/UsersList";
import { User } from "@/components/admin/users/userTypes";

interface UsersTableProps {
  users: User[];
  isLoading: boolean;
  openActionDialog: (user: User, action: "ban" | "delete" | "role" | "message" | "approve") => void;
}

const UsersTable = ({ users, isLoading, openActionDialog }: UsersTableProps) => {
  return (
    <div className="rounded-md border overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>البريد الإلكتروني</TableHead>
            <TableHead>اسم المتجر</TableHead>
            <TableHead>رقم الهاتف</TableHead>
            <TableHead>الحالة</TableHead>
            <TableHead>آخر نشاط</TableHead>
            <TableHead>عدد الزوار</TableHead>
            <TableHead>عدد المنتجات</TableHead>
            <TableHead>الإجراءات</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <UsersList 
            users={users} 
            isLoading={isLoading} 
            openActionDialog={openActionDialog} 
          />
        </TableBody>
      </Table>
    </div>
  );
};

export default UsersTable;
